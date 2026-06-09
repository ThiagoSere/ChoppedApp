import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PoseCamera from '../components/pose/PoseCamera';
import PoseFeedback from '../components/pose/PoseFeedback';
import { usePoseTracking } from '../hooks/UsePoseTracking';
import '../styles/TechniquePage.css';

const STORAGE_KEY = 'chopped_technique_history_v1';

// Umbral de fases para conteo de repeticiones por modo
const PHASE_THRESHOLDS = {
  squat:         { down: 100, up: 150 },
  lunge:         { down: 100, up: 150 },
  curl:          { down: 65,  up: 145 },
  press:         { down: 90,  up: 150 },
  tricep:        { down: 65,  up: 150 },
  row:           { down: 55,  up: 130 },
  shoulderpress: { down: 85,  up: 155 },
};

const MODE_LABELS = {
  squat:         'Sentadilla',
  lunge:         'Estocada (cuadriceps)',
  curl:          'Curl de biceps',
  press:         'Press de pecho',
  tricep:        'Extension de triceps',
  row:           'Remo (espalda)',
  shoulderpress: 'Press de hombros',
};

function safeNumber(value) {
  return Number.isFinite(value) ? value : null;
}

function avg(values) {
  if (!values.length) return null;
  return values.reduce((acc, n) => acc + n, 0) / values.length;
}

// Extrae el ángulo primario relevante para cada modo
function getAngleForMode(angles, mode) {
  if (!angles) return null;
  let left = null;
  let right = null;

  if (['curl', 'press', 'tricep'].includes(mode)) {
    left  = safeNumber(angles.leftElbow);
    right = safeNumber(angles.rightElbow);
  } else if (['squat', 'lunge'].includes(mode)) {
    left  = safeNumber(angles.leftKnee);
    right = safeNumber(angles.rightKnee);
  } else if (['row', 'shoulderpress'].includes(mode)) {
    left  = safeNumber(angles.leftShoulder);
    right = safeNumber(angles.rightShoulder);
  }

  if (left == null && right == null) return null;
  if (left == null) return right;
  if (right == null) return left;
  return Math.round((left + right) / 2);
}

// Cards de ángulos a mostrar según el modo activo
function getAngleDisplays(mode, angles) {
  if (!angles) return [];
  if (['curl', 'press', 'tricep'].includes(mode)) {
    return [
      { label: 'Codo izq.', joint: 'elbow', angle: angles.leftElbow },
      { label: 'Codo der.', joint: 'elbow', angle: angles.rightElbow },
    ];
  }
  if (['squat', 'lunge'].includes(mode)) {
    return [
      { label: 'Rodilla izq.', joint: 'knee', angle: angles.leftKnee },
      { label: 'Rodilla der.', joint: 'knee', angle: angles.rightKnee },
    ];
  }
  if (['row', 'shoulderpress'].includes(mode)) {
    return [
      { label: 'Hombro izq.', joint: 'shoulder', angle: angles.leftShoulder },
      { label: 'Hombro der.', joint: 'shoulder', angle: angles.rightShoulder },
    ];
  }
  return [];
}

function criteriaFor(mode, angle) {
  if (angle == null) return { status: 'idle', message: 'No detectado' };

  switch (mode) {
    case 'squat':
    case 'lunge':
      if (angle > 155) return { status: 'warn',  message: 'Baja mas para trabajar bien' };
      if (angle > 120) return { status: 'info',  message: 'Vas bien, baja un poco mas' };
      if (angle >= 80 && angle <= 120) return { status: 'good', message: 'Profundidad correcta' };
      if (angle < 70)  return { status: 'warn',  message: 'Muy profundo, cuida la tecnica' };
      return { status: 'good', message: 'Buen rango de movimiento' };

    case 'curl':
      if (angle > 150) return { status: 'info', message: 'Brazo extendido correctamente' };
      if (angle >= 70 && angle <= 150) return { status: 'info', message: 'Sigue el recorrido' };
      if (angle < 60)  return { status: 'good', message: 'Curl completo' };
      return { status: 'info', message: 'Movimiento estable' };

    case 'press':
      if (angle > 160) return { status: 'info', message: 'Brazos extendidos - baja controlado' };
      if (angle >= 90 && angle <= 160) return { status: 'info', message: 'Bajando - mantene el control' };
      if (angle >= 70 && angle < 90) return { status: 'good', message: 'Rango completo de pecho' };
      if (angle < 60)  return { status: 'warn', message: 'Muy profundo, cuida los hombros' };
      return { status: 'info', message: 'Movimiento estable' };

    case 'tricep':
      if (angle > 155) return { status: 'good', message: 'Extension completa del triceps' };
      if (angle >= 80 && angle <= 155) return { status: 'info', message: 'Extendiendo...' };
      if (angle < 65)  return { status: 'good', message: 'Contraccion completa' };
      return { status: 'info', message: 'Movimiento en progreso' };

    case 'row':
      if (angle < 55)  return { status: 'good', message: 'Tiron completo - gran contraccion dorsal' };
      if (angle >= 55 && angle <= 120) return { status: 'info', message: 'Sigue tirando hacia atras' };
      if (angle > 140) return { status: 'info', message: 'Brazo extendido - inicia el tiron' };
      return { status: 'info', message: 'Movimiento en progreso' };

    case 'shoulderpress':
      if (angle > 155) return { status: 'good', message: 'Press completo - brazos extendidos' };
      if (angle >= 85 && angle <= 155) return { status: 'info', message: 'Empujando hacia arriba...' };
      if (angle < 85)  return { status: 'good', message: 'Posicion inicial correcta' };
      return { status: 'info', message: 'Movimiento en progreso' };

    default:
      return { status: 'info', message: 'Movimiento estable' };
  }
}

export default function TechniquePage() {
  const navigate = useNavigate();

  const [mode, setMode] = useState('squat');
  const [trackingEnabled, setTrackingEnabled] = useState(false);
  const [modelLoading, setModelLoading] = useState(false);
  const [angles, setAngles] = useState(null);
  const [trackingError, setTrackingError] = useState('');
  const [history, setHistory] = useState([]);

  const modelReadyRef = useRef(false);
  const repCountRef   = useRef(0);
  const phaseRef      = useRef('up');
  const startedAtRef  = useRef(0);
  const samplesRef    = useRef([]);

  // Resetear estado al cambiar de ejercicio
  useEffect(() => {
    repCountRef.current = 0;
    phaseRef.current    = 'up';
    samplesRef.current  = [];
    setAngles(null);
  }, [mode]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      setHistory(Array.isArray(parsed) ? parsed : []);
    } catch {
      setHistory([]);
    }
  }, []);

  const selectedPrimaryAngle = useMemo(
    () => getAngleForMode(angles, mode),
    [angles, mode]
  );

  const currentCriteria = useMemo(
    () => criteriaFor(mode, selectedPrimaryAngle),
    [mode, selectedPrimaryAngle]
  );

  const handleAngles = useCallback(
    (newAngles) => {
      if (!modelReadyRef.current) {
        modelReadyRef.current = true;
        setModelLoading(false);
      }

      setAngles(newAngles);

      const currentAngle = getAngleForMode(newAngles, mode);
      if (currentAngle == null) return;

      samplesRef.current.push(currentAngle);

      const { down, up } = PHASE_THRESHOLDS[mode] ?? { down: 90, up: 150 };

      if (currentAngle < down && phaseRef.current === 'up') {
        phaseRef.current = 'down';
      } else if (currentAngle > up && phaseRef.current === 'down') {
        phaseRef.current = 'up';
        repCountRef.current += 1;
      }
    },
    [mode]
  );

  const handleReady = useCallback(() => { setModelLoading(false); }, []);

  const handleError = useCallback((message) => {
    setTrackingError(message || 'No se pudo iniciar la camara o el modelo');
    setModelLoading(false);
    setTrackingEnabled(false);
  }, []);

  const { videoRef, canvasRef } = usePoseTracking({
    enabled: trackingEnabled,
    onAngles: handleAngles,
    onReady: handleReady,
    onError: handleError,
  });

  const persistHistory = (next) => {
    setHistory(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const saveCurrentAnalysis = () => {
    const valid = samplesRef.current.filter((n) => Number.isFinite(n));
    if (!valid.length) return;

    const average  = avg(valid);
    const min      = Math.min(...valid);
    const max      = Math.max(...valid);
    const goodFrames = valid.filter((a) => criteriaFor(mode, a).status === 'good').length;
    const durationSec = Math.max(1, Math.round((Date.now() - startedAtRef.current) / 1000));

    const item = {
      id: `${Date.now()}`,
      createdAt: new Date().toISOString(),
      mode,
      durationSec,
      reps: repCountRef.current,
      avgAngle: Math.round(average),
      minAngle: Math.round(min),
      maxAngle: Math.round(max),
      goodPercent: Math.round((goodFrames / valid.length) * 100),
      lastMessage: currentCriteria.message,
    };

    persistHistory([item, ...history].slice(0, 30));
  };

  const startTracking = () => {
    setTrackingError('');
    setModelLoading(true);
    setAngles(null);
    modelReadyRef.current  = false;
    repCountRef.current    = 0;
    phaseRef.current       = 'up';
    samplesRef.current     = [];
    startedAtRef.current   = Date.now();
    setTrackingEnabled(true);
  };

  const stopTracking = () => {
    setTrackingEnabled(false);
    setModelLoading(false);
    if (samplesRef.current.length > 0) saveCurrentAnalysis();
  };

  const angleDisplays = useMemo(
    () => getAngleDisplays(mode, angles),
    [mode, angles]
  );

  return (
    <div className="technique-page">
      <div className="technique-card">
        <div className="technique-header">
          <h1>Correccion de tecnica</h1>
          <button className="technique-back-btn" onClick={() => navigate('/dashboard')}>
            Volver al dashboard
          </button>
        </div>

        <p className="technique-subtitle">
          Elige ejercicio y pulsa iniciar. Te damos feedback en tiempo real y guardamos el analisis
          dentro de esta pestana.
        </p>

        <div className="technique-controls">
          <label>
            Ejercicio a corregir
            <select value={mode} onChange={(e) => setMode(e.target.value)} disabled={trackingEnabled}>
              <option value="squat">Sentadilla</option>
              <option value="lunge">Estocada (cuadriceps)</option>
              <option value="curl">Curl de biceps</option>
              <option value="press">Press de pecho</option>
              <option value="tricep">Extension de triceps</option>
              <option value="row">Remo (espalda)</option>
              <option value="shoulderpress">Press de hombros</option>
            </select>
          </label>

          {!trackingEnabled ? (
            <button className="technique-toggle-btn" onClick={startTracking}>
              Iniciar correccion de tecnica
            </button>
          ) : (
            <button className="technique-stop-btn" onClick={stopTracking}>
              Detener y guardar analisis
            </button>
          )}
        </div>

        {trackingError && <p className="error-msg">{trackingError}</p>}

        {trackingEnabled ? (
          <>
            <PoseCamera videoRef={videoRef} canvasRef={canvasRef} loading={modelLoading} />

            <div className="angles-grid">
              {angleDisplays.map((d) => (
                <PoseFeedback key={d.label} label={d.label} joint={d.joint} angle={d.angle} />
              ))}
            </div>

            <div className="technique-live-panel">
              <div>
                <span className="k">Repeticiones detectadas</span>
                <strong>{repCountRef.current}</strong>
              </div>
              <div>
                <span className="k">Criterio actual</span>
                <strong>{currentCriteria.message}</strong>
              </div>
            </div>
          </>
        ) : (
          <div className="technique-empty">
            <p>Pulsa "Iniciar correccion de tecnica" para comenzar.</p>
          </div>
        )}

        <section className="technique-history">
          <div className="technique-history-head">
            <h2>Historial de correcciones</h2>
            {history.length > 0 && (
              <button className="clear-history-btn" onClick={() => persistHistory([])}>
                Limpiar historial
              </button>
            )}
          </div>

          {history.length === 0 ? (
            <p className="history-empty">Aun no hay analisis guardados.</p>
          ) : (
            <div className="history-list">
              {history.map((h) => (
                <article key={h.id} className="history-item">
                  <div className="history-top">
                    <strong>{MODE_LABELS[h.mode] ?? h.mode}</strong>
                    <span>{new Date(h.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="history-metrics">
                    <span>Duracion: {h.durationSec}s</span>
                    <span>Reps: {h.reps}</span>
                    <span>Angulo prom: {h.avgAngle}°</span>
                    <span>Min/Max: {h.minAngle}° / {h.maxAngle}°</span>
                    <span>Frames correctos: {h.goodPercent}%</span>
                  </div>
                  <p className="history-note">Ultimo feedback: {h.lastMessage}</p>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

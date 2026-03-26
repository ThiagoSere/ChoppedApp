import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import '../styles/TrainWorkout.css';

export default function TrainWorkoutPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [workout, setWorkout] = useState(null);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadWorkout = async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await api.get(`/workouts/${id}`);
        setWorkout(data);

        const initEntries = (data.exercises || []).map((ex) => ({
          exerciseId: ex.exerciseId,
          name: ex.name,
          done: false,
          repsDone: 0,
          weightKg: 0,
          gifUrl: ex.gifUrl || '',
        }));
        setEntries(initEntries);
      } catch (err) {
        const msg = err?.response?.data?.message;
        setError(Array.isArray(msg) ? msg.join(', ') : msg || 'No se pudo cargar la rutina');
      } finally {
        setLoading(false);
      }
    };

    loadWorkout();
  }, [id]);

  const completedCount = useMemo(
    () => entries.filter((e) => e.done).length,
    [entries],
  );

  const allDone = entries.length > 0 && completedCount === entries.length;

  const toggleDone = (exerciseId) => {
    setEntries((prev) =>
      prev.map((e) =>
        e.exerciseId === exerciseId ? { ...e, done: !e.done } : e,
      ),
    );
  };

  const updateEntry = (exerciseId, field, value) => {
    setEntries((prev) =>
      prev.map((e) =>
        e.exerciseId === exerciseId
          ? { ...e, [field]: Number(value) }
          : e,
      ),
    );
  };

  const finishTraining = async () => {
    if (!allDone) {
      setError('Debes marcar todos los ejercicios para terminar el entrenamiento');
      return;
    }

    setFinishing(true);
    setError('');
    try {
      await api.post('/training-sessions/complete', {
        workoutId: id,
        entries: entries.map((e) => ({
          exerciseId: e.exerciseId,
          name: e.name,
          done: e.done,
          repsDone: e.repsDone,
          weightKg: e.weightKg,
        })),
      });

      navigate('/workouts');
    } catch (err) {
      const msg = err?.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(', ') : msg || 'No se pudo guardar el entrenamiento');
    } finally {
      setFinishing(false);
    }
  };

  if (loading) return <div className="train-container"><p>Cargando...</p></div>;

  return (
    <div className="train-container">
      <div className="train-card">
        <div className="train-top">
          <h1>Entrenar: {workout?.name || 'Rutina'}</h1>
          <button className="ghost-btn" onClick={() => navigate('/workouts')}>Volver</button>
        </div>

        <p className="progress-text">
          Completado: {completedCount}/{entries.length}
        </p>

        <div className="train-list">
          {entries.map((e) => (
            <div key={e.exerciseId} className={`train-item ${e.done ? 'done' : ''}`}>
              <label className="check-col">
                <input
                  type="checkbox"
                  checked={e.done}
                  onChange={() => toggleDone(e.exerciseId)}
                />
                <span>{e.name}</span>
              </label>

              {e.gifUrl ? (
                <img src={e.gifUrl} alt={e.name} className="train-gif" />
              ) : (
                <div className="train-gif train-gif-empty">Sin GIF</div>
              )}

              <div className="marks-col">
                <label>
                  Reps hechas
                  <input
                    type="number"
                    min="0"
                    value={e.repsDone}
                    onChange={(ev) => updateEntry(e.exerciseId, 'repsDone', ev.target.value)}
                  />
                </label>
                <label>
                  Peso (kg)
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={e.weightKg}
                    onChange={(ev) => updateEntry(e.exerciseId, 'weightKg', ev.target.value)}
                  />
                </label>
              </div>
            </div>
          ))}
        </div>

        {error && <p className="error-msg">{error}</p>}

        <button
          className="finish-btn"
          disabled={!allDone || finishing}
          onClick={finishTraining}
        >
          {finishing ? 'Guardando...' : 'Terminar entrenamiento'}
        </button>
      </div>
    </div>
  );
}

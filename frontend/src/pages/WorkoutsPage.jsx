import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import PRESET_WORKOUTS from '../data/presetWorkouts';
import ExerciseGif from '../components/ExerciseGif';
import '../styles/Workouts.css';

export default function WorkoutsPage() {
  const navigate = useNavigate();
  const [myWorkouts, setMyWorkouts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creatingFromPresetId, setCreatingFromPresetId] = useState('');
  const [error, setError] = useState('');
  const [section, setSection] = useState('mine'); // mine | preset

  const loadWorkouts = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/workouts');
      setMyWorkouts(Array.isArray(data) ? data : []);
    } catch (err) {
      const msg = err?.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(', ') : msg || 'Error al cargar rutinas');
    } finally {
      setLoading(false);
    }
  };

  const deleteWorkout = async (id) => {
    if (!window.confirm('Eliminar esta rutina?')) return;
    try {
      await api.delete(`/workouts/${id}`);
      setMyWorkouts((prev) => prev.filter((w) => w.id !== id));
    } catch (err) {
      const msg = err?.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(', ') : msg || 'Error al eliminar rutina');
    }
  };

  const createFromPreset = async (preset) => {
    setCreatingFromPresetId(preset.id);
    setError('');
    try {
      const payload = {
        name: preset.name,
        exercises: (preset.exercises || []).map((ex) => ({
          exerciseId: ex.exerciseId,
          name: ex.name,
          bodyPart: ex.bodyPart || '',
          equipment: ex.equipment || '',
          target: ex.target || '',
          gifUrl: ex.gifUrl || '',
        })),
      };

      const { data } = await api.post('/workouts', payload);
      setMyWorkouts((prev) => [data, ...prev]);
      navigate(`/workouts/${data.id}/edit`);
    } catch (err) {
      const msg = err?.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(', ') : msg || 'No se pudo crear la rutina desde plantilla');
    } finally {
      setCreatingFromPresetId('');
    }
  };

  useEffect(() => {
    loadWorkouts();
  }, []);

  const renderWorkoutCard = (workout, isPreset = false) => (
    <div key={workout.id} className={`workout-card ${isPreset ? 'workout-card-preset' : ''}`}>
      <h3 className="workout-title">
        {workout.name}
        {isPreset && <span className="preset-badge">Predeterminada</span>}
      </h3>

      <table className="exercise-table">
        <thead>
          <tr>
            <th>Ejercicio</th>
            <th>Musculo</th>
            <th>GIF</th>
          </tr>
        </thead>
        <tbody>
          {(workout.exercises || []).length > 0 ? (
            workout.exercises.map((ex, idx) => (
              <tr key={`${workout.id}-${ex.exerciseId || idx}`}>
                <td>{ex.name}</td>
                <td>{ex.bodyPart || '-'}</td>
                <td>
                  <ExerciseGif exercise={ex} alt={ex.name} className="table-gif" />
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={3}>Sin ejercicios cargados</td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="workout-actions">
        {isPreset ? (
          <button
            className="use-preset-btn"
            onClick={() => createFromPreset(workout)}
            disabled={creatingFromPresetId === workout.id}
          >
            {creatingFromPresetId === workout.id ? 'Creando...' : 'Usar rutina'}
          </button>
        ) : (
          <>
            <button onClick={() => navigate(`/workouts/${workout.id}/train`)} className="train-btn">
              Entrenar
            </button>
            <button onClick={() => navigate(`/workouts/${workout.id}/edit`)} className="edit-btn">
              Editar
            </button>
            <button onClick={() => deleteWorkout(workout.id)} className="delete-btn">
              Eliminar
            </button>
          </>
        )}
      </div>
    </div>
  );

  return (
    <div className="page-content">
      <div className="workouts-container">
        <div className="workouts-header">
          <h1>Entrenar</h1>
          <div className="workouts-header-actions">
            <button onClick={() => navigate('/dashboard')} className="ghost-btn">Volver</button>
            <button onClick={() => navigate('/workouts/crear')} className="create-btn">Crear nueva rutina</button>
          </div>
        </div>

        <div className="workouts-switch">
          <button
            className={`switch-btn ${section === 'mine' ? 'active' : ''}`}
            onClick={() => setSection('mine')}
          >
            Mis rutinas
          </button>
          <button
            className={`switch-btn ${section === 'preset' ? 'active' : ''}`}
            onClick={() => setSection('preset')}
          >
            Rutinas predefinidas
          </button>
        </div>

        {loading ? (
          <p className="loading">Cargando rutinas...</p>
        ) : (
          <>
            {section === 'mine' && (
              <section className="workouts-section">
                <h2 className="section-title">Mis rutinas</h2>
                {myWorkouts.length === 0 ? (
                  <p className="no-workouts">Todavia no creaste rutinas.</p>
                ) : (
                  <div className="workouts-grid">
                    {myWorkouts.map((w) => renderWorkoutCard(w, false))}
                  </div>
                )}
              </section>
            )}

            {section === 'preset' && (
              <section className="workouts-section">
                <h2 className="section-title">Rutinas predefinidas</h2>
                <p className="section-subtitle">
                  Plantillas base para empezar rapido. Al tocar "Usar rutina" se copia a tus rutinas.
                </p>
                <div className="workouts-grid">
                  {PRESET_WORKOUTS.map((w) => renderWorkoutCard(w, true))}
                </div>
              </section>
            )}
          </>
        )}

        {error && <p className="error-msg">{error}</p>}
      </div>
    </div>
  );
}

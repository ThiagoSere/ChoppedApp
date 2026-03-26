import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import '../styles/Workouts.css';

export default function WorkoutsPage() {
  const navigate = useNavigate();
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadWorkouts = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/workouts');
      setWorkouts(Array.isArray(data) ? data : []);
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
      setWorkouts((prev) => prev.filter((w) => w.id !== id));
    } catch (err) {
      const msg = err?.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(', ') : msg || 'Error al eliminar rutina');
    }
  };

  useEffect(() => {
    loadWorkouts();
  }, []);

  return (
    <div className="page-content">
      <div className="workouts-container">
        <div className="workouts-header">
          <h1>Mis Rutinas</h1>
          <div className="workouts-header-actions">
            <button onClick={() => navigate('/dashboard')} className="ghost-btn">Volver</button>
            <button onClick={() => navigate('/workouts/crear')} className="create-btn">Crear Nueva Rutina</button>
          </div>
        </div>

        {loading ? (
          <p className="loading">Cargando rutinas...</p>
        ) : workouts.length === 0 ? (
          <p className="no-workouts">No hay rutinas disponibles. Crea una nueva.</p>
        ) : (
          <div className="workouts-grid">
            {workouts.map((workout) => (
              <div key={workout.id} className="workout-card">
                <h3>{workout.name}</h3>

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
                      workout.exercises.map((ex) => (
                        <tr key={`${workout.id}-${ex.exerciseId}`}>
                          <td>{ex.name}</td>
                          <td>{ex.bodyPart || '-'}</td>
                          <td>
                            {ex.gifUrl ? (
                              <img className="table-gif" src={ex.gifUrl} alt={ex.name} />
                            ) : (
                              '-'
                            )}
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
                  <button onClick={() => navigate(`/workouts/${workout.id}/train`)} className="train-btn">
                    Entrenar
                  </button>
                  <button onClick={() => navigate(`/workouts/${workout.id}/edit`)} className="edit-btn">
                    Editar
                  </button>
                  <button onClick={() => deleteWorkout(workout.id)} className="delete-btn">
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {error && <p className="error-msg">{error}</p>}
      </div>
    </div>
  );
}

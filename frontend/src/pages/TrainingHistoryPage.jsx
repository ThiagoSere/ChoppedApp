import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import '../styles/TrainingHistory.css';

export default function TrainingHistoryPage() {
  const navigate = useNavigate();

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadSessions = async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await api.get('/training-sessions/mine');
        setSessions(Array.isArray(data) ? data : []);
      } catch (err) {
        const msg = err?.response?.data?.message;
        setError(Array.isArray(msg) ? msg.join(', ') : msg || 'No se pudo cargar el historial');
      } finally {
        setLoading(false);
      }
    };

    loadSessions();
  }, []);

  return (
    <div className="history-container">
      <div className="history-card">
        <div className="history-top">
          <h1>Historial de entrenamientos</h1>
          <button className="ghost-btn" onClick={() => navigate('/dashboard')}>
            Volver
          </button>
        </div>

        {loading && <p className="history-muted">Cargando historial...</p>}

        {!loading && sessions.length === 0 && (
          <p className="history-muted">Todavía no hay entrenamientos guardados.</p>
        )}

        {!loading && sessions.length > 0 && (
          <div className="history-list">
            {sessions.map((session) => (
              <article key={session.id} className="history-item">
                <div className="history-item-head">
                  <h3>{session.workoutName || 'Rutina'}</h3>
                  <span>{new Date(session.createdAt).toLocaleString()}</span>
                </div>

                <div className="history-table-wrap">
                  <table className="history-table">
                    <thead>
                      <tr>
                        <th>Ejercicio</th>
                        <th>Reps</th>
                        <th>Peso (kg)</th>
                        <th>Completado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(session.entries || []).map((entry, idx) => (
                        <tr key={`${session.id}-${entry.exerciseId || idx}`}>
                          <td>{entry.name}</td>
                          <td>{entry.repsDone}</td>
                          <td>{entry.weightKg}</td>
                          <td>{entry.done ? 'Si' : 'No'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </article>
            ))}
          </div>
        )}

        {error && <p className="error-msg">{error}</p>}
      </div>
    </div>
  );
}

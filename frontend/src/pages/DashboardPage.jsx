import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Dashboard.css';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  return (
    <div className="dashboard-container">
      <section className="dashboard-hero">
        <h1 className="dashboard-logo">
          C<span className="logo-h">H<span className="logo-icon" /></span>OPPEDAPP
        </h1>
        <p className="dashboard-tagline">Fitness tracker</p>
      </section>

      <div className="dashboard-grid">
        <button className="dashboard-item primary" onClick={() => navigate('/workouts')}>
          <div className="item-inner">
            <div className="item-left">
              <span className="item-icon">🏋️</span>
              <div>
                <div className="item-label">Entrenar</div>
                <div className="item-sub">Rutinas y ejercicios</div>
              </div>
            </div>
            <span className="item-arrow">›</span>
          </div>
        </button>

        <button className="dashboard-item" onClick={() => navigate('/workouts/crear')}>
          <div className="item-inner">
            <div className="item-left">
              <span className="item-icon">➕</span>
              <div>
                <div className="item-label">Crear rutina</div>
                <div className="item-sub">Nueva plantilla</div>
              </div>
            </div>
            <span className="item-arrow">›</span>
          </div>
        </button>

        <button className="dashboard-item" onClick={() => navigate('/training-history')}>
          <div className="item-inner">
            <div className="item-left">
              <span className="item-icon">📚</span>
              <div>
                <div className="item-label">Historial</div>
                <div className="item-sub">Entrenamientos guardados</div>
              </div>
            </div>
            <span className="item-arrow">›</span>
          </div>
        </button>

        <button className="dashboard-item" onClick={() => navigate('/store')}>
          <div className="item-inner">
            <div className="item-left">
              <span className="item-icon">🛒</span>
              <div>
                <div className="item-label">Tienda</div>
                <div className="item-sub">Productos y accesorios</div>
              </div>
            </div>
            <span className="item-arrow">›</span>
          </div>
        </button>

        <button className="dashboard-item disabled" disabled>
          <div className="item-inner">
            <div className="item-left">
              <span className="item-icon">🎥</span>
              <div>
                <div className="item-label">Correccion de tecnica</div>
                <div className="item-sub">Proximamente</div>
              </div>
            </div>
            <span className="item-arrow">›</span>
          </div>
        </button>

        <button className="dashboard-item" onClick={() => navigate('/profile')}>
          <div className="item-inner">
            <div className="item-left">
              <span className="item-icon">👤</span>
              <div>
                <div className="item-label">Perfil</div>
                <div className="item-sub">Alias y foto</div>
              </div>
            </div>
            <span className="item-arrow">›</span>
          </div>
        </button>

        <button className="dashboard-item danger" onClick={logout}>
          <div className="item-inner">
            <div className="item-left">
              <span className="item-icon">⏻</span>
              <div>
                <div className="item-label">Cerrar sesion</div>
                <div className="item-sub">Salir de la cuenta</div>
              </div>
            </div>
            <span className="item-arrow">›</span>
          </div>
        </button>
      </div>
    </div>
  );
}

import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Dashboard.css';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const items = [
    {
      key: 'entrenar',
      label: 'Entrenar',
      sub: 'Ver rutinas y ejercicios',
      icon: '🏋️',
      action: () => navigate('/workouts'),
      primary: true,
      disabled: false,
    },
    {
      key: 'crear',
      label: 'Crear rutina',
      sub: 'Armar una nueva rutina',
      icon: '➕',
      action: () => navigate('/workouts/crear'),
      disabled: false,
    },
    {
      key: 'tienda',
      label: 'Tienda',
      sub: 'Ver productos',
      icon: '🛒',
      action: () => navigate('/store'),
      disabled: false,
    },
    {
      key: 'historial',
      label: 'Historial',
      sub: 'Proximamente',
      icon: '📈',
      action: () => {},
      disabled: true,
    },
    {
      key: 'ranking',
      label: 'Ranking',
      sub: 'Proximamente',
      icon: '🏆',
      action: () => {},
      disabled: true,
    },
    {
      key: 'mapa',
      label: 'Mapa de gimnasios',
      sub: 'Proximamente',
      icon: '🗺️',
      action: () => {},
      disabled: true,
    },
    {
      key: 'perfil',
      label: 'Perfil',
      sub: 'Editar alias y foto',
      icon: '👤',
      action: () => navigate('/profile'),
      disabled: false,
    },
    {
      key: 'salir',
      label: 'Cerrar sesion',
      sub: 'Salir de la cuenta',
      icon: '⏻',
      action: () => logout(),
      danger: true,
      disabled: false,
    },
  ];

  return (
    <div className="dashboard-container">
      <section className="dashboard-hero">
        <h1 className="dashboard-logo">
          CH<span className="logo-accent">O<span className="logo-icon" /></span>PPEDAPP
        </h1>
        <p className="dashboard-tagline">Fitness tracker</p>
      </section>

      <div className="dashboard-grid">
        {items.map((item) => (
          <button
            key={item.key}
            type="button"
            className={[
              'dashboard-item',
              item.primary ? 'primary' : '',
              item.danger ? 'danger' : '',
              item.disabled ? 'disabled' : '',
            ].join(' ').trim()}
            onClick={item.action}
            disabled={item.disabled}
          >
            <div className="item-inner">
              <div className="item-left">
                <span className="item-icon">{item.icon}</span>
                <div>
                  <div className="item-label">{item.label}</div>
                  <div className="item-sub">{item.sub}</div>
                </div>
              </div>
              <span className="item-arrow">›</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

import { useNavigate } from 'react-router-dom';
import '../styles/Store.css';

export default function StorePage() {
  const navigate = useNavigate();

  return (
    <div className="page-content">
      <div className="store-container">
        <div className="store-header">
          <h1>Tienda</h1>
          <button type="button" onClick={() => navigate('/dashboard')} className="cart-btn">
            Volver
          </button>
        </div>

        <p style={{ position: 'relative', zIndex: 1, color: 'var(--text-muted)' }}>
          Proximamente: catalogo y carrito.
        </p>
      </div>
    </div>
  );
}

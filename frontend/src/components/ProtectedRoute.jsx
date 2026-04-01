import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ isAuthenticated, children }) {
  const { authReady } = useAuth();

  if (!authReady) return <div style={{ padding: 24 }}>Cargando sesión...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return children;
}

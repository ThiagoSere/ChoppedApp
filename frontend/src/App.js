import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import WorkoutsPage from './pages/WorkoutsPage';
import CreateWorkoutPage from './pages/CreateWorkoutPage';
import StorePage from './pages/StorePage';
import ProfilePage from './pages/ProfilePage';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  const { me } = useAuth();

  return (
    <Router>
      <div className="auth-container">
        <Routes>
          {/* Rutas públicas */}
          <Route path="/login" element={!me ? <LoginPage /> : <Navigate to="/dashboard" />} />

          {/* Rutas protegidas */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute isAuthenticated={!!me}>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/workouts"
            element={
              <ProtectedRoute isAuthenticated={!!me}>
                <WorkoutsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/workouts/crear"
            element={
              <ProtectedRoute isAuthenticated={!!me}>
                <CreateWorkoutPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/store"
            element={
              <ProtectedRoute isAuthenticated={!!me}>
                <StorePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute isAuthenticated={!!me}>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          {/* Redireccionar a login si no está autenticado */}
          <Route path="/" element={!me ? <Navigate to="/login" /> : <Navigate to="/dashboard" />} />
          <Route path="*" element={<Navigate to={me ? '/dashboard' : '/login'} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

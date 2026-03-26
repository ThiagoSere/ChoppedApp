import { useState } from 'react';
import LoginForm from '../components/LoginForm';
import RegisterForm from '../components/RegisterForm';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const { error } = useAuth();

  return (
    <div className="auth-card">
      <h1 className="auth-title">ChoppedApp</h1>

      <div className="auth-tabs">
        <button
          className={`tab-btn ${isLogin ? 'active' : ''}`}
          onClick={() => setIsLogin(true)}
        >
          Iniciar sesión
        </button>
        <button
          className={`tab-btn ${!isLogin ? 'active' : ''}`}
          onClick={() => setIsLogin(false)}
        >
          Registrarse
        </button>
      </div>

      {isLogin ? (
        <LoginForm onSuccess={() => {}} />
      ) : (
        <RegisterForm onSuccess={() => {}} />
      )}

      {error && <p className="error-msg">{error}</p>}
    </div>
  );
}

// frontend/src/components/RegisterForm.jsx
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function RegisterForm({ onSuccess }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [localError, setLocalError] = useState('');
  const { register, loading } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (password !== password2) {
      setLocalError('Las contraseñas no coinciden');
      return;
    }

    const result = await register(name, email, password);
    if (result.success) {
      setName('');
      setEmail('');
      setPassword('');
      setPassword2('');
      onSuccess();
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Nombre"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="auth-input"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="auth-input"
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="auth-input"
        />
        <input
          type="password"
          placeholder="Confirmar contraseña"
          value={password2}
          onChange={(e) => setPassword2(e.target.value)}
          required
          className="auth-input"
        />
        <button type="submit" className="auth-btn" disabled={loading}>
          {loading ? 'Cargando...' : 'Registrarse'}
        </button>
      </form>
      {localError && <p className="error-msg">{localError}</p>}
    </>
  );
}

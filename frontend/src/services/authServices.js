// frontend/src/services/authService.js
import api from './api';

export async function login(email, password) {
  const { data } = await api.post('/auth/login', { email, password });
  return data; // { accessToken }
}

export async function getMe() {
  const { data } = await api.get('/auth/me');
  return data; // { userId, email }
}

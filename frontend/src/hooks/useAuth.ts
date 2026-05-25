import { useState } from 'react';
import api from '../services/api';

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function login(email: string, password: string) {
    setLoading(true); setError(null);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', data.token);
      return true;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed');
      return false;
    } finally { setLoading(false); }
  }

  async function register(name: string, email: string, password: string) {
    setLoading(true); setError(null);
    try {
      await api.post('/auth/register', { name, email, password });
      return true;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Register failed');
      return false;
    } finally { setLoading(false); }
  }

  function logout() { localStorage.removeItem('token'); }

  return { login, register, logout, loading, error };
}

import { FC, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const ResetPasswordPage: FC = () => {
  const [token, setToken]       = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [done, setDone]         = useState(false);
  const navigate = useNavigate();

  async function handleSubmit() {
    setLoading(true);
    setError(null);
    try {
      await api.post('/auth/reset-password', { token, newPassword });
      setDone(true);
    } catch {
      setError('Token inválido o expirado.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ marginBottom: 40, textAlign: 'center' }}>
          <h1 style={{ fontSize: 28, marginBottom: 6 }}>Restablecer contraseña</h1>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {error && <div data-testid="reset-error" style={{ color: 'var(--danger)', fontSize: 13 }}>{error}</div>}

          {done ? (
            <div data-testid="reset-success">
              <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 16 }}>
                Tu contraseña fue actualizada correctamente.
              </p>
              <button className="btn-gold" onClick={() => navigate('/login')}>Ir a iniciar sesión</button>
            </div>
          ) : (
            <>
              <div>
                <label style={{ color: 'var(--muted)', fontSize: 11, fontWeight: 600, display: 'block', marginBottom: 8 }}>Token</label>
                <input data-testid="reset-token" type="text" value={token} onChange={e => setToken(e.target.value)} />
              </div>
              <div>
                <label style={{ color: 'var(--muted)', fontSize: 11, fontWeight: 600, display: 'block', marginBottom: 8 }}>Nueva contraseña</label>
                <input data-testid="reset-new-password" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
              </div>
              <button data-testid="reset-submit" className="btn-gold" onClick={handleSubmit} disabled={loading}>
                {loading ? 'Actualizando...' : 'Restablecer contraseña'}
              </button>
            </>
          )}
        </div>

        <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 24, textAlign: 'center' }}>
          <Link to="/login" style={{ color: 'var(--gold)' }}>← Volver a iniciar sesión</Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPasswordPage;

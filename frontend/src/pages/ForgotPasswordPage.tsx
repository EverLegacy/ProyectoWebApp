import { FC, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const ForgotPasswordPage: FC = () => {
  const [email, setEmail]     = useState('');
  const [loading, setLoading] = useState(false);
  const [token, setToken]     = useState<string | null>(null);
  const [error, setError]     = useState<string | null>(null);

  async function handleSubmit() {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post('/auth/forgot-password', { email });
   
      
      setToken(data.resetToken ?? null);
    } catch {
      setError('No se pudo procesar la solicitud.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ marginBottom: 40, textAlign: 'center' }}>
          <h1 style={{ fontSize: 28, marginBottom: 6 }}>Recuperar contraseña</h1>
          <p style={{ color: 'var(--muted)', fontSize: 14 }}>Te daremos un token para restablecerla</p>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {error && <div data-testid="forgot-error" style={{ color: 'var(--danger)', fontSize: 13 }}>{error}</div>}

          {!token ? (
            <>
              <div>
                <label style={{ color: 'var(--muted)', fontSize: 11, fontWeight: 600, display: 'block', marginBottom: 8 }}>Email</label>
                <input
                  data-testid="forgot-email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                />
              </div>
              <button data-testid="forgot-submit" className="btn-gold" onClick={handleSubmit} disabled={loading}>
                {loading ? 'Enviando...' : 'Solicitar token'}
              </button>
            </>
          ) : (
            <div data-testid="forgot-token-display" style={{
              background: 'var(--bg3)', border: '1px solid var(--gold)',
              borderRadius: 12, padding: '16px 20px', textAlign: 'center',
            }}>
              <p style={{ color: 'var(--muted)', fontSize: 11, marginBottom: 8 }}>Tu token de recuperación</p>
              <p style={{ fontFamily: 'monospace', fontSize: 14, color: 'var(--gold)', wordBreak: 'break-all' }}>{token}</p>
              <p style={{ color: 'var(--muted)', fontSize: 12, marginTop: 12 }}>
                Válido por 15 minutos. <Link to="/reset-password" style={{ color: 'var(--gold)' }}>Usarlo ahora →</Link>
              </p>
            </div>
          )}
        </div>

        <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 24, textAlign: 'center' }}>
          <Link to="/login" style={{ color: 'var(--gold)' }}>← Volver a iniciar sesión</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;

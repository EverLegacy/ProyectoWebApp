import { FC, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const LoginPage: FC = () => {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit() {
    const ok = await login(email, password);
    if (ok) navigate('/dashboard');
  }

  return (
    <div style={{
      minHeight: 'calc(100vh - 64px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        {/* Logo mark */}
        <div className="fade-up" style={{ marginBottom: 40, textAlign: 'center' }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16,
            background: 'linear-gradient(135deg, var(--gold), var(--gold2))',
            margin: '0 auto 16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24,
          }}>★</div>
          <h1 style={{ fontSize: 28, marginBottom: 6 }}>Bienvenido de vuelta</h1>
          <p style={{ color: 'var(--muted)', fontSize: 14 }}>Inicia sesión para ver tus puntos</p>
        </div>

        <div className="card fade-up-2" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {error && (
            <div style={{
              background: 'rgba(224,82,82,0.1)', border: '1px solid rgba(224,82,82,0.3)',
              borderRadius: 8, color: 'var(--danger)', fontSize: 13, padding: '10px 14px',
            }}>{error}</div>
          )}
          <div>
            <label style={{ color: 'var(--muted)', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Email</label>
            <input type="email" placeholder="tu@email.com" value={email} onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
          </div>
          <div>
            <label style={{ color: 'var(--muted)', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Contraseña</label>
            <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
          </div>
          <button className="btn-gold" onClick={handleSubmit} disabled={loading} style={{ marginTop: 8 }}>
            {loading ? 'Cargando...' : 'Iniciar sesión →'}
          </button>
        </div>

        <p className="fade-up-3" style={{ color: 'var(--muted)', fontSize: 13, marginTop: 24, textAlign: 'center' }}>
          ¿No tienes cuenta?{' '}
          <Link to="/register" style={{ color: 'var(--gold)' }}>Regístrate gratis</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;

import { FC, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { datadogLogs } from '@datadog/browser-logs';

const RegisterPage: FC = () => {
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const { register, loading, error } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit() {
    const ok = await register(name, email, password);
  if (ok) {
    datadogLogs.logger.info('USER_REGISTERED', {
      name,
      email
    });

    navigate('/login');
  }
}

  return (
    <div style={{
      minHeight: 'calc(100vh - 64px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
    }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div className="fade-up" style={{ marginBottom: 40, textAlign: 'center' }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16,
            background: 'linear-gradient(135deg, var(--gold), var(--gold2))',
            margin: '0 auto 16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
          }}>✦</div>
          <h1 style={{ fontSize: 28, marginBottom: 6 }}>Crear cuenta</h1>
          <p style={{ color: 'var(--muted)', fontSize: 14 }}>Empieza a acumular puntos hoy</p>
        </div>

        <div className="card fade-up-2" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {error && (
            <div style={{
              background: 'rgba(224,82,82,0.1)', border: '1px solid rgba(224,82,82,0.3)',
              borderRadius: 8, color: 'var(--danger)', fontSize: 13, padding: '10px 14px',
            }}>{error}</div>
          )}
          {[
            { label: 'Nombre completo', placeholder: 'Juan García', value: name, set: setName, type: 'text' },
            { label: 'Email', placeholder: 'tu@email.com', value: email, set: setEmail, type: 'email' },
            { label: 'Contraseña', placeholder: '••••••••', value: password, set: setPassword, type: 'password' },
          ].map(({ label, placeholder, value, set, type }) => (
            <div key={label}>
              <label style={{ color: 'var(--muted)', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>{label}</label>
              <input type={type} placeholder={placeholder} value={value}
                onChange={e => set(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
            </div>
          ))}
          <button className="btn-gold" onClick={handleSubmit} disabled={loading} style={{ marginTop: 8 }}>
            {loading ? 'Creando cuenta...' : 'Crear cuenta →'}
          </button>
        </div>

        <p className="fade-up-3" style={{ color: 'var(--muted)', fontSize: 13, marginTop: 24, textAlign: 'center' }}>
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" style={{ color: 'var(--gold)' }}>Inicia sesión</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;

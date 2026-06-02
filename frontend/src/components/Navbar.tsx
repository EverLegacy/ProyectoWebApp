import { FC } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';


const Navbar: FC = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const isAuth    = !!localStorage.getItem('token');

  function logout() {
    localStorage.removeItem('token');
    navigate('/login');
  }

  if (!isAuth) return null;

  const links = [
    { to: '/dashboard',    label: 'Inicio' },
    { to: '/rewards',      label: 'Recompensas' },
    { to: '/transactions', label: 'Historial' },
  ];

  return (
    <nav style={{
      alignItems: 'center',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      justifyContent: 'space-between',
      padding: '0 32px',
      height: 64,
      position: 'sticky',
      top: 0,
      background: 'rgba(10,10,10,0.92)',
      backdropFilter: 'blur(12px)',
      zIndex: 100,
    }}>
      <span style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 18, color: 'var(--gold)', letterSpacing: '-0.02em' }}>
        PUNTOS<span style={{ color: 'var(--text)' }}>APP</span>
      </span>
      <div style={{ display: 'flex', gap: 8 }}>
        {links.map(l => (
          <Link key={l.to} to={l.to} style={{
            padding: '8px 16px',
            borderRadius: 8,
            fontSize: 13,
            fontFamily: 'Syne',
            fontWeight: 600,
            letterSpacing: '0.04em',
            background: location.pathname === l.to ? 'var(--bg3)' : 'transparent',
            color: location.pathname === l.to ? 'var(--gold)' : 'var(--muted)',
            transition: 'all 0.2s',
          }}>{l.label}</Link>
        ))}
      </div>
      <button className="btn-outline" onClick={logout} style={{ padding: '8px 16px', fontSize: 12 }}>
        Salir
      </button>
    </nav>
  );
};

export default Navbar;

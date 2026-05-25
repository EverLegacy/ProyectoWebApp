import { FC, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { LoyaltyCard, User } from '../types';

const tierColors: Record<string, string> = {
  bronze: '#cd7f32',
  silver: '#a8a9ad',
  gold:   '#c9a84c',
};

const tierEmoji: Record<string, string> = {
  bronze: '🥉',
  silver: '🥈',
  gold:   '🥇',
};

const DashboardPage: FC = () => {
  const [card, setCard]   = useState<LoyaltyCard | null>(null);
  const [user, setUser]   = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }
    Promise.all([
      api.get<LoyaltyCard>('/points/balance'),
      api.get<User>('/auth/me'),
    ]).then(([cardRes, userRes]) => {
      setCard(cardRes.data);
      setUser(userRes.data);
    }).catch(() => navigate('/login'))
      .finally(() => setLoading(false));
  }, [navigate]);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div style={{ color: 'var(--muted)', fontFamily: 'Syne' }}>Cargando...</div>
    </div>
  );

  const tier = card?.tier ?? 'bronze';
  const nextTierPoints = tier === 'bronze' ? 500 : tier === 'silver' ? 2000 : null;
  const progress = nextTierPoints ? Math.min(100, ((card?.points_balance ?? 0) / nextTierPoints) * 100) : 100;

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '40px 24px' }}>
      {/* Greeting */}
      <div className="fade-up" style={{ marginBottom: 32 }}>
        <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 4 }}>Hola de nuevo,</p>
        <h1 style={{ fontSize: 32 }}>{user?.name ?? 'Usuario'} {tierEmoji[tier]}</h1>
      </div>

      {/* Loyalty Card */}
      <div className="fade-up-2" style={{
        background: 'linear-gradient(135deg, #1a1510, #2a2010)',
        border: `1px solid ${tierColors[tier]}40`,
        borderRadius: 20,
        padding: '32px 28px',
        marginBottom: 24,
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative circle */}
        <div style={{
          position: 'absolute', top: -40, right: -40,
          width: 200, height: 200, borderRadius: '50%',
          background: `${tierColors[tier]}10`,
          border: `1px solid ${tierColors[tier]}20`,
        }} />
        <div style={{
          position: 'absolute', top: 20, right: 20,
          width: 100, height: 100, borderRadius: '50%',
          background: `${tierColors[tier]}08`,
        }} />

        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
            <div>
              <span className="tag" style={{ borderColor: `${tierColors[tier]}40`, color: tierColors[tier] }}>
                {tier.toUpperCase()}
              </span>
            </div>
            <span style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 18, color: 'var(--gold)' }}>★ PUNTOSAPP</span>
          </div>

          <div style={{ marginBottom: 24 }}>
            <p style={{ color: 'var(--muted)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>Saldo actual</p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span style={{ fontFamily: 'Syne', fontSize: 52, fontWeight: 800, color: tierColors[tier], lineHeight: 1 }}>
                {card?.points_balance?.toLocaleString() ?? '0'}
              </span>
              <span style={{ color: 'var(--muted)', fontSize: 14 }}>puntos</span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <p style={{ color: 'var(--muted)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 2 }}>No. de tarjeta</p>
              <p style={{ fontFamily: 'Syne', fontSize: 13, letterSpacing: '0.1em' }}>{card?.card_number ?? '—'}</p>
            </div>
            {nextTierPoints && (
              <div style={{ textAlign: 'right' }}>
                <p style={{ color: 'var(--muted)', fontSize: 11, marginBottom: 4 }}>{nextTierPoints - (card?.points_balance ?? 0)} pts para nivel siguiente</p>
                <div style={{ width: 120, height: 4, background: 'var(--bg3)', borderRadius: 999 }}>
                  <div style={{ width: `${progress}%`, height: '100%', background: tierColors[tier], borderRadius: 999, transition: 'width 1s ease' }} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="fade-up-3" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Link to="/rewards" style={{
          background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 16,
          padding: 24, display: 'block', transition: 'border-color 0.2s',
        }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--gold)')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}>
          <div style={{ fontSize: 28, marginBottom: 12 }}>🎁</div>
          <h3 style={{ fontSize: 16, marginBottom: 4 }}>Recompensas</h3>
          <p style={{ color: 'var(--muted)', fontSize: 13 }}>Canjea tus puntos por premios</p>
        </Link>
        <Link to="/transactions" style={{
          background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 16,
          padding: 24, display: 'block', transition: 'border-color 0.2s',
        }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--gold)')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}>
          <div style={{ fontSize: 28, marginBottom: 12 }}>📋</div>
          <h3 style={{ fontSize: 16, marginBottom: 4 }}>Historial</h3>
          <p style={{ color: 'var(--muted)', fontSize: 13 }}>Ve tus compras y puntos ganados</p>
        </Link>
      </div>
    </div>
  );
};

export default DashboardPage;

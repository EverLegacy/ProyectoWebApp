import { FC, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { LoyaltyCard, User } from '../types';
import { logEvent } from '../lib/datadog';

interface Store { id: number; name: string; }

const tierColors: Record<string, string> = {
  bronze: '#cd7f32', silver: '#a8a9ad', gold: '#c9a84c',
};
const tierEmoji: Record<string, string> = {
  bronze: '🥉', silver: '🥈', gold: '🥇',
};

const DashboardPage: FC = () => {
  const [card, setCard]       = useState<LoyaltyCard | null>(null);
  const [user, setUser]       = useState<User | null>(null);
  const [stores, setStores]   = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);

  // Scan modal state
  const [showScan, setShowScan]   = useState(false);
  const [storeId, setStoreId]     = useState('');
  const [amount, setAmount]       = useState('');
  const [scanning, setScanning]   = useState(false);
  const [scanMsg, setScanMsg]     = useState<{ text: string; ok: boolean } | null>(null);

  const navigate = useNavigate();

  function loadCard() {
    return api.get<LoyaltyCard>('/points/balance').then(r => setCard(r.data));
  }

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }
    Promise.all([
      loadCard(),
      api.get<User>('/auth/me').then(r => setUser(r.data)),
      api.get<Store[]>('/stores').then(r => setStores(r.data)),
    ]).catch(() => navigate('/login'))
      .finally(() => setLoading(false));
  }, [navigate]);

  async function handleScan() {
    if (!storeId || !amount) return;
    setScanning(true);
    setScanMsg(null);
    try {
      const { data } = await api.post<{ pointsEarned: number; newBalance: number }>(
        '/points/add', { storeId: Number(storeId), amount: Number(amount) }
      );
      const selectedStore = stores.find(
  s => s.id === Number(storeId)
);

logEvent('Points Added', {
  storeId: Number(storeId),
  storeName: selectedStore?.name,
  amount: Number(amount),
  pointsEarned: data.pointsEarned,
  newBalance: data.newBalance
});
      setScanMsg({ text: `¡Ganaste ${data.pointsEarned} puntos! Nuevo saldo: ${data.newBalance}`, ok: true });
      await loadCard();
      setAmount('');
    } catch {
      setScanMsg({ text: 'Error al registrar la compra.', ok: false });
    } finally {
      setScanning(false);
    }
  }

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
      <div className="fade-up" style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 4 }}>Hola de nuevo,</p>
          <h1 style={{ fontSize: 32 }}>{user?.name ?? 'Usuario'} {tierEmoji[tier]}</h1>
        </div>
        <button className="btn-gold" onClick={() => { setShowScan(true); setScanMsg(null); }}
          style={{ width: 'auto', padding: '12px 24px', marginTop: 8 }}>
          + Simular compra
        </button>
      </div>

      {/* Loyalty Card */}
      <div className="fade-up-2" style={{
        background: 'linear-gradient(135deg, #1a1510, #2a2010)',
        border: `1px solid ${tierColors[tier]}40`,
        borderRadius: 20, padding: '32px 28px', marginBottom: 24,
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: `${tierColors[tier]}10`, border: `1px solid ${tierColors[tier]}20` }} />
        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
            <span className="tag" style={{ borderColor: `${tierColors[tier]}40`, color: tierColors[tier] }}>{tier.toUpperCase()}</span>
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
        {[
          { to: '/rewards', icon: '🎁', title: 'Recompensas', desc: 'Canjea tus puntos por premios' },
          { to: '/transactions', icon: '📋', title: 'Historial', desc: 'Ve tus compras y puntos ganados' },
        ].map(({ to, icon, title, desc }) => (
          <Link key={to} to={to} style={{
            background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 16,
            padding: 24, display: 'block', transition: 'border-color 0.2s',
          }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--gold)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}>
            <div style={{ fontSize: 28, marginBottom: 12 }}>{icon}</div>
            <h3 style={{ fontSize: 16, marginBottom: 4 }}>{title}</h3>
            <p style={{ color: 'var(--muted)', fontSize: 13 }}>{desc}</p>
          </Link>
        ))}
      </div>

      {/* Scan Modal */}
      {showScan && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 200, padding: 24,
        }} onClick={e => { if (e.target === e.currentTarget) setShowScan(false); }}>
          <div className="card fade-up" style={{ width: '100%', maxWidth: 420, padding: 32 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontSize: 22 }}>Simular compra</h2>
              <button onClick={() => setShowScan(false)} style={{
                background: 'var(--bg3)', border: '1px solid var(--border)',
                borderRadius: 8, color: 'var(--muted)', padding: '6px 12px', fontSize: 18,
              }}>✕</button>
            </div>

            <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 24 }}>
              Selecciona la tienda e ingresa el monto de tu compra. Ganarás <strong style={{ color: 'var(--gold)' }}>1 punto por cada peso</strong>.
            </p>

            {scanMsg && (
              <div style={{
                background: scanMsg.ok ? 'rgba(82,196,138,0.1)' : 'rgba(224,82,82,0.1)',
                border: `1px solid ${scanMsg.ok ? 'rgba(82,196,138,0.3)' : 'rgba(224,82,82,0.3)'}`,
                borderRadius: 8, color: scanMsg.ok ? 'var(--success)' : 'var(--danger)',
                fontSize: 13, padding: '10px 14px', marginBottom: 20,
              }}>{scanMsg.text}</div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ color: 'var(--muted)', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Tienda</label>
                <select value={storeId} onChange={e => setStoreId(e.target.value)} style={{
                  background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8,
                  color: 'var(--text)', fontFamily: 'DM Sans', fontSize: 15,
                  outline: 'none', padding: '14px 16px', width: '100%',
                }}>
                  <option value="">Selecciona una tienda...</option>
                  {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ color: 'var(--muted)', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Monto de compra ($)</label>
                <input type="number" placeholder="Ej. 150" value={amount}
                  onChange={e => setAmount(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleScan()} />
              </div>
              {amount && Number(amount) > 0 && (
                <div style={{
                  background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)',
                  borderRadius: 8, padding: '10px 14px', fontSize: 13, color: 'var(--gold)',
                }}>
                  Ganarás <strong>{Math.floor(Number(amount))} puntos</strong> con esta compra
                </div>
              )}
              <button className="btn-gold" onClick={handleScan}
                disabled={scanning || !storeId || !amount} style={{ marginTop: 4 }}>
                {scanning ? 'Registrando...' : 'Registrar compra →'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
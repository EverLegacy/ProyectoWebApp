import { FC, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { LoyaltyCard } from '../types';
import { logEvent } from '../lib/datadog';

interface Redemption {
  id: number;
  redeemed_at: string;
  status: string;
  reward_name?: string;
}

const TransactionsPage: FC = () => {
  const [card, setCard]           = useState<LoyaltyCard | null>(null);
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [loading, setLoading]     = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
      logEvent('TRANSACTIONS_VIEWED');
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }
    api.get<LoyaltyCard>('/points/balance')
      .then(r => setCard(r.data))
      .catch(() => navigate('/login'))
      .finally(() => setLoading(false));
    
    setRedemptions([]);
  }, [navigate]);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div style={{ color: 'var(--muted)', fontFamily: 'Syne' }}>Cargando...</div>
    </div>
  );

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '40px 24px' }}>
      <div className="fade-up" style={{ marginBottom: 32 }}>
        <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 4 }}>Tu actividad</p>
        <h1 style={{ fontSize: 32 }}>Historial</h1>
      </div>

      {/* Stats row */}
      <div className="fade-up-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 32 }}>
        {[
          { label: 'Puntos acumulados', value: card?.points_balance?.toLocaleString() ?? '0', color: 'var(--gold)' },
          { label: 'Nivel actual', value: (card?.tier ?? 'bronze').charAt(0).toUpperCase() + (card?.tier ?? 'bronze').slice(1), color: 'var(--text)' },
          { label: 'Canjes realizados', value: redemptions.length.toString(), color: 'var(--text)' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card" style={{ textAlign: 'center' }}>
            <p style={{ color, fontFamily: 'Syne', fontSize: 28, fontWeight: 700, marginBottom: 4 }}>{value}</p>
            <p style={{ color: 'var(--muted)', fontSize: 12 }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Transaction list */}
      <div className="fade-up-3">
        <h2 style={{ fontSize: 16, marginBottom: 16, color: 'var(--muted)', fontFamily: 'DM Sans', fontWeight: 400 }}>
          Canjes recientes
        </h2>
        {redemptions.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 48 }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>📋</div>
            <p style={{ color: 'var(--muted)' }}>Aún no has canjeado ninguna recompensa.</p>
            <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 8 }}>
              Tus canjes aparecerán aquí.
            </p>
          </div>
        ) : (
          redemptions.map((r) => (
            <div key={r.id} style={{
              background: 'var(--bg2)', border: '1px solid var(--border)',
              borderRadius: 12, padding: '16px 20px', marginBottom: 12,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div>
                <p style={{ fontFamily: 'Syne', fontSize: 15, marginBottom: 2 }}>{r.reward_name ?? 'Recompensa'}</p>
                <p style={{ color: 'var(--muted)', fontSize: 12 }}>{new Date(r.redeemed_at).toLocaleDateString('es-MX')}</p>
              </div>
              <span className="tag" style={{
                color: r.status === 'completed' ? 'var(--success)' : 'var(--muted)',
                borderColor: r.status === 'completed' ? 'rgba(82,196,138,0.3)' : 'var(--border)',
              }}>
                {r.status === 'completed' ? 'Completado' : r.status}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TransactionsPage;

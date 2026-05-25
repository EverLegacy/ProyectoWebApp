import { FC, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Reward, LoyaltyCard } from '../types';

const RewardsPage: FC = () => {
  const [rewards, setRewards]   = useState<Reward[]>([]);
  const [card, setCard]         = useState<LoyaltyCard | null>(null);
  const [loading, setLoading]   = useState(true);
  const [redeeming, setRedeeming] = useState<number | null>(null);
  const [msg, setMsg]           = useState<{ text: string; ok: boolean } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }
    Promise.all([
      api.get<Reward[]>('/rewards'),
      api.get<LoyaltyCard>('/points/balance'),
    ]).then(([rRes, cRes]) => {
      setRewards(rRes.data);
      setCard(cRes.data);
    }).finally(() => setLoading(false));
  }, [navigate]);

  async function redeem(reward: Reward) {
    setRedeeming(reward.id);
    setMsg(null);
    try {
      await api.post('/rewards/redeem', { rewardId: reward.id });
      setMsg({ text: `¡Canjeaste "${reward.name}" exitosamente!`, ok: true });
      const cRes = await api.get<LoyaltyCard>('/points/balance');
      setCard(cRes.data);
    } catch {
      setMsg({ text: 'No tienes suficientes puntos.', ok: false });
    } finally {
      setRedeeming(null);
    }
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div style={{ color: 'var(--muted)', fontFamily: 'Syne' }}>Cargando...</div>
    </div>
  );

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '40px 24px' }}>
      <div className="fade-up" style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 4 }}>Catálogo</p>
          <h1 style={{ fontSize: 32 }}>Recompensas</h1>
        </div>
        <div className="card" style={{ padding: '12px 20px', textAlign: 'right' }}>
          <p style={{ color: 'var(--muted)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Tus puntos</p>
          <p style={{ fontFamily: 'Syne', fontSize: 22, fontWeight: 700, color: 'var(--gold)' }}>
            {card?.points_balance?.toLocaleString() ?? '0'}
          </p>
        </div>
      </div>

      {msg && (
        <div className="fade-up" style={{
          background: msg.ok ? 'rgba(82,196,138,0.1)' : 'rgba(224,82,82,0.1)',
          border: `1px solid ${msg.ok ? 'rgba(82,196,138,0.3)' : 'rgba(224,82,82,0.3)'}`,
          borderRadius: 8, color: msg.ok ? 'var(--success)' : 'var(--danger)',
          fontSize: 13, padding: '12px 16px', marginBottom: 24,
        }}>{msg.text}</div>
      )}

      {rewards.length === 0 ? (
        <div className="card fade-up-2" style={{ textAlign: 'center', padding: 48 }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>🎁</div>
          <p style={{ color: 'var(--muted)' }}>No hay recompensas disponibles por ahora.</p>
        </div>
      ) : (
        <div className="fade-up-2" style={{ display: 'grid', gap: 16 }}>
          {rewards.map((r) => {
            const canAfford = (card?.points_balance ?? 0) >= r.points_cost;
            return (
              <div key={r.id} style={{
                background: 'var(--bg2)', border: '1px solid var(--border)',
                borderRadius: 16, padding: '20px 24px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
                opacity: canAfford ? 1 : 0.6,
                transition: 'border-color 0.2s',
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                    <h3 style={{ fontSize: 16 }}>{r.name}</h3>
                    {r.stock < 5 && r.stock > 0 && (
                      <span className="tag" style={{ color: '#e8a84c', borderColor: '#e8a84c40', fontSize: 10 }}>
                        ¡Quedan {r.stock}!
                      </span>
                    )}
                  </div>
                  <p style={{ color: 'var(--muted)', fontSize: 13 }}>{r.description}</p>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <p style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 18, color: 'var(--gold)', marginBottom: 8 }}>
                    {r.points_cost.toLocaleString()} pts
                  </p>
                  <button
                    className="btn-gold"
                    onClick={() => redeem(r)}
                    disabled={!canAfford || redeeming === r.id}
                    style={{ width: 'auto', padding: '8px 20px', fontSize: 12 }}>
                    {redeeming === r.id ? '...' : canAfford ? 'Canjear' : 'Sin puntos'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RewardsPage;

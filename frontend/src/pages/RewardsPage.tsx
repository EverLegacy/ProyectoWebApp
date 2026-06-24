import { FC, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Reward, LoyaltyCard } from '../types';
import { logEvent } from '../lib/datadog';

interface RedeemResult {
  code: string;
  reward: string;
  pointsSpent: number;
}

const RewardsPage: FC = () => {
  const [rewards, setRewards]     = useState<Reward[]>([]);
  const [card, setCard]           = useState<LoyaltyCard | null>(null);
  const [loading, setLoading]     = useState(true);
  const [redeeming, setRedeeming] = useState<number | null>(null);
  const [confirming, setConfirming] = useState<Reward | null>(null); 
  const [result, setResult]       = useState<RedeemResult | null>(null);
  const [error, setError]         = useState<string | null>(null);
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

  async function confirmRedeem() {
    if (!confirming) return;
    const reward = confirming;
    setRedeeming(reward.id);
    setResult(null);
    setError(null);
    try {
      const { data } = await api.post<RedeemResult>('/rewards/redeem', { rewardId: reward.id });
      setConfirming(null); 
      setResult(data);     

      logEvent('REWARD_REDEEMED', {
        rewardId: reward.id,
        rewardName: reward.name,
        pointsSpent: data.pointsSpent,
      });
      
      const cRes = await api.get<LoyaltyCard>('/points/balance');
      setCard(cRes.data);
    } catch {
      setError('No tienes suficientes puntos.');
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

      {/* Header */}
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

      {/* Error banner */}
      {error && (
        <div className="fade-up" style={{
          background: 'rgba(224,82,82,0.1)', border: '1px solid rgba(224,82,82,0.3)',
          borderRadius: 8, color: 'var(--danger)', fontSize: 13,
          padding: '12px 16px', marginBottom: 24,
        }}>{error}</div>
      )}

      {/* Wizard step 2: confirmation */}
      {confirming && (
        <div data-testid="redeem-confirm-modal" style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 200, padding: 24,
        }}>
          <div className="card fade-up" style={{ width: '100%', maxWidth: 420, padding: 36, textAlign: 'center' }}>
            <h2 style={{ fontSize: 22, marginBottom: 8 }}>¿Confirmas el canje?</h2>
            <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 20 }}>
              Vas a canjear <strong style={{ color: 'var(--text)' }}>{confirming.name}</strong>
            </p>
            <div style={{
              background: 'var(--bg3)', borderRadius: 12, padding: '16px 20px', marginBottom: 24,
              display: 'flex', justifyContent: 'space-between', fontSize: 13,
            }}>
              <span style={{ color: 'var(--muted)' }}>Costo</span>
              <strong data-testid="redeem-confirm-cost" style={{ color: 'var(--gold)' }}>{confirming.points_cost} pts</strong>
            </div>
            <div style={{
              background: 'var(--bg3)', borderRadius: 12, padding: '16px 20px', marginBottom: 24,
              display: 'flex', justifyContent: 'space-between', fontSize: 13,
            }}>
              <span style={{ color: 'var(--muted)' }}>Saldo después del canje</span>
              <strong>{(card?.points_balance ?? 0) - confirming.points_cost} pts</strong>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button data-testid="redeem-cancel" className="btn-outline" onClick={() => setConfirming(null)} style={{ flex: 1 }}>
                Cancelar
              </button>
              <button data-testid="redeem-confirm" className="btn-gold" onClick={confirmRedeem} disabled={redeeming === confirming.id} style={{ flex: 1 }}>
                {redeeming === confirming.id ? '...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Redemption code modal */}
      {result && (
        <div data-testid="redeem-success-modal" style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 200, padding: 24,
        }}>
          <div className="card fade-up" style={{ width: '100%', maxWidth: 420, padding: 36, textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
            <h2 style={{ fontSize: 24, marginBottom: 8 }}>¡Canje exitoso!</h2>
            <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 28 }}>
              Canjeaste <strong style={{ color: 'var(--text)' }}>{result.reward}</strong> por{' '}
              <strong style={{ color: 'var(--gold)' }}>{result.pointsSpent} puntos</strong>
            </p>

            {/* The code */}
            <div style={{
              background: 'var(--bg3)', border: '1px solid var(--gold)',
              borderRadius: 12, padding: '20px 24px', marginBottom: 24,
            }}>
              <p style={{ color: 'var(--muted)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>
                Tu código de canje
              </p>
              <p style={{
                fontFamily: 'Syne', fontSize: 22, fontWeight: 800,
                color: 'var(--gold)', letterSpacing: '0.08em',
              }}>
                {result.code}
              </p>
            </div>

            <p style={{ color: 'var(--muted)', fontSize: 12, marginBottom: 28, lineHeight: 1.6 }}>
              Presenta este código en cualquier tienda participante para hacer válida tu recompensa.
              El código es de un solo uso.
            </p>

            <button data-testid="redeem-success-close" className="btn-gold" onClick={() => setResult(null)}>
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* Rewards list */}
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
              <div key={r.id} data-testid={`reward-card-${r.id}`} style={{
                background: 'var(--bg2)', border: '1px solid var(--border)',
                borderRadius: 16, padding: '20px 24px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
                opacity: canAfford ? 1 : 0.55,
                transition: 'border-color 0.2s, opacity 0.3s',
              }}
                onMouseEnter={e => canAfford && (e.currentTarget.style.borderColor = 'var(--gold)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}>
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
                    data-testid={`reward-redeem-${r.id}`}
                    className="btn-gold"
                    onClick={() => setConfirming(r)}
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
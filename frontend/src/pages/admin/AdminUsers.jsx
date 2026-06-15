import { useState, useEffect } from 'react'
import AdminLayout from './AdminLayout'
import { getUsers, approveUser, blockUser, setUserPlan } from '../../lib/adminApi'
import { useAuth } from '../../context/AuthContext'

const PLAN_STYLES = {
  free:    { background: 'rgba(74,96,120,0.2)',  color: '#7A9AB8' },
  starter: { background: 'rgba(78,199,245,0.15)', color: '#4EC7F5' },
  pro:     { background: 'rgba(254,120,8,0.15)',  color: '#FFA040' },
}

const tdStyle = { padding: '0.65rem 1rem', fontSize: '0.8rem' }

export default function AdminUsers() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [actionLoading, setActionLoading] = useState(null)
  const [adminUid, setAdminUid] = useState(null)

  useEffect(() => {
    if (currentUser) setAdminUid(currentUser.uid)
  }, [currentUser])

  const load = (p) => {
    setLoading(true); setError(null)
    getUsers(p).then(setUsers).catch(e => setError(e.message)).finally(() => setLoading(false))
  }

  useEffect(() => { load(page) }, [page])

  const handleApprove = async (userId) => {
    setActionLoading(userId + '-approve')
    try {
      await approveUser(userId)
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, approved: true } : u))
    } finally { setActionLoading(null) }
  }

  const handleBlock = async (userId) => {
    if (!confirm('¿Estás seguro que querés bloquear este usuario?')) return
    setActionLoading(userId + '-block')
    try {
      await blockUser(userId)
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, approved: false, status: 'canceled' } : u))
    } finally { setActionLoading(null) }
  }

  const handleSetPlan = async (userId, currentPlan) => {
    const newPlan = currentPlan === 'free' ? 'starter' : 'free'
    const action = newPlan === 'starter' ? 'activar Starter' : 'revertir a Free'
    if (!window.confirm(`¿Confirmar ${action} para este usuario?`)) return
    setActionLoading(userId + '-plan')
    try {
      await setUserPlan(userId, newPlan)
      load(page)
    } catch {
      alert('Error al cambiar el plan')
    } finally {
      setActionLoading(null)
    }
  }

  const thStyle = {
    padding: '0.5rem 1rem',
    textAlign: 'left',
    color: '#4A6078',
    fontWeight: 600,
    fontSize: '0.68rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  }

  return (
    <AdminLayout>
      {loading && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}>
          <div style={{ width: 28, height: 28, border: '3px solid #1D2A3A', borderTop: '3px solid #4EC7F5', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        </div>
      )}
      {error && (
        <div style={{ background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.3)', borderRadius: 5, padding: '0.75rem 1rem', color: '#FCA5A5', fontSize: '0.8rem', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      {!loading && (
        <>
          <div style={{ background: '#162030', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 5, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: '#1D2A3A' }}>
                <tr>
                  {['Email', 'Plan', 'Uso', 'Risk', 'Estado', 'Acciones'].map(h => (
                    <th key={h} style={thStyle}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map(u => {
                  const isMe = u.firebase_uid === adminUid
                  const planStyle = PLAN_STYLES[u.plan] ?? PLAN_STYLES.free
                  const riskHigh = (u.risk_score ?? 0) > 60
                  return (
                    <tr key={u.id} style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ ...tdStyle, color: '#E8F0F8', fontWeight: 500 }}>{u.email}</td>
                      <td style={tdStyle}>
                        <span style={{ ...planStyle, display: 'inline-flex', alignItems: 'center', padding: '2px 8px', borderRadius: 999, fontSize: '0.7rem', fontWeight: 600 }}>
                          {u.plan ?? '—'}
                        </span>
                      </td>
                      <td style={{ ...tdStyle, color: '#7A9AB8' }}>
                        {u.reports_used ?? 0}/{u.reports_limit ?? 0}
                      </td>
                      <td style={tdStyle}>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', padding: '2px 8px', borderRadius: 999, fontSize: '0.7rem', fontWeight: 600,
                          background: riskHigh ? 'rgba(220,38,38,0.15)' : 'rgba(74,96,120,0.2)',
                          color: riskHigh ? '#FCA5A5' : '#7A9AB8',
                        }}>
                          {u.risk_score ?? 0}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', padding: '2px 8px', borderRadius: 999, fontSize: '0.7rem', fontWeight: 600,
                          background: u.approved ? 'rgba(16,185,129,0.15)' : 'rgba(220,38,38,0.15)',
                          color: u.approved ? '#6EE7B7' : '#FCA5A5',
                        }}>
                          {u.approved ? 'Aprobado' : 'Bloqueado'}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        {isMe ? (
                          <span style={{ color: '#4A6078', fontSize: '0.75rem', fontStyle: 'italic' }}>Sos vos</span>
                        ) : (
                          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                            {!u.approved && (
                              <button
                                onClick={() => handleApprove(u.id)}
                                disabled={actionLoading === u.id + '-approve'}
                                style={{ padding: '3px 10px', borderRadius: 3, border: '1px solid rgba(16,185,129,0.4)', background: 'rgba(16,185,129,0.1)', color: '#6EE7B7', fontSize: '0.72rem', cursor: 'pointer', fontWeight: 500 }}
                              >
                                Aprobar
                              </button>
                            )}
                            {u.approved && (
                              <button
                                onClick={() => handleBlock(u.id)}
                                disabled={actionLoading === u.id + '-block'}
                                style={{ padding: '3px 10px', borderRadius: 3, border: '1px solid rgba(220,38,38,0.4)', background: 'rgba(220,38,38,0.1)', color: '#FCA5A5', fontSize: '0.72rem', cursor: 'pointer', fontWeight: 500 }}
                              >
                                Bloquear
                              </button>
                            )}
                            {(!u.plan || u.plan === 'free') && (
                              <button
                                onClick={() => handleSetPlan(u.id, u.plan || 'free')}
                                disabled={actionLoading === u.id + '-plan'}
                                style={{ padding: '3px 10px', borderRadius: 3, border: '1px solid rgba(78,199,245,0.4)', background: 'rgba(78,199,245,0.1)', color: '#4EC7F5', fontSize: '0.72rem', cursor: 'pointer', fontWeight: 500 }}
                              >
                                {actionLoading === u.id + '-plan' ? '...' : 'Activar Starter'}
                              </button>
                            )}
                            {u.plan === 'starter' && (
                              <button
                                onClick={() => handleSetPlan(u.id, u.plan)}
                                disabled={actionLoading === u.id + '-plan'}
                                style={{ padding: '3px 10px', borderRadius: 3, border: '1px solid rgba(74,96,120,0.5)', background: 'rgba(74,96,120,0.15)', color: '#7A9AB8', fontSize: '0.72rem', cursor: 'pointer', fontWeight: 500 }}
                              >
                                {actionLoading === u.id + '-plan' ? '...' : 'Revertir a Free'}
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#4A6078', fontSize: '0.8rem' }}>
                      Sin usuarios
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1rem' }}>
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              style={{
                padding: '0.4rem 1rem',
                borderRadius: 3,
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'transparent',
                color: page === 1 ? '#4A6078' : '#7A9AB8',
                fontSize: '0.8rem',
                cursor: page === 1 ? 'not-allowed' : 'pointer',
              }}
            >
              Anterior
            </button>
            <span style={{ color: '#4A6078', fontSize: '0.8rem' }}>Página {page}</span>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={users.length < 20}
              style={{
                padding: '0.4rem 1rem',
                borderRadius: 3,
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'transparent',
                color: users.length < 20 ? '#4A6078' : '#7A9AB8',
                fontSize: '0.8rem',
                cursor: users.length < 20 ? 'not-allowed' : 'pointer',
              }}
            >
              Siguiente
            </button>
          </div>
        </>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </AdminLayout>
  )
}

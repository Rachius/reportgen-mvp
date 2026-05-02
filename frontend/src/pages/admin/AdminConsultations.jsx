import { useState, useEffect } from 'react'
import AdminLayout from './AdminLayout'
import { getConsultations, answerConsultation } from '../../lib/adminApi'

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const cardStyle = {
  background: '#162030',
  border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: 5,
  overflow: 'hidden',
}

function ConsultationCard({ c, onAnswered }) {
  const [expanded, setExpanded] = useState(false)
  const [responding, setResponding] = useState(false)
  const [response, setResponse] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState(null)

  const handleSend = async () => {
    if (!response.trim()) return
    setSending(true); setError(null)
    try {
      await answerConsultation(c.id, response)
      onAnswered(c.id)
    } catch (e) {
      setError(e.message)
    } finally {
      setSending(false)
    }
  }

  const isPending = c.status === 'pending'

  return (
    <div style={cardStyle}>
      <div
        onClick={() => setExpanded(v => !v)}
        style={{ padding: '0.875rem 1.25rem', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem', cursor: 'pointer' }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        <div style={{ minWidth: 0 }}>
          <p style={{ color: '#E8F0F8', fontWeight: 500, fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {c.subject}
          </p>
          <p style={{ color: '#4A6078', fontSize: '0.72rem', marginTop: 2 }}>
            {c.user_email} · {formatDate(c.created_at)}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', padding: '2px 8px', borderRadius: 999, fontSize: '0.7rem', fontWeight: 600,
            background: isPending ? 'rgba(251,191,36,0.15)' : 'rgba(16,185,129,0.15)',
            color: isPending ? '#FCD34D' : '#6EE7B7',
          }}>
            {isPending ? 'Pendiente' : 'Respondida'}
          </span>
          <span style={{ color: '#4A6078', transition: 'transform 0.2s', transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', display: 'inline-block' }}>▾</span>
        </div>
      </div>

      {expanded && (
        <div style={{ padding: '0.875rem 1.25rem 1.25rem', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <p style={{ color: '#4A6078', fontWeight: 600, fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
              Mensaje
            </p>
            <p style={{ color: '#7A9AB8', fontSize: '0.8rem', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{c.message}</p>
          </div>

          {c.attachment_url && (
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.875rem' }}>
              <p style={{ color: '#4A6078', fontWeight: 600, fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                Archivo adjunto
              </p>
              {/\.(png|jpg|jpeg|webp)$/i.test(c.attachment_url) ? (
                <a href={c.attachment_url} target="_blank" rel="noopener noreferrer">
                  <img src={c.attachment_url} alt="Adjunto" style={{
                    maxHeight: 128, borderRadius: 6,
                    border: '1px solid rgba(255,255,255,0.08)',
                    objectFit: 'contain', cursor: 'pointer',
                    transition: 'opacity 0.15s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                  />
                </a>
              ) : (
                <a href={c.attachment_url} target="_blank" rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    padding: '0.4rem 0.875rem', borderRadius: 4,
                    background: 'rgba(78,199,245,0.08)', border: '1px solid rgba(78,199,245,0.2)',
                    color: '#4EC7F5', fontSize: '0.78rem', fontWeight: 500,
                    textDecoration: 'none', transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(78,199,245,0.14)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(78,199,245,0.08)'}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                  Ver PDF adjunto
                </a>
              )}
            </div>
          )}

          {c.admin_response && (
            <div style={{ background: 'rgba(78,199,245,0.08)', border: '1px solid rgba(78,199,245,0.2)', borderRadius: 3, padding: '0.75rem' }}>
              <p style={{ color: '#4EC7F5', fontWeight: 600, fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Respuesta</p>
              <p style={{ color: '#7A9AB8', fontSize: '0.8rem', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{c.admin_response}</p>
              {c.answered_at && (
                <p style={{ color: '#4A6078', fontSize: '0.7rem', marginTop: 6 }}>{formatDate(c.answered_at)}</p>
              )}
            </div>
          )}

          {isPending && (
            !responding ? (
              <button
                onClick={() => setResponding(true)}
                style={{ padding: '0.4rem 1rem', borderRadius: 3, border: '1.5px solid #FE7808', background: 'rgba(78,199,245,0.10)', color: '#FE7808', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 500, alignSelf: 'flex-start' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#FE7808'; e.currentTarget.style.color = '#fff' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(78,199,245,0.10)'; e.currentTarget.style.color = '#FE7808' }}
              >
                Responder
              </button>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <textarea
                  value={response}
                  onChange={e => setResponse(e.target.value)}
                  rows={4}
                  placeholder="Escribí tu respuesta..."
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    borderRadius: 3,
                    border: '1px solid rgba(255,255,255,0.14)',
                    background: '#1D2A3A',
                    color: '#E8F0F8',
                    fontSize: '0.8rem',
                    resize: 'none',
                    outline: 'none',
                  }}
                  onFocus={e => e.currentTarget.style.borderColor = '#4EC7F5'}
                  onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.14)'}
                />
                {error && <p style={{ color: '#FCA5A5', fontSize: '0.75rem' }}>{error}</p>}
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={handleSend}
                    disabled={sending || !response.trim()}
                    style={{ padding: '0.4rem 1rem', borderRadius: 3, border: '1.5px solid #FE7808', background: sending ? 'rgba(254,120,8,0.2)' : '#FE7808', color: '#fff', fontSize: '0.8rem', cursor: sending ? 'not-allowed' : 'pointer', fontWeight: 500 }}
                  >
                    {sending ? 'Enviando...' : 'Enviar respuesta'}
                  </button>
                  <button
                    onClick={() => { setResponding(false); setResponse('') }}
                    style={{ padding: '0.4rem 1rem', borderRadius: 3, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#7A9AB8', fontSize: '0.8rem', cursor: 'pointer' }}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  )
}

export default function AdminConsultations() {
  const [tab, setTab] = useState('pending')
  const [consultations, setConsultations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(true); setError(null)
    getConsultations().then(setConsultations).catch(e => setError(e.message)).finally(() => setLoading(false))
  }, [])

  const handleAnswered = (id) => {
    setConsultations(prev => prev.map(c => c.id === id ? { ...c, status: 'answered' } : c))
  }

  const filtered = consultations.filter(c => c.status === tab)
  const pendingCount = consultations.filter(c => c.status === 'pending').length
  const answeredCount = consultations.filter(c => c.status === 'answered').length

  const tabBtnStyle = (active) => ({
    padding: '0.4rem 1rem',
    borderRadius: 3,
    border: active ? '1px solid #FE7808' : '1px solid rgba(78,199,245,0.25)',
    background: active ? 'rgba(254,120,8,0.15)' : 'rgba(78,199,245,0.07)',
    color: active ? '#FFA040' : '#4EC7F5',
    fontSize: '0.8rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.15s',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
  })

  return (
    <AdminLayout>
      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: '1.5rem' }}>
        {[
          { key: 'pending', label: 'Pendientes', count: pendingCount },
          { key: 'answered', label: 'Respondidas', count: answeredCount },
        ].map(({ key, label, count }) => (
          <button key={key} onClick={() => setTab(key)} style={tabBtnStyle(tab === key)}>
            {label}
            <span style={{
              minWidth: 18, height: 18, background: tab === key ? '#FE7808' : 'rgba(78,199,245,0.2)',
              color: tab === key ? '#fff' : '#4EC7F5',
              borderRadius: 999, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 700, padding: '0 4px',
            }}>
              {count}
            </span>
          </button>
        ))}
      </div>

      {loading && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 160 }}>
          <div style={{ width: 28, height: 28, border: '3px solid #1D2A3A', borderTop: '3px solid #4EC7F5', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        </div>
      )}
      {error && (
        <div style={{ background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.3)', borderRadius: 5, padding: '0.75rem 1rem', color: '#FCA5A5', fontSize: '0.8rem' }}>
          {error}
        </div>
      )}
      {!loading && !error && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filtered.length === 0 && (
            <p style={{ color: '#4A6078', fontSize: '0.8rem', textAlign: 'center', padding: '3rem 0' }}>
              Sin consultas {tab === 'pending' ? 'pendientes' : 'respondidas'}
            </p>
          )}
          {filtered.map(c => (
            <ConsultationCard key={c.id} c={c} onAnswered={handleAnswered} />
          ))}
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </AdminLayout>
  )
}

import { useState, useEffect } from 'react'
import PageLayout from '../components/PageLayout'
import { getSubscription } from '../lib/reportApi'
import { sendConsultation, getUserConsultations } from '../lib/adminApi'

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export default function Consultations() {
  const [subscription, setSubscription] = useState(null)
  const [consultations, setConsultations] = useState([])
  const [loading, setLoading] = useState(true)
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState(null)
  const [sendSuccess, setSendSuccess] = useState(false)

  const load = async () => {
    try {
      const [sub, list] = await Promise.all([getSubscription(), getUserConsultations()])
      setSubscription(sub)
      setConsultations(list)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const remaining = subscription
    ? Math.max(0, (subscription.consultations_limit ?? 0) - (subscription.consultations_used ?? 0))
    : 0

  const canSend = subscription && ['starter', 'pro'].includes(subscription.plan) && remaining > 0

  const handleSend = async (e) => {
    e.preventDefault()
    if (!subject.trim() || !message.trim()) return
    setSending(true)
    setSendError(null)
    setSendSuccess(false)
    try {
      await sendConsultation(subject.trim(), message.trim())
      setSendSuccess(true)
      setSubject('')
      setMessage('')
      const [list, sub] = await Promise.all([getUserConsultations(), getSubscription()])
      setConsultations(list)
      setSubscription(sub)
    } catch (e) {
      setSendError(e.response?.data?.detail ?? e.message)
    } finally {
      setSending(false)
    }
  }

  return (
    <PageLayout>
      <div style={{ maxWidth: 680, margin: '0 auto' }}>
        <div className="mb-6">
          <h1 style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '1.25rem' }}>
            Consultas al analista
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: 4 }}>
            Enviá tus preguntas y recibí respuestas personalizadas.
          </p>
        </div>

        {loading && (
          <div className="flex items-center justify-center h-32">
            <div style={{
              width: 28,
              height: 28,
              border: '3px solid var(--blue-light)',
              borderTop: '3px solid var(--blue)',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }} />
          </div>
        )}

        {!loading && subscription && (
          <>
            {/* Disponibilidad */}
            <div style={{
              background: canSend ? 'var(--blue-light)' : 'var(--orange-light)',
              border: `1px solid ${canSend ? 'var(--blue)' : 'var(--orange)'}`,
              borderRadius: 'var(--radius-card)',
              padding: '0.875rem 1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '1.5rem',
            }}>
              <div style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: canSend ? 'rgba(78,199,245,0.2)' : 'rgba(254,120,8,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '1rem',
                color: canSend ? 'var(--blue-darker)' : 'var(--orange-dark)',
                flexShrink: 0,
              }}>
                {remaining}
              </div>
              <div>
                <p style={{ fontWeight: 600, fontSize: '0.875rem', color: canSend ? 'var(--blue-darker)' : 'var(--orange-dark)' }}>
                  {canSend
                    ? `Tenés ${remaining} consulta${remaining !== 1 ? 's' : ''} disponible${remaining !== 1 ? 's' : ''} este mes`
                    : subscription.plan === 'free'
                      ? 'Necesitás el plan Starter o Pro para enviar consultas'
                      : 'Agotaste tus consultas disponibles este mes'}
                </p>
                <p style={{ fontSize: '0.75rem', marginTop: 2, color: canSend ? 'var(--blue-dark)' : 'var(--orange)' }}>
                  {subscription.consultations_used ?? 0} de {subscription.consultations_limit ?? 0} utilizadas
                </p>
              </div>
            </div>

            {/* Formulario */}
            <div className="card mb-6">
              <h2 style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.875rem', marginBottom: '1rem' }}>
                Nueva consulta
              </h2>
              <form onSubmit={handleSend} className="space-y-4">
                <div>
                  <label style={{ color: 'var(--text-muted)', fontSize: '0.72rem', display: 'block', marginBottom: 4 }}>
                    Asunto
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    disabled={!canSend}
                    placeholder="¿Sobre qué querés consultar?"
                    className="input"
                  />
                </div>
                <div>
                  <label style={{ color: 'var(--text-muted)', fontSize: '0.72rem', display: 'block', marginBottom: 4 }}>
                    Mensaje
                  </label>
                  <textarea
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    disabled={!canSend}
                    rows={4}
                    placeholder="Describí tu consulta con el mayor detalle posible..."
                    className="input"
                    style={{ resize: 'none' }}
                  />
                </div>

                {sendError && <p style={{ color: '#DC2626', fontSize: '0.75rem' }}>{sendError}</p>}
                {sendSuccess && <p style={{ color: 'var(--blue-dark)', fontSize: '0.75rem' }}>Consulta enviada correctamente.</p>}

                <button
                  type="submit"
                  disabled={!canSend || sending || !subject.trim() || !message.trim()}
                  className="btn btn-primary"
                >
                  {sending ? 'Enviando...' : 'Enviar consulta'}
                </button>
              </form>
            </div>

            {/* Historial */}
            <div>
              <h2 style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.75rem' }}>
                Mis consultas
              </h2>
              {consultations.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                    Todavía no enviaste ninguna consulta
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {consultations.map(c => (
                    <div key={c.id} style={{
                      background: 'var(--surface)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-card)',
                      overflow: 'hidden',
                    }}>
                      <div style={{ padding: '0.875rem 1.25rem', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem' }}>
                        <div>
                          <p style={{ color: 'var(--text-primary)', fontWeight: 500, fontSize: '0.875rem' }}>{c.subject}</p>
                          <p style={{ color: 'var(--text-muted)', fontSize: '0.72rem', marginTop: 2 }}>{formatDate(c.created_at)}</p>
                        </div>
                        <span className={`pill ${c.status === 'pending' ? 'pill-amber' : 'pill-green'}`} style={{ flexShrink: 0 }}>
                          {c.status === 'pending' ? 'Pendiente' : 'Respondida'}
                        </span>
                      </div>
                      <div style={{ padding: '0.75rem 1.25rem 1rem', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <div>
                          <p className="section-label mb-1">Tu mensaje</p>
                          <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', whiteSpace: 'pre-wrap' }}>{c.message}</p>
                        </div>
                        {c.admin_response && (
                          <div style={{
                            background: 'var(--blue-light)',
                            border: '1px solid rgba(78,199,245,0.3)',
                            borderRadius: 'var(--radius-btn)',
                            padding: '0.75rem',
                          }}>
                            <p style={{ color: 'var(--blue-darker)', fontWeight: 600, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
                              Respuesta del analista
                            </p>
                            <p style={{ color: 'var(--text-primary)', fontSize: '0.8rem', whiteSpace: 'pre-wrap' }}>{c.admin_response}</p>
                            {c.answered_at && (
                              <p style={{ color: 'var(--text-muted)', fontSize: '0.7rem', marginTop: 6 }}>{formatDate(c.answered_at)}</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </PageLayout>
  )
}

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
  const [attachedFile, setAttachedFile] = useState(null)
  const [attachPreview, setAttachPreview] = useState(null)
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

  const handleAttachFile = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const allowed = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'application/pdf']
    if (!allowed.includes(file.type)) {
      alert('Solo se permiten imágenes (PNG, JPG, WEBP) o PDF')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('El archivo no puede superar 5 MB')
      return
    }
    setAttachedFile(file)
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (ev) => setAttachPreview(ev.target.result)
      reader.readAsDataURL(file)
    } else {
      setAttachPreview(null)
    }
  }

  const handleRemoveAttachment = () => {
    setAttachedFile(null)
    setAttachPreview(null)
  }

  const handleSend = async (e) => {
    e.preventDefault()
    if (!subject.trim() || !message.trim()) return
    setSending(true)
    setSendError(null)
    setSendSuccess(false)
    try {
      // TODO: cuando se integre GCS, subir attachedFile antes de enviar y pasar la URL
      if (attachedFile) {
        console.log('Archivo adjunto (pendiente GCS):', attachedFile.name)
      }
      await sendConsultation(subject.trim(), message.trim())
      setSendSuccess(true)
      setSubject('')
      setMessage('')
      setAttachedFile(null)
      setAttachPreview(null)
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

        {/* Header */}
        <div className="mb-6">
          <h1 className="grad-text" style={{ fontWeight: 700, fontSize: '1.25rem' }}>
            Consultas al analista
          </h1>
          <p style={{ color: 'var(--text2)', fontSize: '0.875rem', marginTop: 4 }}>
            Enviá tus preguntas y recibí respuestas personalizadas.
          </p>
        </div>

        {loading && (
          <div className="flex items-center justify-center h-32">
            <div className="spinner" />
          </div>
        )}

        {!loading && subscription && (
          <>
            {/* Estado banner */}
            <div style={{
              background: canSend ? 'var(--blue-light)' : 'var(--orange-light)',
              border: `1px solid ${canSend ? 'var(--blue)' : 'var(--orange)'}`,
              borderRadius: 'var(--radius-card)',
              padding: '0.875rem 1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.875rem',
              marginBottom: '1.5rem',
            }}>
              {/* Badge count */}
              <div style={{
                width: 42, height: 42, borderRadius: '50%',
                background: canSend ? 'rgba(78,199,245,0.2)' : 'rgba(254,120,8,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: '1rem',
                color: canSend ? 'var(--blue-darker)' : 'var(--orange-dark)',
                flexShrink: 0,
              }}>
                {remaining}
              </div>
              <div>
                <p style={{ fontWeight: 600, fontSize: '0.875rem', color: canSend ? 'var(--blue-darker)' : 'var(--orange-dark)' }}>
                  {canSend
                    ? `${remaining} consulta${remaining !== 1 ? 's' : ''} disponible${remaining !== 1 ? 's' : ''} este mes`
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
            <div className="card mb-5">
              <h2 style={{ color: 'var(--text)', fontWeight: 600, fontSize: '0.875rem', marginBottom: '1rem' }}>
                Nueva consulta
              </h2>
              <form onSubmit={handleSend} className="space-y-4">
                <div>
                  <label style={{ color: 'var(--text3)', fontSize: '0.72rem', display: 'block', marginBottom: 4 }}>
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
                  <label style={{ color: 'var(--text3)', fontSize: '0.72rem', display: 'block', marginBottom: 4 }}>
                    Mensaje
                  </label>
                  <textarea
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    disabled={!canSend}
                    rows={5}
                    placeholder="Describí tu consulta con el mayor detalle posible..."
                    className="input"
                    style={{ resize: 'none', minHeight: 120 }}
                  />
                </div>

                {/* Attachment zone */}
                <div className="mt-1">
                  {!attachedFile ? (
                    <label style={{
                      display: 'inline-flex', alignItems: 'center', gap: 8,
                      cursor: canSend ? 'pointer' : 'not-allowed',
                      fontSize: '0.75rem', fontWeight: 500,
                      color: 'var(--text3)', opacity: canSend ? 1 : 0.5,
                    }}
                      onMouseEnter={e => { if (canSend) e.currentTarget.style.color = 'var(--blue-dark)' }}
                      onMouseLeave={e => { e.currentTarget.style.color = 'var(--text3)' }}
                    >
                      <input type="file" style={{ display: 'none' }}
                        accept="image/png,image/jpeg,image/jpg,image/webp,application/pdf"
                        onChange={handleAttachFile} disabled={!canSend} />
                      <span style={{
                        width: 28, height: 28, borderRadius: 8, display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        border: '1.5px dashed var(--border-strong)',
                        background: 'var(--bg3)', transition: 'all 0.15s',
                      }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                        </svg>
                      </span>
                      Adjuntar imagen o PDF
                      <span style={{ color: 'var(--text3)', fontWeight: 400, opacity: 0.7 }}>(máx. 5 MB)</span>
                    </label>
                  ) : (
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '8px 10px', borderRadius: 10,
                      background: 'var(--blue-light)', border: '1px solid rgba(78,199,245,0.25)',
                    }}>
                      {attachPreview ? (
                        <img src={attachPreview} alt="preview" style={{
                          width: 40, height: 40, borderRadius: 8, objectFit: 'cover',
                          border: '1px solid rgba(78,199,245,0.3)', flexShrink: 0,
                        }} />
                      ) : (
                        <div style={{
                          width: 40, height: 40, borderRadius: 8, flexShrink: 0,
                          background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="1.5">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                            <line x1="9" y1="13" x2="15" y2="13" />
                            <line x1="9" y1="17" x2="15" y2="17" />
                          </svg>
                        </div>
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ color: 'var(--text)', fontWeight: 600, fontSize: '0.78rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {attachedFile.name}
                        </p>
                        <p style={{ color: 'var(--text3)', fontSize: '0.67rem', marginTop: 1 }}>
                          {(attachedFile.size / 1024).toFixed(0)} KB · {attachedFile.type.startsWith('image/') ? 'Imagen' : 'PDF'}
                        </p>
                      </div>
                      <button type="button" onClick={handleRemoveAttachment} style={{
                        width: 24, height: 24, borderRadius: '50%', border: 'none',
                        background: 'transparent', cursor: 'pointer', flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'var(--text3)',
                      }}
                        onMouseEnter={e => { e.currentTarget.style.color = '#EF4444'; e.currentTarget.style.background = 'rgba(239,68,68,0.08)' }}
                        onMouseLeave={e => { e.currentTarget.style.color = 'var(--text3)'; e.currentTarget.style.background = 'transparent' }}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>

                {!canSend && (
                  <p style={{ color: 'var(--text3)', fontSize: '0.78rem', fontStyle: 'italic' }}>
                    Actualizá tu plan para enviar consultas
                  </p>
                )}
                {sendError && (
                  <p style={{ color: '#DC2626', fontSize: '0.75rem', background: '#FEF2F2', padding: '0.4rem 0.75rem', borderRadius: 'var(--radius-btn)', border: '1px solid rgba(239,68,68,0.2)' }}>
                    {sendError}
                  </p>
                )}
                {sendSuccess && (
                  <p style={{ color: 'var(--blue-dark)', fontSize: '0.75rem' }}>Consulta enviada correctamente.</p>
                )}

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
              <h2 style={{ color: 'var(--text)', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.75rem' }}>
                Mis consultas
              </h2>
              {consultations.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
                  <p style={{ fontSize: '1.75rem', marginBottom: 8 }}>💬</p>
                  <p style={{ color: 'var(--text)', fontWeight: 500, fontSize: '0.875rem', marginBottom: 4 }}>
                    Todavía no enviaste ninguna consulta
                  </p>
                  <p style={{ color: 'var(--text3)', fontSize: '0.8rem' }}>
                    Tus consultas aparecerán aquí una vez que las envíes.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {consultations.map(c => (
                    <div key={c.id} style={{
                      background: 'var(--card)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-card)',
                      overflow: 'hidden',
                      boxShadow: 'var(--shadow)',
                    }}>
                      <div style={{ padding: '0.875rem 1.25rem', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem' }}>
                        <div>
                          <p style={{ color: 'var(--text)', fontWeight: 500, fontSize: '0.875rem' }}>{c.subject}</p>
                          <p style={{ color: 'var(--text3)', fontSize: '0.72rem', marginTop: 2 }}>{formatDate(c.created_at)}</p>
                        </div>
                        <span className={`pill ${c.status === 'pending' ? 'pill-amber' : 'pill-green'}`} style={{ flexShrink: 0 }}>
                          {c.status === 'pending' ? 'Pendiente' : 'Respondida'}
                        </span>
                      </div>
                      <div style={{ padding: '0.75rem 1.25rem 1rem', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <div>
                          <p className="section-label mb-1">Tu mensaje</p>
                          <p style={{ color: 'var(--text2)', fontSize: '0.8rem', whiteSpace: 'pre-wrap' }}>{c.message}</p>
                          {c.attachment_url && (
                            <a href={c.attachment_url} target="_blank" rel="noopener noreferrer"
                              style={{
                                display: 'inline-flex', alignItems: 'center', gap: 5,
                                marginTop: 6, fontSize: '0.67rem', fontWeight: 600,
                                color: 'var(--blue-dark)', textDecoration: 'none',
                              }}
                              onMouseEnter={e => e.currentTarget.style.color = 'var(--blue-darker)'}
                              onMouseLeave={e => e.currentTarget.style.color = 'var(--blue-dark)'}
                            >
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                              </svg>
                              Ver adjunto
                            </a>
                          )}
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
                            <p style={{ color: 'var(--text)', fontSize: '0.8rem', whiteSpace: 'pre-wrap' }}>{c.admin_response}</p>
                            {c.answered_at && (
                              <p style={{ color: 'var(--text3)', fontSize: '0.7rem', marginTop: 6 }}>{formatDate(c.answered_at)}</p>
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
    </PageLayout>
  )
}

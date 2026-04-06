import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
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
      const list = await getUserConsultations()
      setConsultations(list)
      const sub = await getSubscription()
      setSubscription(sub)
    } catch (e) {
      setSendError(e.response?.data?.detail ?? e.message)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Consultas al analista</h1>
          <p className="text-sm text-gray-500 mt-1">Enviá tus preguntas y recibí respuestas personalizadas</p>
        </div>

        {loading && (
          <div className="flex items-center justify-center h-32">
            <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && subscription && (
          <>
            {/* Disponibilidad */}
            <div className={`rounded-xl border p-4 flex items-center gap-3 ${canSend ? 'bg-teal-50 border-teal-200' : 'bg-amber-50 border-amber-200'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${canSend ? 'bg-teal-100 text-teal-700' : 'bg-amber-100 text-amber-700'}`}>
                {remaining}
              </div>
              <div>
                <p className={`text-sm font-semibold ${canSend ? 'text-teal-800' : 'text-amber-800'}`}>
                  {canSend
                    ? `Tenés ${remaining} consulta${remaining !== 1 ? 's' : ''} disponible${remaining !== 1 ? 's' : ''} este mes`
                    : subscription.plan === 'free'
                      ? 'Necesitás el plan Starter o Pro para enviar consultas'
                      : 'Agotaste tus consultas disponibles este mes'}
                </p>
                <p className={`text-xs mt-0.5 ${canSend ? 'text-teal-600' : 'text-amber-600'}`}>
                  {subscription.consultations_used ?? 0} de {subscription.consultations_limit ?? 0} utilizadas
                </p>
              </div>
            </div>

            {/* Formulario */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-sm font-semibold text-gray-700 mb-4">Nueva consulta</h2>
              <form onSubmit={handleSend} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Asunto</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    disabled={!canSend}
                    placeholder="¿Sobre qué querés consultar?"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-gray-50 disabled:text-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Mensaje</label>
                  <textarea
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    disabled={!canSend}
                    rows={4}
                    placeholder="Describí tu consulta con el mayor detalle posible..."
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-gray-50 disabled:text-gray-400 resize-none"
                  />
                </div>

                {sendError && (
                  <p className="text-xs text-red-600">{sendError}</p>
                )}
                {sendSuccess && (
                  <p className="text-xs text-teal-600">Consulta enviada correctamente.</p>
                )}

                <button
                  type="submit"
                  disabled={!canSend || sending || !subject.trim() || !message.trim()}
                  className="px-5 py-2 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {sending ? 'Enviando...' : 'Enviar consulta'}
                </button>
              </form>
            </div>

            {/* Historial */}
            <div>
              <h2 className="text-sm font-semibold text-gray-700 mb-3">Mis consultas</h2>
              {consultations.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 px-6 py-10 text-center text-sm text-gray-400">
                  Todavía no enviaste ninguna consulta
                </div>
              ) : (
                <div className="space-y-3">
                  {consultations.map(c => (
                    <div key={c.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                      <div className="px-5 py-4 flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{c.subject}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{formatDate(c.created_at)}</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${c.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                          {c.status === 'pending' ? 'Pendiente' : 'Respondida'}
                        </span>
                      </div>
                      <div className="px-5 pb-4 space-y-3 border-t border-gray-100 pt-3">
                        <div>
                          <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Tu mensaje</p>
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">{c.message}</p>
                        </div>
                        {c.admin_response && (
                          <div className="bg-teal-50 rounded-lg p-4">
                            <p className="text-xs font-semibold text-teal-600 uppercase mb-1">Respuesta del analista</p>
                            <p className="text-sm text-teal-800 whitespace-pre-wrap">{c.admin_response}</p>
                            {c.answered_at && (
                              <p className="text-xs text-teal-500 mt-2">{formatDate(c.answered_at)}</p>
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
    </div>
  )
}

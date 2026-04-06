import { useState, useEffect } from 'react'
import AdminLayout from './AdminLayout'
import { getConsultations, answerConsultation } from '../../lib/adminApi'

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function ConsultationCard({ c, onAnswered }) {
  const [expanded, setExpanded] = useState(false)
  const [responding, setResponding] = useState(false)
  const [response, setResponse] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState(null)

  const handleSend = async () => {
    if (!response.trim()) return
    setSending(true)
    setError(null)
    try {
      await answerConsultation(c.id, response)
      onAnswered(c.id)
    } catch (e) {
      setError(e.message)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div
        className="px-5 py-4 flex items-start justify-between gap-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded(v => !v)}
      >
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{c.subject}</p>
          <p className="text-xs text-gray-500 mt-0.5">{c.user_email} · {formatDate(c.created_at)}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${c.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
            {c.status === 'pending' ? 'Pendiente' : 'Respondida'}
          </span>
          <svg className={`w-4 h-4 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {expanded && (
        <div className="px-5 pb-5 border-t border-gray-100 pt-4 space-y-4">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Mensaje</p>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{c.message}</p>
          </div>

          {c.admin_response && (
            <div className="bg-teal-50 rounded-lg p-4">
              <p className="text-xs font-semibold text-teal-600 uppercase mb-1">Respuesta</p>
              <p className="text-sm text-teal-800 whitespace-pre-wrap">{c.admin_response}</p>
              {c.answered_at && (
                <p className="text-xs text-teal-500 mt-2">{formatDate(c.answered_at)}</p>
              )}
            </div>
          )}

          {c.status === 'pending' && (
            <div className="space-y-3">
              {!responding ? (
                <button
                  onClick={() => setResponding(true)}
                  className="px-4 py-2 text-sm bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                >
                  Responder
                </button>
              ) : (
                <div className="space-y-3">
                  <textarea
                    value={response}
                    onChange={e => setResponse(e.target.value)}
                    rows={4}
                    placeholder="Escribí tu respuesta..."
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                  />
                  {error && <p className="text-xs text-red-600">{error}</p>}
                  <div className="flex gap-2">
                    <button
                      onClick={handleSend}
                      disabled={sending || !response.trim()}
                      className="px-4 py-2 text-sm bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 transition-colors"
                    >
                      {sending ? 'Enviando...' : 'Enviar respuesta'}
                    </button>
                    <button
                      onClick={() => { setResponding(false); setResponse('') }}
                      className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
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

  const load = () => {
    setLoading(true)
    setError(null)
    getConsultations()
      .then(setConsultations)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleAnswered = (id) => {
    setConsultations(prev =>
      prev.map(c => c.id === id ? { ...c, status: 'answered' } : c)
    )
  }

  const filtered = consultations.filter(c => c.status === tab)

  return (
    <AdminLayout>
      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit mb-6">
        {[
          { key: 'pending', label: 'Pendientes' },
          { key: 'answered', label: 'Respondidas' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${tab === key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {label}
            <span className="ml-2 text-xs text-gray-400">
              ({consultations.filter(c => c.status === key).length})
            </span>
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="space-y-3">
          {filtered.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-12">Sin consultas {tab === 'pending' ? 'pendientes' : 'respondidas'}</p>
          )}
          {filtered.map(c => (
            <ConsultationCard key={c.id} c={c} onAnswered={handleAnswered} />
          ))}
        </div>
      )}
    </AdminLayout>
  )
}

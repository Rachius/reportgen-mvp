import { useState, useEffect } from 'react'
import AdminLayout from './AdminLayout'
import { getAdminReports } from '../../lib/adminApi'

const STATUS_STYLES = {
  done:       { background: 'rgba(16,185,129,0.15)',  color: '#6EE7B7' },
  error:      { background: 'rgba(220,38,38,0.15)',   color: '#FCA5A5' },
  processing: { background: 'rgba(251,191,36,0.15)',  color: '#FCD34D' },
  pending:    { background: 'rgba(251,191,36,0.15)',  color: '#FCD34D' },
}

const STATUS_LABELS = { done: 'Listo', error: 'Error', processing: 'Procesando', pending: 'Pendiente' }

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const FILTERS = [
  { key: 'all',        label: 'Todos' },
  { key: 'done',       label: 'Completados' },
  { key: 'processing', label: 'Procesando' },
  { key: 'error',      label: 'Error' },
]

export default function AdminReports() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    getAdminReports()
      .then(setReports)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const filtered = filter === 'all' ? reports : reports.filter(r => r.status === filter)

  const filterBtnStyle = (active) => ({
    padding: '0.35rem 0.875rem',
    borderRadius: 3,
    border: active ? '1px solid #FE7808' : '1px solid rgba(78,199,245,0.25)',
    background: active ? 'rgba(254,120,8,0.15)' : 'rgba(78,199,245,0.07)',
    color: active ? '#FFA040' : '#4EC7F5',
    fontSize: '0.78rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.15s',
  })

  const thStyle = {
    padding: '0.5rem 1rem',
    textAlign: 'left',
    color: '#4A6078',
    fontWeight: 600,
    fontSize: '0.68rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  }

  const tdStyle = { padding: '0.65rem 1rem', fontSize: '0.8rem' }

  return (
    <AdminLayout>
      {/* Filtros */}
      <div style={{ display: 'flex', gap: 6, marginBottom: '1.5rem' }}>
        {FILTERS.map(({ key, label }) => (
          <button key={key} onClick={() => setFilter(key)} style={filterBtnStyle(filter === key)}>
            {label}
          </button>
        ))}
      </div>

      {loading && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}>
          <div style={{ width: 28, height: 28, border: '3px solid #1D2A3A', borderTop: '3px solid #4EC7F5', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        </div>
      )}

      {error && (
        <div style={{ background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.3)', borderRadius: 5, padding: '0.75rem 1rem', color: '#FCA5A5', fontSize: '0.8rem' }}>
          {error}
        </div>
      )}

      {!loading && !error && (
        <div style={{ background: '#162030', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 5, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: '#1D2A3A' }}>
              <tr>
                {['Usuario', 'Archivo', 'Tipo', 'Formatos', 'Estado', 'Fecha'].map(h => (
                  <th key={h} style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => {
                const formats = Array.isArray(r.formats)
                  ? r.formats
                  : (r.formats ? JSON.parse(r.formats) : [])
                const statusStyle = STATUS_STYLES[r.status] ?? STATUS_STYLES.pending
                return (
                  <tr
                    key={r.id}
                    style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ ...tdStyle, color: '#7A9AB8' }}>{r.user_email}</td>
                    <td style={{ ...tdStyle, color: '#E8F0F8', fontWeight: 500, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                      title={r.filename}>
                      {r.filename}
                    </td>
                    <td style={{ ...tdStyle, color: '#7A9AB8', textTransform: 'capitalize' }}>{r.report_type}</td>
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {formats.map(f => (
                          <span key={f} style={{
                            background: 'rgba(78,199,245,0.1)',
                            color: '#4EC7F5',
                            border: '1px solid rgba(78,199,245,0.2)',
                            borderRadius: 3,
                            padding: '1px 6px',
                            fontSize: '0.68rem',
                            fontFamily: 'monospace',
                            textTransform: 'uppercase',
                            fontWeight: 600,
                          }}>
                            {f}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td style={tdStyle}>
                      <span style={{
                        ...statusStyle,
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '2px 8px',
                        borderRadius: 999,
                        fontSize: '0.7rem',
                        fontWeight: 600,
                      }}>
                        {STATUS_LABELS[r.status] || r.status}
                      </span>
                    </td>
                    <td style={{ ...tdStyle, color: '#4A6078', whiteSpace: 'nowrap' }}>
                      {formatDate(r.created_at)}
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: '2.5rem', textAlign: 'center', color: '#4A6078', fontSize: '0.8rem' }}>
                    Sin reportes
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </AdminLayout>
  )
}

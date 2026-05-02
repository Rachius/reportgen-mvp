import { useState, useEffect } from 'react'
import AdminLayout from './AdminLayout'
import { getMetrics } from '../../lib/adminApi'

const CARD_STYLES = [
  { accent: '#4EC7F5', bg: 'rgba(78,199,245,0.08)' },
  { accent: '#4EC7F5', bg: 'rgba(78,199,245,0.05)' },
  { accent: '#FE7808', bg: 'rgba(254,120,8,0.08)' },
  { accent: '#DC2626', bg: 'rgba(220,38,38,0.08)' },
]

function MetricCard({ label, value, style }) {
  return (
    <div style={{
      background: style.bg,
      border: `1px solid ${style.accent}30`,
      borderLeft: `3px solid ${style.accent}`,
      borderRadius: 5,
      padding: '1.25rem',
    }}>
      <p style={{ color: '#7A9AB8', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </p>
      <p style={{ color: '#E8F0F8', fontSize: '2rem', fontWeight: 700, marginTop: 6 }}>
        {value ?? '—'}
      </p>
    </div>
  )
}

const PLAN_BARS = [
  { key: 'free',    label: 'Free',    color: '#4A6078' },
  { key: 'starter', label: 'Starter', color: '#4EC7F5' },
  { key: 'pro',     label: 'Pro',     color: '#FE7808' },
]

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    getMetrics().then(setMetrics).catch(e => setError(e.message)).finally(() => setLoading(false))
  }, [])

  return (
    <AdminLayout>
      {loading && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}>
          <div style={{ width: 28, height: 28, border: '3px solid #1D2A3A', borderTop: '3px solid #4EC7F5', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        </div>
      )}
      {error && (
        <div style={{ background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.3)', borderRadius: 5, padding: '0.75rem 1rem', color: '#FCA5A5', fontSize: '0.8rem' }}>
          Error al cargar métricas: {error}
        </div>
      )}

      {metrics && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Metric cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
            {[
              { label: 'Usuarios totales', value: metrics.total_users },
              { label: 'Suscriptores activos', value: metrics.active_subscribers },
              { label: 'Reportes hoy', value: metrics.reports_today },
              { label: 'Consultas pendientes', value: metrics.pending_consultations },
            ].map((m, i) => (
              <MetricCard key={m.label} label={m.label} value={m.value} style={CARD_STYLES[i]} />
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {/* Reports last 7 days */}
            <div style={{ background: '#162030', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 5, padding: '1.25rem' }}>
              <h2 style={{ color: '#E8F0F8', fontWeight: 600, fontSize: '0.875rem', marginBottom: '1rem' }}>
                Reportes últimos 7 días
              </h2>
              {metrics.reports_last_7_days.length === 0 ? (
                <p style={{ color: '#4A6078', fontSize: '0.8rem' }}>Sin datos</p>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left', color: '#4A6078', fontWeight: 600, fontSize: '0.68rem', textTransform: 'uppercase', paddingBottom: 8 }}>Fecha</th>
                      <th style={{ textAlign: 'right', color: '#4A6078', fontWeight: 600, fontSize: '0.68rem', textTransform: 'uppercase', paddingBottom: 8 }}>Cantidad</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.reports_last_7_days.map(row => (
                      <tr key={row.date} style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '0.5rem 0', color: '#7A9AB8' }}>{row.date}</td>
                        <td style={{ padding: '0.5rem 0', textAlign: 'right', color: '#E8F0F8', fontWeight: 600 }}>{row.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Plan distribution */}
            <div style={{ background: '#162030', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 5, padding: '1.25rem' }}>
              <h2 style={{ color: '#E8F0F8', fontWeight: 600, fontSize: '0.875rem', marginBottom: '1rem' }}>
                Distribución de planes
              </h2>
              {(() => {
                const dist = metrics.plan_distribution
                const total = (dist.free || 0) + (dist.starter || 0) + (dist.pro || 0) || 1
                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {PLAN_BARS.map(({ key, label, color }) => {
                      const count = dist[key] || 0
                      const pct = Math.round((count / total) * 100)
                      return (
                        <div key={key}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                            <span style={{ color: '#7A9AB8', fontSize: '0.8rem' }}>{label}</span>
                            <span style={{ color: '#E8F0F8', fontWeight: 600, fontSize: '0.8rem' }}>{count}</span>
                          </div>
                          <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 999, overflow: 'hidden' }}>
                            <div style={{ height: '100%', background: color, borderRadius: 999, width: `${pct}%`, transition: 'width 0.4s' }} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )
              })()}
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </AdminLayout>
  )
}

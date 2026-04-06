import { useState, useEffect } from 'react'
import AdminLayout from './AdminLayout'
import { getMetrics } from '../../lib/adminApi'

function MetricCard({ label, value, color = 'teal' }) {
  const colors = {
    teal: 'bg-teal-50 text-teal-700',
    blue: 'bg-blue-50 text-blue-700',
    amber: 'bg-amber-50 text-amber-700',
    red: 'bg-red-50 text-red-700',
  }
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <p className="text-sm text-gray-500 font-medium">{label}</p>
      <p className={`text-3xl font-bold mt-1 ${colors[color].split(' ')[1]}`}>{value ?? '—'}</p>
    </div>
  )
}

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    getMetrics()
      .then(setMetrics)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <AdminLayout>
      {loading && (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          Error al cargar métricas: {error}
        </div>
      )}

      {metrics && (
        <div className="space-y-8">
          {/* Metric cards */}
          <div className="grid grid-cols-2 gap-4">
            <MetricCard label="Usuarios totales" value={metrics.total_users} color="teal" />
            <MetricCard label="Suscriptores activos" value={metrics.active_subscribers} color="blue" />
            <MetricCard label="Reportes hoy" value={metrics.reports_today} color="amber" />
            <MetricCard label="Consultas pendientes" value={metrics.pending_consultations} color="red" />
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Reports last 7 days */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-sm font-semibold text-gray-700 mb-4">Reportes últimos 7 días</h2>
              {metrics.reports_last_7_days.length === 0 ? (
                <p className="text-sm text-gray-400">Sin datos</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-400 text-xs uppercase">
                      <th className="pb-2">Fecha</th>
                      <th className="pb-2 text-right">Cantidad</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {metrics.reports_last_7_days.map(row => (
                      <tr key={row.date}>
                        <td className="py-2 text-gray-600">{row.date}</td>
                        <td className="py-2 text-right font-medium text-gray-900">{row.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Plan distribution */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-sm font-semibold text-gray-700 mb-4">Distribución de planes</h2>
              {(() => {
                const dist = metrics.plan_distribution
                const total = (dist.free || 0) + (dist.starter || 0) + (dist.pro || 0) || 1
                const plans = [
                  { key: 'free', label: 'Free', color: 'bg-gray-400' },
                  { key: 'starter', label: 'Starter', color: 'bg-teal-500' },
                  { key: 'pro', label: 'Pro', color: 'bg-blue-500' },
                ]
                return (
                  <div className="space-y-4">
                    {plans.map(({ key, label, color }) => {
                      const count = dist[key] || 0
                      const pct = Math.round((count / total) * 100)
                      return (
                        <div key={key}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">{label}</span>
                            <span className="font-medium text-gray-900">{count}</span>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full">
                            <div
                              className={`h-2 rounded-full ${color}`}
                              style={{ width: `${pct}%` }}
                            />
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
    </AdminLayout>
  )
}

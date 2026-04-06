import { useState, useEffect } from 'react'
import AdminLayout from './AdminLayout'
import { getAdminReports } from '../../lib/adminApi'

const STATUS_STYLES = {
  done: 'bg-green-100 text-green-700',
  error: 'bg-red-100 text-red-700',
  processing: 'bg-amber-100 text-amber-700',
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

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

  return (
    <AdminLayout>
      {/* Filtros */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit mb-6">
        {[
          { key: 'all', label: 'Todos' },
          { key: 'done', label: 'Completados' },
          { key: 'processing', label: 'Procesando' },
          { key: 'error', label: 'Error' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${filter === key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Usuario</th>
                <th className="px-4 py-3 text-left">Archivo</th>
                <th className="px-4 py-3 text-left">Tipo</th>
                <th className="px-4 py-3 text-left">Formatos</th>
                <th className="px-4 py-3 text-left">Estado</th>
                <th className="px-4 py-3 text-left">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(r => {
                const formats = Array.isArray(r.formats) ? r.formats : (r.formats ? JSON.parse(r.formats) : [])
                return (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-600">{r.user_email}</td>
                    <td className="px-4 py-3 text-gray-900 font-medium max-w-[180px] truncate" title={r.filename}>
                      {r.filename}
                    </td>
                    <td className="px-4 py-3 text-gray-600 capitalize">{r.report_type}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 flex-wrap">
                        {formats.map(f => (
                          <span key={f} className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded font-mono uppercase">
                            {f}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[r.status] ?? 'bg-gray-100 text-gray-600'}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{formatDate(r.created_at)}</td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-400 text-sm">
                    Sin reportes
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  )
}

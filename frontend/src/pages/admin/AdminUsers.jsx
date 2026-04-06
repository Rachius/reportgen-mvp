import { useState, useEffect } from 'react'
import AdminLayout from './AdminLayout'
import { getUsers, approveUser, blockUser } from '../../lib/adminApi'
import { useAuth } from '../../context/AuthContext'

const PLAN_COLORS = {
  free: 'bg-gray-100 text-gray-600',
  starter: 'bg-teal-100 text-teal-700',
  pro: 'bg-blue-100 text-blue-700',
}

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
    setLoading(true)
    setError(null)
    getUsers(p)
      .then(setUsers)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load(page) }, [page])

  const handleApprove = async (userId) => {
    setActionLoading(userId + '-approve')
    try {
      await approveUser(userId)
      setUsers(prev =>
        prev.map(u => u.id === userId ? { ...u, approved: true } : u)
      )
    } finally {
      setActionLoading(null)
    }
  }

  const handleBlock = async (userId) => {
    if (!confirm('¿Estás seguro que querés bloquear este usuario?')) return
    setActionLoading(userId + '-block')
    try {
      await blockUser(userId)
      setUsers(prev =>
        prev.map(u => u.id === userId ? { ...u, approved: false, status: 'canceled' } : u)
      )
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <AdminLayout>
      {loading && (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm mb-4">
          {error}
        </div>
      )}

      {!loading && (
        <>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Plan</th>
                  <th className="px-4 py-3 text-left">Uso</th>
                  <th className="px-4 py-3 text-left">Risk</th>
                  <th className="px-4 py-3 text-left">Estado</th>
                  <th className="px-4 py-3 text-left">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map(u => {
                  const isAdmin = u.firebase_uid === adminUid
                  return (
                    <tr key={u.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-900 font-medium">{u.email}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${PLAN_COLORS[u.plan] ?? 'bg-gray-100 text-gray-600'}`}>
                          {u.plan ?? '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {u.reports_used ?? 0}/{u.reports_limit ?? 0}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${(u.risk_score ?? 0) > 60 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                          {u.risk_score ?? 0}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${u.approved ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {u.approved ? 'Aprobado' : 'Bloqueado'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {!isAdmin && (
                          <div className="flex gap-2">
                            {!u.approved && (
                              <button
                                onClick={() => handleApprove(u.id)}
                                disabled={actionLoading === u.id + '-approve'}
                                className="px-3 py-1 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                              >
                                Aprobar
                              </button>
                            )}
                            {u.approved && (
                              <button
                                onClick={() => handleBlock(u.id)}
                                disabled={actionLoading === u.id + '-block'}
                                className="px-3 py-1 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                              >
                                Bloquear
                              </button>
                            )}
                          </div>
                        )}
                        {isAdmin && (
                          <span className="text-xs text-gray-400 italic">Sos vos</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-400 text-sm">
                      Sin usuarios
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          <div className="flex items-center justify-between mt-4">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
            >
              Anterior
            </button>
            <span className="text-sm text-gray-500">Página {page}</span>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={users.length < 20}
              className="px-4 py-2 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
            >
              Siguiente
            </button>
          </div>
        </>
      )}
    </AdminLayout>
  )
}

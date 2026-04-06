import { useAuth } from '../context/AuthContext'
import { useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { getSubscription } from '../lib/reportApi'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [plan, setPlan] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    if (!user) return
    getSubscription().then(sub => setPlan(sub.plan)).catch(() => {})
    user.getIdTokenResult().then(result => {
      setIsAdmin(!!result.claims.admin)
    }).catch(() => {})
  }, [user])

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const showConsultations = plan === 'starter' || plan === 'pro'

  return (
    <nav className="border-b border-gray-100 bg-white px-6 py-3">
      <div className="max-w-2xl mx-auto flex items-center justify-between">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 hover:opacity-70 transition"
        >
          <div className="w-2 h-2 rounded-full bg-teal-600" />
          <span className="font-medium text-gray-800">ReportGen</span>
        </button>

        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/profile')}
            className={`text-sm transition ${
              location.pathname === '/profile'
                ? 'text-teal-600 font-medium'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            Mi perfil
          </button>
          <span className="text-gray-200">|</span>
          <button
            onClick={() => navigate('/subscription')}
            className={`text-sm transition ${
              location.pathname.startsWith('/subscription')
                ? 'text-teal-600 font-medium'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            Mi plan
          </button>

          {showConsultations && (
            <button
              onClick={() => navigate('/consultations')}
              className={`text-sm transition ${
                location.pathname === '/consultations'
                  ? 'text-teal-600 font-medium'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              Consultas
            </button>
          )}

          <span className="text-gray-200">|</span>
          <span className="text-xs text-gray-400 max-w-32 truncate">{user?.email}</span>

          <button
            onClick={handleLogout}
            className="text-xs text-gray-400 hover:text-red-500 transition"
          >
            Salir
          </button>

          {isAdmin && (
            <>
              <span className="text-gray-200">|</span>
              <button
                onClick={() => navigate('/admin')}
                className="text-xs text-gray-400 hover:text-gray-600 transition"
              >
                Admin
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

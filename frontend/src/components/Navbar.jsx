import { useAuth } from '../context/AuthContext'
import { useNavigate, useLocation } from 'react-router-dom'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

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
          <span className="text-xs text-gray-400 max-w-32 truncate">{user?.email}</span>
          <button
            onClick={handleLogout}
            className="text-xs text-gray-400 hover:text-red-500 transition"
          >
            Salir
          </button>
        </div>
      </div>
    </nav>
  )
}
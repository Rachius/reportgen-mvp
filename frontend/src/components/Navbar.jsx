import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useNavigate } from 'react-router-dom'

export default function Navbar() {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <nav style={{
      background: 'var(--surface)',
      borderBottom: '1px solid var(--border)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
    }}>
      <div className="max-w-6xl mx-auto px-4 h-12 flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
        >
          <div style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: 'var(--blue)',
            flexShrink: 0,
          }} />
          <span style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.95rem' }}>
            Reporti
          </span>
        </button>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            style={{
              width: 32,
              height: 32,
              borderRadius: 'var(--radius-btn)',
              border: '1px solid var(--border-strong)',
              background: 'var(--surface-2)',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '0.875rem',
              transition: 'var(--transition-fast)',
            }}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>

          {/* Divider */}
          <span style={{ color: 'var(--border-strong)', fontSize: '1rem' }}>|</span>

          {/* Email */}
          <span style={{
            color: 'var(--text-muted)',
            fontSize: '0.75rem',
            maxWidth: 160,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {user?.email}
          </span>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="btn btn-outline"
            style={{ fontSize: '0.75rem', padding: '0.25rem 0.65rem' }}
          >
            Salir
          </button>
        </div>
      </div>
    </nav>
  )
}

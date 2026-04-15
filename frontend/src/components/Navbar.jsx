import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useNavigate } from 'react-router-dom'

export default function Navbar() {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const isDark = theme === 'dark'

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <nav style={{
      background: 'var(--nav-bg)',
      backdropFilter: 'blur(8px)',
      borderBottom: '1px solid var(--border)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
    }}>
      <div className="max-w-6xl mx-auto px-4 h-12 flex items-center justify-between">

        {/* Logo */}
        <button
          onClick={() => navigate('/home')}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          <img src="/logo-reporti.png" alt="R" style={{ height: '32px', width: 'auto' }} />
          <span className="grad-text" style={{ fontWeight: 700, fontSize: '1rem' }}>Reporti</span>
        </button>

        {/* Right side */}
        <div className="flex items-center gap-3">

          {/* Theme switch: ☀️ [track] 🌙 */}
          <div className="flex items-center gap-1.5">
            <span style={{ fontSize: '0.8rem', lineHeight: 1 }}>☀️</span>
            <button
              onClick={toggleTheme}
              title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
              style={{
                width: 28,
                height: 16,
                borderRadius: 999,
                background: isDark ? 'var(--blue)' : 'var(--border-strong)',
                position: 'relative',
                border: 'none',
                cursor: 'pointer',
                transition: 'background 0.2s ease',
                flexShrink: 0,
              }}
            >
              <span style={{
                position: 'absolute',
                top: 2,
                left: isDark ? 14 : 2,
                width: 12,
                height: 12,
                borderRadius: '50%',
                background: '#fff',
                transition: 'left 0.2s ease',
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
              }} />
            </button>
            <span style={{ fontSize: '0.8rem', lineHeight: 1 }}>🌙</span>
          </div>

          {/* Divider */}
          <span style={{ width: 1, height: 18, background: 'var(--border-strong)', display: 'block' }} />

          {/* Email */}
          <span style={{
            color: 'var(--text3)',
            fontSize: '0.75rem',
            maxWidth: 160,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {user?.email}
          </span>

          {/* ? button */}
          <button
            onClick={() => navigate('/about')}
            title="¿Qué es Reporti?"
            style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              border: '1px solid var(--border-strong)',
              background: 'var(--bg3)',
              color: 'var(--text2)',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              transition: 'var(--transition-fast)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'var(--orange)'
              e.currentTarget.style.color = 'var(--orange-dark)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--border-strong)'
              e.currentTarget.style.color = 'var(--text2)'
            }}
          >
            ?
          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="btn btn-outline"
            style={{ fontSize: '0.75rem', padding: '0.2rem 0.65rem', minHeight: 30 }}
          >
            Salir
          </button>
        </div>
      </div>
    </nav>
  )
}

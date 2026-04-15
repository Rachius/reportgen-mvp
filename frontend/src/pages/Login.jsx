import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'

const ERROR_MESSAGES = {
  'auth/user-not-found':        'No existe una cuenta con ese email.',
  'auth/wrong-password':        'Contraseña incorrecta.',
  'auth/email-already-in-use':  'Ese email ya está registrado.',
  'auth/weak-password':         'La contraseña debe tener al menos 6 caracteres.',
  'auth/invalid-email':         'El email no es válido.',
  'auth/invalid-credential':    'Email o contraseña incorrectos.',
  'auth/popup-closed-by-user':  'Cerraste la ventana de Google antes de completar.',
  'auth/too-many-requests':     'Demasiados intentos. Esperá unos minutos e intentá de nuevo.',
}

export default function Login() {
  const { login, register, loginWithGoogle, resetPassword } = useAuth()
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [info, setInfo] = useState(null)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const clearMessages = () => { setError(null); setInfo(null) }

  const handleSubmit = async () => {
    clearMessages()
    if (!email || !password) return
    setLoading(true)
    try {
      if (mode === 'login') {
        await login(email, password)
        navigate('/home')
      } else if (mode === 'register') {
        await register(email, password)
        setInfo('Cuenta creada. Te enviamos un email de verificación — revisá tu casilla antes de continuar.')
        setMode('login')
      }
    } catch (err) {
      setError(ERROR_MESSAGES[err.code] || 'Ocurrió un error. Intentá de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    clearMessages()
    setGoogleLoading(true)
    try {
      await loginWithGoogle()
      navigate('/home')
    } catch (err) {
      setError(ERROR_MESSAGES[err.code] || 'Error al iniciar sesión con Google.')
    } finally {
      setGoogleLoading(false)
    }
  }

  const handleReset = async () => {
    clearMessages()
    if (!email) { setError('Ingresá tu email para recuperar la contraseña.'); return }
    setLoading(true)
    try {
      await resetPassword(email)
      setInfo(`Te enviamos un link para restablecer tu contraseña a ${email}.`)
    } catch (err) {
      setError(ERROR_MESSAGES[err.code] || 'No pudimos enviar el email. Verificá la dirección.')
    } finally {
      setLoading(false)
    }
  }

  const switchMode = (newMode) => { setMode(newMode); clearMessages() }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
    }}>
      <div style={{ width: '100%', maxWidth: 360 }}>

        {/* Logo */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            <img src="/logo-reporti.png" alt="R" style={{ height: '32px', width: 'auto' }} />
            <span className="grad-text" style={{ fontWeight: 700, fontSize: '1.1rem' }}>Reporti</span>
          </button>
          {/* Theme toggle */}
          <div className="flex items-center gap-1">
            <span style={{ fontSize: '0.75rem' }}>☀️</span>
            <button onClick={toggleTheme} style={{
              width: 28, height: 16, borderRadius: 999,
              background: isDark ? 'var(--blue)' : 'var(--border-strong)',
              position: 'relative', border: 'none', cursor: 'pointer',
              transition: 'background 0.2s',
            }}>
              <span style={{
                position: 'absolute', top: 2,
                left: isDark ? 14 : 2, width: 12, height: 12,
                borderRadius: '50%', background: '#fff',
                transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
              }} />
            </button>
            <span style={{ fontSize: '0.75rem' }}>🌙</span>
          </div>
        </div>

        <div className="card space-y-4">
          <h1 style={{ color: 'var(--text)', fontWeight: 600, fontSize: '1rem' }}>
            {mode === 'login'    && 'Iniciá sesión'}
            {mode === 'register' && 'Creá tu cuenta'}
            {mode === 'reset'    && 'Recuperar contraseña'}
          </h1>

          {/* Google */}
          {mode !== 'reset' && (
            <button
              onClick={handleGoogle}
              disabled={googleLoading}
              className="btn btn-outline"
              style={{ width: '100%', justifyContent: 'center', gap: 8 }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {googleLoading ? 'Conectando...' : 'Continuar con Google'}
            </button>
          )}

          {mode !== 'reset' && (
            <div className="flex items-center gap-3">
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
              <span style={{ color: 'var(--text3)', fontSize: '0.72rem' }}>o con email</span>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            </div>
          )}

          {/* Fields */}
          <div className="space-y-3">
            <div>
              <label style={{ color: 'var(--text3)', fontSize: '0.72rem', display: 'block', marginBottom: 4 }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                placeholder="tu@email.com"
                className="input"
              />
            </div>
            {mode !== 'reset' && (
              <div>
                <label style={{ color: 'var(--text3)', fontSize: '0.72rem', display: 'block', marginBottom: 4 }}>
                  Contraseña
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  placeholder="mínimo 6 caracteres"
                  className="input"
                />
              </div>
            )}
          </div>

          {/* Messages */}
          {error && (
            <p style={{
              color: '#DC2626', fontSize: '0.75rem',
              background: '#FEF2F2', border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: 'var(--radius-btn)', padding: '0.5rem 0.75rem',
            }}>
              {error}
            </p>
          )}
          {info && (
            <p style={{
              color: 'var(--blue-darker)', fontSize: '0.75rem',
              background: 'var(--blue-light)', border: '1px solid var(--blue)',
              borderRadius: 'var(--radius-btn)', padding: '0.5rem 0.75rem',
            }}>
              {info}
            </p>
          )}

          {/* Actions */}
          {mode === 'reset' ? (
            <>
              <button
                onClick={handleReset}
                disabled={loading || !email}
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                {loading ? 'Enviando...' : 'Enviar link de recuperación'}
              </button>
              <p style={{ textAlign: 'center', fontSize: '0.75rem' }}>
                <button onClick={() => switchMode('login')}
                  style={{ color: 'var(--blue-dark)', background: 'none', border: 'none', cursor: 'pointer' }}>
                  Volver al login
                </button>
              </p>
            </>
          ) : (
            <>
              <button
                onClick={handleSubmit}
                disabled={loading || !email || !password}
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                {loading ? 'Cargando...' : mode === 'login' ? 'Ingresar' : 'Crear cuenta'}
              </button>

              {mode === 'login' && (
                <p style={{ textAlign: 'center', fontSize: '0.75rem' }}>
                  <button
                    onClick={() => switchMode('reset')}
                    style={{ color: 'var(--text3)', background: 'none', border: 'none', cursor: 'pointer', transition: 'color 0.15s' }}
                    onMouseEnter={e => e.target.style.color = 'var(--blue-dark)'}
                    onMouseLeave={e => e.target.style.color = 'var(--text3)'}
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </p>
              )}

              <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text3)' }}>
                {mode === 'login' ? '¿No tenés cuenta?' : '¿Ya tenés cuenta?'}{' '}
                <button
                  onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
                  style={{ color: 'var(--blue-dark)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                >
                  {mode === 'login' ? 'Registrate' : 'Iniciá sesión'}
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

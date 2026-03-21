import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

const ERROR_MESSAGES = {
  'auth/user-not-found': 'No existe una cuenta con ese email.',
  'auth/wrong-password': 'Contraseña incorrecta.',
  'auth/email-already-in-use': 'Ese email ya está registrado.',
  'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres.',
  'auth/invalid-email': 'El email no es válido.',
  'auth/invalid-credential': 'Email o contraseña incorrectos.',
  'auth/popup-closed-by-user': 'Cerraste la ventana de Google antes de completar.',
  'auth/too-many-requests': 'Demasiados intentos. Esperá unos minutos e intentá de nuevo.',
}

export default function Login() {
  const { login, register, loginWithGoogle, resetPassword } = useAuth()
  const navigate = useNavigate()

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
        navigate('/')
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
      navigate('/')
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

  const switchMode = (newMode) => {
    setMode(newMode)
    clearMessages()
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        <div className="flex items-center gap-2 mb-8 justify-center">
          <div className="w-2 h-2 rounded-full bg-teal-600" />
          <span className="font-medium text-gray-800 text-lg">ReportGen</span>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">

          <h1 className="text-base font-medium text-gray-800">
            {mode === 'login' && 'Iniciá sesión'}
            {mode === 'register' && 'Creá tu cuenta'}
            {mode === 'reset' && 'Recuperar contraseña'}
          </h1>

          {mode !== 'reset' && (
            <button
              onClick={handleGoogle}
              disabled={googleLoading}
              className="w-full flex items-center justify-center gap-2 py-2 border
                border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50
                transition disabled:opacity-50"
            >
              <svg width="16" height="16" viewBox="0 0 24 24">
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
              <div className="flex-1 h-px bg-gray-100" />
              <span className="text-xs text-gray-400">o con email</span>
              <div className="flex-1 h-px bg-gray-100" />
            </div>
          )}

          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-500 block mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                placeholder="tu@email.com"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm
                  focus:outline-none focus:border-teal-400 transition"
              />
            </div>

            {mode !== 'reset' && (
              <div>
                <label className="text-xs text-gray-500 block mb-1">Contraseña</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  placeholder="mínimo 6 caracteres"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm
                    focus:outline-none focus:border-teal-400 transition"
                />
              </div>
            )}
          </div>

          {error && (
            <p className="text-xs text-red-500 bg-red-50 border border-red-100
              rounded-lg px-3 py-2">{error}</p>
          )}
          {info && (
            <p className="text-xs text-teal-700 bg-teal-50 border border-teal-100
              rounded-lg px-3 py-2">{info}</p>
          )}

          {mode === 'reset' ? (
            <>
              <button
                onClick={handleReset}
                disabled={loading || !email}
                className="w-full py-2.5 rounded-lg bg-teal-600 text-white font-medium
                  text-sm hover:bg-teal-700 transition disabled:bg-gray-200
                  disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Enviando...' : 'Enviar link de recuperación'}
              </button>
              <p className="text-xs text-center text-gray-400">
                <button onClick={() => switchMode('login')}
                  className="text-teal-600 hover:underline">
                  Volver al login
                </button>
              </p>
            </>
          ) : (
            <>
              <button
                onClick={handleSubmit}
                disabled={loading || !email || !password}
                className="w-full py-2.5 rounded-lg bg-teal-600 text-white font-medium
                  text-sm hover:bg-teal-700 transition disabled:bg-gray-200
                  disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                {loading
                  ? 'Cargando...'
                  : mode === 'login' ? 'Ingresar' : 'Crear cuenta'}
              </button>

              {mode === 'login' && (
                <p className="text-xs text-center">
                  <button onClick={() => switchMode('reset')}
                    className="text-gray-400 hover:text-teal-600 transition">
                    ¿Olvidaste tu contraseña?
                  </button>
                </p>
              )}

              <p className="text-xs text-center text-gray-400">
                {mode === 'login' ? '¿No tenés cuenta?' : '¿Ya tenés cuenta?'}{' '}
                <button
                  onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
                  className="text-teal-600 hover:underline"
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
import { useEffect, useState } from 'react'
import { getSubscription, createCheckout } from '../lib/reportApi'
import Navbar from '../components/Navbar'
import { useLocation } from 'react-router-dom'

const PLAN_LABELS = { free: 'Free', starter: 'Starter', pro: 'Pro' }
const PLAN_COLORS = {
  free: 'bg-gray-100 text-gray-700',
  starter: 'bg-teal-100 text-teal-800',
  pro: 'bg-purple-100 text-purple-800',
}

export default function Subscription() {
  const [sub, setSub] = useState(null)
  const [loading, setLoading] = useState(true)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const location = useLocation()
  const isSuccess = location.pathname === '/subscription/success'
  const isPending = location.pathname === '/subscription/pending'

  useEffect(() => {
    getSubscription().then(setSub).finally(() => setLoading(false))
  }, [])

  const handleCheckout = async () => {
    setCheckoutLoading(true)
    try {
      const { url } = await createCheckout()
      window.location.href = url
    } finally {
      setCheckoutLoading(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex items-center justify-center pt-32">
        <p className="text-sm text-gray-400">Cargando...</p>
      </div>
    </div>
  )

  const pct = sub ? Math.round((sub.reports_used / sub.reports_limit) * 100) : 0

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-xl mx-auto px-4 py-10 space-y-6">

        <div>
          <h1 className="text-lg font-medium text-gray-800">Mi suscripción</h1>
          <p className="text-sm text-gray-500 mt-1">Gestioná tu plan y el uso de reportes.</p>
        </div>

        {isSuccess && (
          <div className="bg-teal-50 border border-teal-200 rounded-xl p-4">
            <p className="text-sm font-medium text-teal-800">¡Suscripción activada!</p>
            <p className="text-xs text-teal-700 mt-1">
              Ya tenés acceso al plan Starter. Podés empezar a generar reportes.
            </p>
          </div>
        )}

        {isPending && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-sm font-medium text-amber-800">Pago pendiente</p>
            <p className="text-xs text-amber-700 mt-1">
              Tu pago está siendo procesado. Te notificaremos cuando se confirme.
            </p>
          </div>
        )}

        {!sub?.approved && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-sm font-medium text-amber-800">Cuenta pendiente de aprobación</p>
            <p className="text-xs text-amber-700 mt-1">
              Tu cuenta está siendo revisada. Te avisaremos cuando esté activa.
            </p>
          </div>
        )}

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Plan actual</span>
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${PLAN_COLORS[sub?.plan] || PLAN_COLORS.free}`}>
              {PLAN_LABELS[sub?.plan] || 'Free'}
            </span>
          </div>

          <div>
            <div className="flex justify-between text-xs text-gray-500 mb-1.5">
              <span>Reportes usados</span>
              <span>{sub?.reports_used} / {sub?.reports_limit}</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  pct >= 100 ? 'bg-red-400' : pct >= 70 ? 'bg-amber-400' : 'bg-teal-500'
                }`}
                style={{ width: `${Math.min(pct, 100)}%` }}
              />
            </div>
          </div>

          {sub?.plan === 'starter' && (
            <div className="flex justify-between text-xs text-gray-500">
              <span>Consultas al analista</span>
              <span>{sub?.consultations_used} / {sub?.consultations_limit}</span>
            </div>
          )}

          {sub?.current_period_end && (
            <p className="text-xs text-gray-400">
              Próxima renovación: {new Date(sub.current_period_end).toLocaleDateString('es-AR')}
            </p>
          )}
        </div>

        {sub?.plan === 'free' && (
          <div className="bg-white rounded-xl border border-teal-200 p-6 space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-800">Plan Starter</p>
              <p className="text-2xl font-bold text-teal-600 mt-1">
                $17.500 ARS<span className="text-sm font-normal text-gray-400">/mes</span>
              </p>
              <ul className="mt-3 space-y-2">
                {[
                  '10 reportes por mes',
                  'PDF + PPTX',
                  'Perfil de empresa personalizado',
                  '3 consultas mensuales al analista',
                  'Renovación automática mensual',
                ].map(f => (
                  <li key={f} className="flex items-center gap-2 text-xs text-gray-600">
                    <div className="w-1.5 h-1.5 rounded-full bg-teal-500 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
            <button
              onClick={handleCheckout}
              disabled={checkoutLoading || !sub?.approved}
              className="w-full py-2.5 rounded-lg bg-teal-600 text-white font-medium text-sm
                hover:bg-teal-700 transition disabled:bg-gray-200 disabled:text-gray-400
                disabled:cursor-not-allowed"
            >
              {checkoutLoading ? 'Redirigiendo a MercadoPago...' : 'Suscribirme ahora'}
            </button>
          </div>
        )}

        {sub?.plan !== 'free' && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <p className="text-xs text-gray-500">
              Para cancelar o modificar tu suscripción contactanos a{' '}
              <span className="text-teal-600">soporte@reportgen.app</span>
            </p>
          </div>
        )}

      </div>
    </div>
  )
}
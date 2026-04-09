import { useEffect, useState } from 'react'
import { getSubscription, createCheckout } from '../lib/reportApi'
import PageLayout from '../components/PageLayout'
import { useLocation } from 'react-router-dom'

const PLANS = [
  {
    key: 'free',
    name: 'Free',
    price: 'Gratis',
    period: '',
    accentColor: 'var(--blue)',
    features: [
      '3 reportes totales',
      'Solo PDF',
      'Sin perfil de empresa',
    ],
  },
  {
    key: 'starter',
    name: 'Starter',
    price: '$17.500 ARS',
    period: '/mes',
    accentColor: 'var(--blue)',
    features: [
      '10 reportes por mes',
      'PDF + PPTX',
      'Perfil de empresa personalizado',
      '3 consultas al analista',
      'Renovación automática mensual',
    ],
  },
  {
    key: 'pro',
    name: 'Pro',
    price: '$35 USD',
    period: '/mes',
    accentColor: 'var(--orange)',
    features: [
      '30 reportes por mes',
      'PDF + PPTX',
      'Perfil de empresa personalizado',
      '10 consultas al analista',
      'Soporte prioritario',
    ],
    comingSoon: true,
  },
]

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
    <PageLayout>
      <div className="flex items-center justify-center h-40">
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Cargando...</p>
      </div>
    </PageLayout>
  )

  const reportsPct = sub ? Math.min(100, Math.round((sub.reports_used / sub.reports_limit) * 100)) : 0
  const consultPct = sub?.consultations_limit
    ? Math.min(100, Math.round(((sub.consultations_used || 0) / sub.consultations_limit) * 100))
    : 0
  const renewalDate = sub?.current_period_end
    ? new Date(sub.current_period_end).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : null

  return (
    <PageLayout>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        <div className="mb-6">
          <h1 style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '1.25rem' }}>Mi plan</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: 4 }}>
            Gestioná tu suscripción y el uso de reportes.
          </p>
        </div>

        {/* Status banners */}
        {isSuccess && (
          <div style={{
            background: '#ECFDF5',
            border: '1px solid #6EE7B7',
            borderRadius: 'var(--radius-card)',
            padding: '0.75rem 1rem',
            marginBottom: '1.5rem',
          }}>
            <p style={{ color: '#065F46', fontWeight: 600, fontSize: '0.875rem' }}>¡Suscripción activada!</p>
            <p style={{ color: '#047857', fontSize: '0.75rem', marginTop: 2 }}>
              Ya tenés acceso al plan Starter. Podés empezar a generar reportes.
            </p>
          </div>
        )}
        {isPending && (
          <div style={{
            background: '#FFFBEB',
            border: '1px solid #FCD34D',
            borderRadius: 'var(--radius-card)',
            padding: '0.75rem 1rem',
            marginBottom: '1.5rem',
          }}>
            <p style={{ color: '#92400E', fontWeight: 600, fontSize: '0.875rem' }}>Pago pendiente</p>
            <p style={{ color: '#B45309', fontSize: '0.75rem', marginTop: 2 }}>
              Tu pago está siendo procesado. Te notificaremos cuando se confirme.
            </p>
          </div>
        )}
        {!sub?.approved && (
          <div style={{
            background: '#FFFBEB',
            border: '1px solid #FCD34D',
            borderRadius: 'var(--radius-card)',
            padding: '0.75rem 1rem',
            marginBottom: '1.5rem',
          }}>
            <p style={{ color: '#92400E', fontWeight: 600, fontSize: '0.875rem' }}>Cuenta pendiente de aprobación</p>
            <p style={{ color: '#B45309', fontSize: '0.75rem', marginTop: 2 }}>
              Tu cuenta está siendo revisada. Te avisaremos cuando esté activa.
            </p>
          </div>
        )}

        {/* Plan cards grid */}
        <div className="grid gap-4 mb-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          {PLANS.map(plan => {
            const isCurrent = sub?.plan === plan.key
            const isComingSoon = plan.comingSoon

            return (
              <div
                key={plan.key}
                style={{
                  background: 'var(--surface)',
                  border: isCurrent
                    ? `2px solid var(--blue)`
                    : isComingSoon
                      ? `2px solid var(--orange)`
                      : `1px solid var(--border)`,
                  borderRadius: 'var(--radius-card)',
                  padding: '1.25rem',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                }}
              >
                {/* Badge */}
                {isCurrent && (
                  <span className="pill" style={{ position: 'absolute', top: '0.75rem', right: '0.75rem' }}>
                    Tu plan actual
                  </span>
                )}
                {isComingSoon && (
                  <span className="pill pill-orange" style={{ position: 'absolute', top: '0.75rem', right: '0.75rem' }}>
                    Próximamente
                  </span>
                )}

                {/* Name & price */}
                <div>
                  <p style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '1rem' }}>{plan.name}</p>
                  <p style={{ marginTop: 4 }}>
                    <span style={{ color: plan.key === 'pro' ? 'var(--orange-dark)' : 'var(--blue-dark)', fontWeight: 700, fontSize: '1.25rem' }}>
                      {plan.price}
                    </span>
                    {plan.period && (
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{plan.period}</span>
                    )}
                  </p>
                </div>

                {/* Features */}
                <ul className="space-y-1.5" style={{ flex: 1 }}>
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      <div style={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        background: plan.key === 'pro' ? 'var(--orange)' : 'var(--blue)',
                        flexShrink: 0,
                        marginTop: 5,
                      }} />
                      {f}
                    </li>
                  ))}
                </ul>

                {/* Button */}
                {!isCurrent && !isComingSoon && plan.key === 'starter' && (
                  <button
                    onClick={handleCheckout}
                    disabled={checkoutLoading || !sub?.approved}
                    className="btn btn-primary"
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    {checkoutLoading ? 'Redirigiendo...' : 'Suscribirme'}
                  </button>
                )}
                {isCurrent && plan.key !== 'free' && (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.72rem', textAlign: 'center' }}>
                    Plan activo
                  </p>
                )}
                {isComingSoon && (
                  <button disabled className="btn" style={{ width: '100%', justifyContent: 'center' }}>
                    Próximamente
                  </button>
                )}
              </div>
            )
          })}
        </div>

        {/* Usage summary */}
        <div className="card mb-4">
          <h2 style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.875rem', marginBottom: '1rem' }}>
            Uso del mes
          </h2>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between mb-1">
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Reportes</span>
                <span style={{ color: 'var(--blue-dark)', fontSize: '0.8rem', fontWeight: 600 }}>
                  {sub?.reports_used}/{sub?.reports_limit}
                </span>
              </div>
              <div className="progress-track">
                <div className="progress-fill-blue" style={{ width: `${reportsPct}%` }} />
              </div>
            </div>
            {sub?.consultations_limit > 0 && (
              <div>
                <div className="flex justify-between mb-1">
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Consultas al analista</span>
                  <span style={{ color: 'var(--orange-dark)', fontSize: '0.8rem', fontWeight: 600 }}>
                    {sub?.consultations_used || 0}/{sub?.consultations_limit}
                  </span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill-orange" style={{ width: `${consultPct}%` }} />
                </div>
              </div>
            )}
            {renewalDate && (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: 4 }}>
                Próxima renovación: {renewalDate}
              </p>
            )}
          </div>
        </div>

        {/* Gestión MP */}
        {sub?.plan !== 'free' && (
          <div className="card">
            <h2 style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.75rem' }}>
              Gestión de suscripción
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.75rem' }}>
              Administrá tu suscripción directamente desde MercadoPago.
            </p>
            <button
              onClick={handleCheckout}
              disabled={checkoutLoading}
              className="btn btn-outline"
            >
              Gestionar en MercadoPago
            </button>
          </div>
        )}
      </div>
    </PageLayout>
  )
}

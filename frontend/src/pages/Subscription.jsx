import { useEffect, useState } from 'react'
import { getSubscription, createCheckout } from '../lib/reportApi'
import PageLayout from '../components/PageLayout'
import { useLocation } from 'react-router-dom'

const PLANS = [
  {
    key: 'free',
    name: 'Free',
    price: 'Gratis',
    period: 'para siempre',
    accent: 'var(--blue)',
    features: [
      { text: '3 reportes totales', orange: false },
      { text: 'Solo PDF', orange: false },
      { text: 'Sin perfil de empresa', orange: false },
    ],
  },
  {
    key: 'starter',
    name: 'Starter',
    price: '$17.500',
    period: '/mes ARS',
    accent: 'var(--blue)',
    features: [
      { text: '10 reportes por mes', orange: false },
      { text: 'PDF + PPTX', orange: false },
      { text: 'Perfil de empresa personalizado', orange: false },
      { text: '3 consultas al analista', orange: true },
      { text: 'Renovación automática mensual', orange: false },
    ],
  },
  {
    key: 'pro',
    name: 'Pro',
    price: '$35',
    period: '/mes USD',
    accent: 'var(--orange)',
    comingSoon: true,
    features: [
      { text: '30 reportes por mes', orange: false },
      { text: 'PDF + PPTX', orange: false },
      { text: 'Perfil de empresa personalizado', orange: false },
      { text: '10 consultas al analista', orange: true },
      { text: 'Soporte prioritario', orange: false },
    ],
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
        <div className="spinner" />
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
  const nearLimit = sub && sub.reports_used >= sub.reports_limit - 2

  return (
    <PageLayout>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>

        {/* Header */}
        <div className="mb-6">
          <h1 className="grad-text" style={{ fontWeight: 700, fontSize: '1.25rem' }}>Mi plan</h1>
          <p style={{ color: 'var(--text2)', fontSize: '0.875rem', marginTop: 4 }}>
            Gestioná tu suscripción y el uso de reportes.
          </p>
        </div>

        {/* Status banners */}
        {isSuccess && (
          <div className="pill-green" style={{
            display: 'block',
            background: '#ECFDF5', border: '1px solid #6EE7B7',
            borderRadius: 'var(--radius-card)', padding: '0.75rem 1rem', marginBottom: '1.5rem',
          }}>
            <p style={{ color: '#065F46', fontWeight: 600, fontSize: '0.875rem' }}>¡Suscripción activada!</p>
            <p style={{ color: '#047857', fontSize: '0.75rem', marginTop: 2 }}>
              Ya tenés acceso al plan Starter. Podés empezar a generar reportes.
            </p>
          </div>
        )}
        {isPending && (
          <div style={{
            background: '#FFFBEB', border: '1px solid #FCD34D',
            borderRadius: 'var(--radius-card)', padding: '0.75rem 1rem', marginBottom: '1.5rem',
          }}>
            <p style={{ color: '#92400E', fontWeight: 600, fontSize: '0.875rem' }}>Pago pendiente</p>
            <p style={{ color: '#B45309', fontSize: '0.75rem', marginTop: 2 }}>
              Tu pago está siendo procesado. Te notificaremos cuando se confirme.
            </p>
          </div>
        )}
        {!sub?.approved && (
          <div style={{
            background: '#FFFBEB', border: '1px solid #FCD34D',
            borderRadius: 'var(--radius-card)', padding: '0.75rem 1rem', marginBottom: '1.5rem',
          }}>
            <p style={{ color: '#92400E', fontWeight: 600, fontSize: '0.875rem' }}>Cuenta pendiente de aprobación</p>
            <p style={{ color: '#B45309', fontSize: '0.75rem', marginTop: 2 }}>
              Tu cuenta está siendo revisada. Te avisaremos cuando esté activa.
            </p>
          </div>
        )}

        {/* Plan cards grid */}
        <div className="grid gap-4 mb-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))' }}>
          {PLANS.map(plan => {
            const isCurrent    = sub?.plan === plan.key
            const isComingSoon = plan.comingSoon

            return (
              <div
                key={plan.key}
                style={{
                  background: 'var(--card)',
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
                  boxShadow: 'var(--shadow)',
                  transition: 'transform 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                {/* Badges */}
                {isCurrent && (
                  <span style={{
                    position: 'absolute', top: 10, right: 10,
                    background: 'var(--grad)', color: '#fff',
                    borderRadius: 999, padding: '0.15rem 0.6rem',
                    fontSize: '0.65rem', fontWeight: 700,
                  }}>Tu plan actual</span>
                )}
                {isComingSoon && (
                  <span className="pill pill-orange" style={{ position: 'absolute', top: 10, right: 10 }}>
                    Próximamente
                  </span>
                )}

                {/* Name & price */}
                <div style={{ paddingTop: isCurrent || isComingSoon ? '1.25rem' : 0 }}>
                  <p style={{ color: 'var(--text)', fontWeight: 700, fontSize: '1rem' }}>{plan.name}</p>
                  <p style={{ marginTop: 4 }}>
                    <span style={{ color: plan.accent, fontWeight: 800, fontSize: '1.4rem' }}>{plan.price}</span>
                    {plan.period && (
                      <span style={{ color: 'var(--text3)', fontSize: '0.8rem', marginLeft: 3 }}>{plan.period}</span>
                    )}
                  </p>
                </div>

                {/* Features */}
                <ul className="space-y-1.5" style={{ flex: 1 }}>
                  {plan.features.map(f => (
                    <li key={f.text} className="flex items-start gap-2" style={{ fontSize: '0.8rem', color: 'var(--text2)' }}>
                      <div style={{
                        width: 6, height: 6, borderRadius: '50%',
                        background: f.orange ? 'var(--orange)' : 'var(--blue)',
                        flexShrink: 0, marginTop: 5,
                      }} />
                      {f.text}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                {!isCurrent && !isComingSoon && plan.key === 'starter' && (
                  <button
                    onClick={handleCheckout}
                    disabled={checkoutLoading || !sub?.approved}
                    className="btn btn-grad"
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    {checkoutLoading ? 'Redirigiendo...' : 'Suscribirme'}
                  </button>
                )}
                {isCurrent && (
                  <button disabled className="btn" style={{ width: '100%', justifyContent: 'center' }}>
                    Plan actual
                  </button>
                )}
                {isComingSoon && (
                  <button disabled className="btn" style={{ width: '100%', justifyContent: 'center' }}>
                    Próximamente
                  </button>
                )}
                {!isCurrent && !isComingSoon && plan.key === 'free' && (
                  <button disabled className="btn" style={{ width: '100%', justifyContent: 'center' }}>
                    Plan básico
                  </button>
                )}
              </div>
            )
          })}
        </div>

        {/* Uso del mes */}
        <div className="card mb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 style={{ color: 'var(--text)', fontWeight: 600, fontSize: '0.875rem' }}>Uso del mes</h2>
            {renewalDate && (
              <span style={{ color: 'var(--text3)', fontSize: '0.72rem' }}>Próxima renovación: {renewalDate}</span>
            )}
          </div>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between mb-1">
                <span style={{ color: 'var(--text2)', fontSize: '0.8rem' }}>Reportes mensuales</span>
                <span style={{ color: nearLimit ? '#B45309' : 'var(--blue-dark)', fontSize: '0.8rem', fontWeight: nearLimit ? 700 : 600 }}>
                  {sub?.reports_used}/{sub?.reports_limit}
                </span>
              </div>
              <div className="progress-track">
                <div className={nearLimit ? 'progress-fill-amber' : 'progress-fill-blue'} style={{ width: `${reportsPct}%` }} />
              </div>
            </div>
            {sub?.consultations_limit > 0 && (
              <div>
                <div className="flex justify-between mb-1">
                  <span style={{ color: 'var(--text2)', fontSize: '0.8rem' }}>Consultas al analista</span>
                  <span style={{ color: 'var(--orange-dark)', fontSize: '0.8rem', fontWeight: 600 }}>
                    {sub?.consultations_used || 0}/{sub?.consultations_limit}
                  </span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill-orange" style={{ width: `${consultPct}%` }} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Gestión MP */}
        {sub?.plan !== 'free' && (
          <div className="card">
            <h2 style={{ color: 'var(--text)', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.5rem' }}>
              Gestión de suscripción
            </h2>
            <p style={{ color: 'var(--text3)', fontSize: '0.8rem', marginBottom: '0.875rem' }}>
              Administrá tu suscripción directamente desde MercadoPago.
            </p>
            <button onClick={handleCheckout} disabled={checkoutLoading} className="btn btn-outline">
              Gestionar en MercadoPago
            </button>
          </div>
        )}
      </div>
    </PageLayout>
  )
}

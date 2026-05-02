import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import FAQ from '../components/FAQ'

/* ── Fade-up animation hook ──────────────────────────────── */
function useFadeUp() {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold: 0.08 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return [ref, visible]
}

const fadeUp = (visible) => ({
  opacity: visible ? 1 : 0,
  transform: visible ? 'translateY(0)' : 'translateY(22px)',
  transition: 'opacity 0.55s ease-out, transform 0.55s ease-out',
})

/* ── CTA Button styles ───────────────────────────────────── */
const btnGradStyle = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
  background: 'linear-gradient(135deg, #4EC7F5, #FE7808)',
  color: '#fff', border: 'none', borderRadius: 12,
  fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap',
  boxShadow: '0 6px 24px rgba(254,120,8,0.3)',
  transition: 'all 0.2s',
}

/* ── Landing Navbar ──────────────────────────────────────── */
function LandingNav() {
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <nav style={{
      background: isDark ? 'rgba(15,23,42,0.94)' : 'rgba(255,255,255,0.92)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(0,0,0,0.06)',
      position: 'sticky', top: 0, zIndex: 50,
    }}>
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between" style={{ height: 64 }}>

        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div style={{
            width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(135deg, #4EC7F5, #FE7808)',
          }} />
          <div className="flex items-center whitespace-nowrap">
            <span style={{
              fontWeight: 900, fontSize: '1rem', letterSpacing: '-0.01em',
              background: 'linear-gradient(90deg, #FE7808, #4EC7F5)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>Reporti</span>
            <span style={{ color: '#D1D5DB', fontWeight: 300, margin: '0 8px', fontSize: '1rem' }}>·</span>
            <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text2)' }}>
              Análisis inteligente para tu{' '}
              <span style={{
                background: 'linear-gradient(90deg, #4EC7F5, #FE7808)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>negocio</span>
            </span>
          </div>
        </div>

        {/* Links + actions */}
        <div className="flex items-center gap-6">
          {[
            ['#como-funciona', 'Cómo funciona'],
            ['#funcionalidades', 'Funcionalidades'],
            ['#precios', 'Precios'],
            ['#faq', 'FAQ'],
          ].map(([href, label]) => (
            <a key={href} href={href} style={{
              color: 'var(--text2)', fontSize: '0.85rem', fontWeight: 500,
              textDecoration: 'none', transition: 'color 0.15s',
            }}
              onMouseEnter={e => e.target.style.color = 'var(--text)'}
              onMouseLeave={e => e.target.style.color = 'var(--text2)'}
            >{label}</a>
          ))}

          {/* Theme toggle */}
          <div className="flex items-center gap-1">
            <span style={{ fontSize: '0.75rem' }}>☀️</span>
            <button onClick={toggleTheme} style={{
              width: 28, height: 16, borderRadius: 999,
              background: isDark ? '#4EC7F5' : 'rgba(0,0,0,0.18)',
              position: 'relative', border: 'none', cursor: 'pointer',
              transition: 'background 0.2s ease',
            }}>
              <span style={{
                position: 'absolute', top: 2,
                left: isDark ? 14 : 2, width: 12, height: 12,
                borderRadius: '50%', background: '#fff',
                transition: 'left 0.2s ease', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
              }} />
            </button>
            <span style={{ fontSize: '0.75rem' }}>🌙</span>
          </div>

          <button
            onClick={() => navigate('/login')}
            style={{ ...btnGradStyle, padding: '0.5rem 1.1rem', fontSize: '0.875rem' }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-1px)'
              e.currentTarget.style.boxShadow = '0 10px 32px rgba(254,120,8,0.38)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 6px 24px rgba(254,120,8,0.3)'
            }}
          >
            Empezar gratis →
          </button>
        </div>
      </div>
    </nav>
  )
}

/* ── Report Preview (hero right) ─────────────────────────── */
function ReportPreview() {
  const BARS = [32, 45, 38, 55, 48, 62, 52, 68, 78, 85]
  return (
    <div style={{ position: 'relative' }}>
      {/* Ambient glow */}
      <div style={{
        position: 'absolute', inset: -28, borderRadius: 36, zIndex: 0,
        background: 'radial-gradient(ellipse at 50% 50%, rgba(78,199,245,0.13) 0%, rgba(254,120,8,0.07) 55%, transparent 80%)',
        pointerEvents: 'none',
      }} />

      <div
        style={{
          background: 'var(--card)',
          border: '1px solid rgba(0,0,0,0.07)',
          borderRadius: 20, padding: '1.25rem',
          boxShadow: '0 20px 60px rgba(0,0,0,0.10), 0 4px 16px rgba(78,199,245,0.08)',
          position: 'relative', zIndex: 1,
          transition: 'transform 0.3s ease',
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <p style={{ color: 'var(--text)', fontWeight: 700, fontSize: '0.8rem' }}>
              Reporte Ventas — Q1 2025 · Agro Norte S.A.
            </p>
            <p style={{ color: 'var(--text3)', fontSize: '0.65rem', marginTop: 2 }}>Generado hace 30 seg</p>
          </div>
          <span style={{
            background: '#ECFDF5', color: '#065F46', fontSize: '0.65rem',
            fontWeight: 700, borderRadius: 999, padding: '0.15rem 0.6rem', whiteSpace: 'nowrap',
          }}>✓ Análisis listo</span>
        </div>

        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 7, marginBottom: '0.875rem' }}>
          {[
            { label: 'Facturación', value: '$2.4M', delta: '↑18%', color: '#22C55E' },
            { label: 'Ticket prom.', value: '$12.8K', delta: '↑7%', color: '#22C55E' },
            { label: 'Cancelac.', value: '4.2%', delta: '↓0.3%', color: '#EF4444' },
          ].map(k => (
            <div key={k.label} style={{
              background: 'var(--bg)', border: '1px solid rgba(0,0,0,0.05)',
              borderRadius: 12, padding: '0.55rem 0.65rem',
            }}>
              <p style={{ color: 'var(--text3)', fontSize: '0.58rem', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>
                {k.label}
              </p>
              <p style={{ color: 'var(--text)', fontWeight: 900, fontSize: '0.9rem' }}>{k.value}</p>
              <p style={{ color: k.color, fontSize: '0.6rem', fontWeight: 700, marginTop: 1 }}>{k.delta}</p>
            </div>
          ))}
        </div>

        {/* Bar chart */}
        <div style={{
          background: 'var(--bg)', border: '1px solid rgba(0,0,0,0.05)',
          borderRadius: 12, padding: '0.65rem 0.75rem', marginBottom: '0.75rem',
        }}>
          <p style={{ color: 'var(--text3)', fontSize: '0.58rem', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
            Evolución mensual de ventas
          </p>
          <div className="flex items-end gap-1" style={{ height: 48 }}>
            {BARS.map((h, i) => (
              <div key={i} style={{
                flex: 1, height: `${h}%`, borderRadius: '3px 3px 0 0',
                background: i >= 8
                  ? 'linear-gradient(180deg, #4EC7F5, #FE7808)'
                  : i === 7
                    ? '#7DD3FC'
                    : i >= 5
                      ? '#BAE6FD'
                      : '#E0F2FE',
              }} />
            ))}
          </div>
        </div>

        {/* Recommendation */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(78,199,245,0.08), rgba(254,120,8,0.05))',
          border: '1px solid rgba(78,199,245,0.2)',
          borderRadius: 12, padding: '0.65rem 0.75rem',
        }}>
          <p style={{ color: '#1A9FD4', fontSize: '0.58rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
            ★ Análisis IA
          </p>
          <p style={{ color: 'var(--text2)', fontSize: '0.7rem', lineHeight: 1.55 }}>
            <strong style={{ color: 'var(--text)' }}>Zona Sur:</strong> oportunidad sin aprovechar. Representa el 38% de las ventas con solo 12% del esfuerzo comercial. Reasignar 2 vendedores podría aumentar facturación un{' '}
            <strong style={{ color: '#1A9FD4' }}>15% en Q2</strong>.
          </p>
        </div>
      </div>
    </div>
  )
}

/* ── Trust Bar ───────────────────────────────────────────── */
function TrustBar() {
  return (
    <div style={{
      background: 'var(--card)',
      borderTop: '1px solid rgba(0,0,0,0.06)',
      borderBottom: '1px solid rgba(0,0,0,0.06)',
      padding: '1rem 1.5rem',
    }}>
      <div className="max-w-5xl mx-auto flex items-center justify-center flex-wrap gap-8">
        {[
          'Sin consultores externos',
          'Datos 100% privados',
          'PDF + PPTX listos para presentar',
          'Análisis en 30 segundos',
        ].map(item => (
          <div key={item} className="flex items-center gap-2">
            <span style={{ color: '#22C55E', fontWeight: 700, fontSize: '0.9rem' }}>✓</span>
            <span style={{ color: 'var(--text2)', fontSize: '0.83rem', fontWeight: 500 }}>{item}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── How It Works ────────────────────────────────────────── */
const STEPS = [
  {
    num: '1', icon: '↑',
    iconBg: '#EFF6FF', iconColor: '#3B82F6', iconBorder: '#BFDBFE',
    title: 'Subí tu Excel en segundos',
    desc: 'Arrastrá tu CSV o Excel. Sin preparación previa, sin plantillas, sin formatos especiales.',
  },
  {
    num: '2', icon: '✎',
    iconBg: '#FFF7ED', iconColor: '#F97316', iconBorder: '#FED7AA',
    title: 'Elegí qué querés analizar',
    desc: 'Ventas, finanzas u operaciones. PDF ejecutivo, PPTX o ambos.',
  },
  {
    num: '3', icon: '✓',
    iconBg: '#F0FDF4', iconColor: '#22C55E', iconBorder: '#BBF7D0',
    title: 'Recibí un análisis ejecutivo completo',
    desc: 'KPIs, tendencias y recomendaciones concretas listas para presentar a tu equipo o directorio.',
  },
]

function HowItWorks() {
  const [ref, visible] = useFadeUp()
  return (
    <section id="como-funciona" style={{ padding: '5rem 1.5rem' }}>
      <div ref={ref} style={fadeUp(visible)} className="max-w-5xl mx-auto">
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span style={{
            display: 'inline-flex',
            background: '#FFF7ED', border: '1px solid #FED7AA', color: '#C2410C',
            fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
            borderRadius: 999, padding: '0.25rem 0.75rem', marginBottom: '0.875rem',
          }}>Cómo funciona</span>
          <h2 style={{ color: 'var(--text)', fontWeight: 800, fontSize: '2rem', marginBottom: '0.5rem' }}>
            De tu Excel a tu reporte en 3 pasos
          </h2>
          <p style={{ color: 'var(--text2)', fontSize: '0.95rem' }}>
            Sin configuraciones. Sin fórmulas. Sin esperar días por un consultor.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
          {STEPS.map(s => (
            <div key={s.num}
              style={{
                background: 'var(--card)', border: '1px solid rgba(0,0,0,0.07)',
                borderRadius: 16, padding: '1.75rem',
                boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                transition: 'transform 0.3s, box-shadow 0.3s, border-color 0.3s',
                cursor: 'default',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.08)'
                e.currentTarget.style.borderColor = 'rgba(78,199,245,0.3)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.04)'
                e.currentTarget.style.borderColor = 'rgba(0,0,0,0.07)'
              }}
            >
              <span style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 24, height: 24, borderRadius: '50%',
                background: '#FFF7ED', border: '1px solid #FED7AA',
                color: '#C2410C', fontSize: '0.7rem', fontWeight: 800,
                marginBottom: '0.875rem',
              }}>{s.num}</span>

              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: s.iconBg, border: `1px solid ${s.iconBorder}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.25rem', color: s.iconColor, marginBottom: '0.875rem',
              }}>{s.icon}</div>

              <p style={{ color: 'var(--text)', fontWeight: 700, fontSize: '0.95rem', marginBottom: 6 }}>{s.title}</p>
              <p style={{ color: 'var(--text2)', fontSize: '0.83rem', lineHeight: 1.6 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ── Features ────────────────────────────────────────────── */
const FEATURES = [
  {
    icon: '⊞', iconBg: '#EFF6FF', iconColor: '#3B82F6', iconBorder: '#BFDBFE',
    title: 'KPIs que importan, calculados solos',
    desc: 'Métricas clave extraídas e interpretadas automáticamente. Sin fórmulas, sin pivot tables.',
  },
  {
    icon: '✦',
    iconBg: 'linear-gradient(135deg, rgba(78,199,245,0.15), rgba(254,120,8,0.10))',
    iconColor: '#1A9FD4', iconBorder: 'rgba(78,199,245,0.3)',
    title: 'Sabé exactamente qué hacer para mejorar tus resultados',
    desc: 'Claude analiza tus datos y genera recomendaciones concretas adaptadas a tu negocio.',
    highlight: true,
  },
  {
    icon: '〜', iconBg: '#FFFBEB', iconColor: '#F59E0B', iconBorder: '#FDE68A',
    title: 'Tendencias que no ves mirando la tabla',
    desc: 'Identifica patrones, estacionalidades y anomalías en tus datos de forma automática.',
  },
  {
    icon: '⌂', iconBg: '#F0FDF4', iconColor: '#22C55E', iconBorder: '#BBF7D0',
    title: 'Habla el idioma de tu negocio',
    desc: 'Configurá tu perfil con rubro, moneda y contexto. El análisis se adapta a lo que realmente te importa.',
  },
]

function Features() {
  const [ref, visible] = useFadeUp()
  return (
    <section id="funcionalidades" style={{ padding: '4rem 1.5rem', background: 'var(--bg3)' }}>
      <div ref={ref} style={fadeUp(visible)} className="max-w-5xl mx-auto">
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <span style={{
            display: 'inline-flex',
            background: '#EFF6FF', border: '1px solid #BFDBFE', color: '#1D4ED8',
            fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
            borderRadius: 999, padding: '0.25rem 0.75rem', marginBottom: '0.875rem',
          }}>Funcionalidades</span>
          <h2 style={{ color: 'var(--text)', fontWeight: 800, fontSize: '2rem' }}>
            Todo lo que necesitás para decidir mejor
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          {FEATURES.map(f => (
            <div key={f.title}
              style={{
                background: f.highlight
                  ? 'linear-gradient(135deg, rgba(78,199,245,0.04), rgba(254,120,8,0.02))'
                  : 'var(--card)',
                border: f.highlight ? '2px solid rgba(78,199,245,0.35)' : '1px solid rgba(0,0,0,0.07)',
                borderRadius: 16, padding: '1.5rem',
                boxShadow: f.highlight
                  ? '0 8px 32px rgba(78,199,245,0.10)'
                  : '0 2px 12px rgba(0,0,0,0.04)',
                position: 'relative',
                transition: 'transform 0.3s, box-shadow 0.3s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.boxShadow = f.highlight
                  ? '0 16px 48px rgba(78,199,245,0.18)'
                  : '0 12px 40px rgba(0,0,0,0.08)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = f.highlight
                  ? '0 8px 32px rgba(78,199,245,0.10)'
                  : '0 2px 12px rgba(0,0,0,0.04)'
              }}
            >
              {f.highlight && (
                <span style={{
                  position: 'absolute', top: -13, right: 16,
                  background: 'linear-gradient(135deg, #4EC7F5, #FE7808)',
                  color: '#fff', fontSize: '0.65rem', fontWeight: 800,
                  borderRadius: 999, padding: '0.2rem 0.65rem',
                }}>Más poderosa</span>
              )}
              <div style={{
                width: 40, height: 40, borderRadius: 12,
                background: f.iconBg, border: `1px solid ${f.iconBorder}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.1rem', color: f.iconColor, marginBottom: '0.875rem',
              }}>{f.icon}</div>
              <p style={{ color: 'var(--text)', fontWeight: 700, fontSize: '0.875rem', marginBottom: 6 }}>{f.title}</p>
              <p style={{ color: 'var(--text2)', fontSize: '0.8rem', lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Claude Strip */}
        <div style={{
          marginTop: '1.75rem',
          background: 'linear-gradient(135deg, rgba(78,199,245,0.06), rgba(254,120,8,0.04))',
          border: '1px solid rgba(78,199,245,0.22)',
          borderRadius: 16, padding: '1.5rem',
          display: 'flex', alignItems: 'center', gap: '1.25rem',
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12, flexShrink: 0,
            background: 'linear-gradient(135deg, #4EC7F5, #FE7808)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.4rem',
          }}>✦</div>
          <div>
            <div className="flex items-center gap-2" style={{ marginBottom: 4 }}>
              <span style={{ color: 'var(--text)', fontWeight: 700, fontSize: '0.95rem' }}>Motor de análisis: Claude</span>
              <span style={{
                background: '#EFF6FF', border: '1px solid #BFDBFE', color: '#1D4ED8',
                fontSize: '0.65rem', fontWeight: 700, borderRadius: 999, padding: '0.1rem 0.5rem',
              }}>Anthropic</span>
            </div>
            <p style={{ color: 'var(--text2)', fontSize: '0.83rem', lineHeight: 1.55 }}>
              Usamos Claude, el modelo de IA de Anthropic, para analizar tus datos y generar
              insights precisos, contextualizados y accionables.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ── Pricing ─────────────────────────────────────────────── */
const PRICING_PLANS = [
  {
    name: 'Free',
    price: 'Gratis',
    period: 'para siempre',
    features: [
      { text: '3 reportes totales', active: true },
      { text: 'Solo PDF', active: true },
      { text: 'Perfil de empresa', active: false },
      { text: 'PPTX', active: false },
    ],
    cta: 'Empezar gratis',
    ctaStyle: 'outline',
  },
  {
    name: 'Starter',
    price: '$20.000',
    period: '/mes ARS',
    features: [
      { text: '10 reportes por mes', active: true },
      { text: 'PDF + PPTX', active: true },
      { text: 'Perfil de empresa personalizado', active: true },
      { text: '3 consultas al analista', active: true, orange: true },
      { text: 'Renovación automática', active: true },
    ],
    cta: 'Suscribirme ahora →',
    ctaStyle: 'grad',
    highlight: true,
  },
  {
    name: 'Pro',
    price: '$35',
    period: '/mes USD',
    features: [
      { text: '30 reportes por mes', active: true },
      { text: 'PDF + PPTX', active: true },
      { text: 'Perfil de empresa', active: true },
      { text: '10 consultas al analista', active: true },
      { text: 'Soporte prioritario', active: true },
    ],
    cta: 'Próximamente',
    ctaStyle: 'disabled',
    comingSoon: true,
  },
]

function Pricing() {
  const navigate = useNavigate()
  const [ref, visible] = useFadeUp()
  return (
    <section id="precios" style={{ padding: '5rem 1.5rem' }}>
      <div ref={ref} style={fadeUp(visible)} className="max-w-5xl mx-auto">
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span style={{
            display: 'inline-flex',
            background: '#F0FDF4', border: '1px solid #BBF7D0', color: '#15803D',
            fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
            borderRadius: 999, padding: '0.25rem 0.75rem', marginBottom: '0.875rem',
          }}>Planes</span>
          <h2 style={{ color: 'var(--text)', fontWeight: 800, fontSize: '2rem', marginBottom: '0.5rem' }}>
            Empezar gratis, escalar cuando lo necesitás
          </h2>
          <p style={{ color: 'var(--text2)', fontSize: '0.95rem' }}>
            Sin compromisos. Tus primeros 3 reportes son completamente gratuitos.
          </p>
        </div>

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem', alignItems: 'center',
        }}>
          {PRICING_PLANS.map(p => (
            <div key={p.name}
              style={{
                background: p.comingSoon ? 'var(--bg3)' : 'var(--card)',
                border: p.highlight ? '2px solid #93C5FD' : '1px solid rgba(0,0,0,0.07)',
                borderRadius: 16,
                padding: p.highlight ? '2rem' : '1.75rem',
                position: 'relative',
                transform: p.highlight ? 'scale(1.04)' : 'scale(1)',
                boxShadow: p.highlight
                  ? '0 8px 32px rgba(78,199,245,0.18), 0 20px 60px rgba(0,0,0,0.08)'
                  : '0 2px 12px rgba(0,0,0,0.04)',
                transition: 'transform 0.3s, box-shadow 0.3s',
                opacity: p.comingSoon ? 0.75 : 1,
              }}
              onMouseEnter={e => {
                if (p.comingSoon) return
                e.currentTarget.style.transform = p.highlight ? 'scale(1.04) translateY(-3px)' : 'translateY(-2px)'
                e.currentTarget.style.boxShadow = p.highlight
                  ? '0 16px 48px rgba(78,199,245,0.25), 0 24px 72px rgba(0,0,0,0.10)'
                  : '0 8px 32px rgba(0,0,0,0.08)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = p.highlight ? 'scale(1.04)' : 'scale(1)'
                e.currentTarget.style.boxShadow = p.highlight
                  ? '0 8px 32px rgba(78,199,245,0.18), 0 20px 60px rgba(0,0,0,0.08)'
                  : '0 2px 12px rgba(0,0,0,0.04)'
              }}
            >
              {p.highlight && (
                <div style={{
                  position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)',
                  background: 'linear-gradient(135deg, #4EC7F5, #FE7808)',
                  color: '#fff', fontSize: '0.7rem', fontWeight: 800,
                  borderRadius: 999, padding: '0.2rem 0.8rem', whiteSpace: 'nowrap',
                }}>✦ Más elegido</div>
              )}
              {p.comingSoon && (
                <span style={{
                  position: 'absolute', top: 12, right: 12,
                  background: '#EEF2FF', border: '1px solid #C7D2FE', color: '#4338CA',
                  fontSize: '0.65rem', fontWeight: 700, borderRadius: 999, padding: '0.15rem 0.55rem',
                }}>Próximamente</span>
              )}

              <p style={{ color: 'var(--text3)', fontSize: '0.75rem', fontWeight: 600, marginBottom: 6 }}>{p.name}</p>
              <div style={{ marginBottom: '1.25rem' }}>
                <span className="grad-text" style={{ fontWeight: 800, fontSize: '1.8rem', lineHeight: 1 }}>{p.price}</span>
                <span style={{ color: 'var(--text3)', fontSize: '0.78rem', marginLeft: 5 }}>{p.period}</span>
              </div>

              <ul className="space-y-2" style={{ marginBottom: '1.5rem' }}>
                {p.features.map(f => (
                  <li key={f.text} className="flex items-start gap-2" style={{
                    fontSize: '0.82rem',
                    color: f.active ? 'var(--text2)' : 'var(--text3)',
                    opacity: f.active ? 1 : 0.45,
                  }}>
                    <div style={{
                      width: 6, height: 6, borderRadius: '50%', flexShrink: 0, marginTop: 6,
                      background: f.orange ? '#FE7808' : f.active ? '#4EC7F5' : 'var(--text3)',
                    }} />
                    {f.text}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => !p.comingSoon && navigate('/login')}
                disabled={p.comingSoon}
                style={{
                  width: '100%', justifyContent: 'center', display: 'flex',
                  alignItems: 'center', padding: '0.6rem 1rem',
                  borderRadius: 10, fontWeight: 700, fontSize: '0.875rem',
                  cursor: p.comingSoon ? 'not-allowed' : 'pointer',
                  border: p.ctaStyle === 'grad' ? 'none' : '1px solid rgba(0,0,0,0.13)',
                  background: p.ctaStyle === 'grad'
                    ? 'linear-gradient(135deg, #4EC7F5, #FE7808)'
                    : 'transparent',
                  color: p.ctaStyle === 'grad' ? '#fff' : 'var(--text2)',
                  opacity: p.ctaStyle === 'disabled' ? 0.5 : 1,
                  boxShadow: p.ctaStyle === 'grad' ? '0 6px 24px rgba(254,120,8,0.25)' : 'none',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => {
                  if (p.ctaStyle === 'grad') {
                    e.currentTarget.style.transform = 'translateY(-1px)'
                    e.currentTarget.style.boxShadow = '0 10px 32px rgba(254,120,8,0.38)'
                  } else if (p.ctaStyle === 'outline') {
                    e.currentTarget.style.borderColor = 'rgba(0,0,0,0.28)'
                  }
                }}
                onMouseLeave={e => {
                  if (p.ctaStyle === 'grad') {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 6px 24px rgba(254,120,8,0.25)'
                  } else if (p.ctaStyle === 'outline') {
                    e.currentTarget.style.borderColor = 'rgba(0,0,0,0.13)'
                  }
                }}
              >
                {p.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ── Upload Section ──────────────────────────────────────── */
function UploadSection() {
  const navigate = useNavigate()
  const [hovered, setHovered] = useState(false)

  return (
    <section style={{
      padding: '5rem 1.5rem',
      background: 'linear-gradient(135deg, rgba(78,199,245,0.06) 0%, rgba(254,120,8,0.04) 100%)',
      borderTop: '1px solid rgba(0,0,0,0.06)',
      borderBottom: '1px solid rgba(0,0,0,0.06)',
    }}>
      <div className="max-w-2xl mx-auto" style={{ textAlign: 'center' }}>
        <span style={{
          display: 'inline-flex',
          background: '#EFF6FF', border: '1px solid #BFDBFE', color: '#1D4ED8',
          fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
          borderRadius: 999, padding: '0.25rem 0.75rem', marginBottom: '0.875rem',
        }}>Probalo</span>
        <h2 style={{ color: 'var(--text)', fontWeight: 800, fontSize: '2rem', marginBottom: '0.5rem' }}>
          Tu primer análisis en 30 segundos
        </h2>
        <p style={{ color: 'var(--text2)', fontSize: '0.95rem', marginBottom: '2rem' }}>
          Sin crear cuenta. Sin tarjeta. Solo subí tu archivo.
        </p>

        <div
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onClick={() => navigate('/login')}
          style={{
            background: hovered ? 'rgba(78,199,245,0.02)' : 'var(--card)',
            border: `2px dashed ${hovered ? '#4EC7F5' : 'rgba(0,0,0,0.13)'}`,
            borderRadius: 20, padding: '3.5rem 2rem',
            cursor: 'pointer',
            transition: 'all 0.3s',
            boxShadow: hovered
              ? '0 8px 40px rgba(78,199,245,0.14), 0 4px 20px rgba(0,0,0,0.04)'
              : '0 4px 20px rgba(0,0,0,0.04)',
          }}
        >
          <div style={{
            width: 64, height: 64, borderRadius: 18, margin: '0 auto 1.25rem',
            background: hovered
              ? 'linear-gradient(135deg, rgba(78,199,245,0.28), rgba(254,120,8,0.18))'
              : 'linear-gradient(135deg, rgba(78,199,245,0.15), rgba(254,120,8,0.08))',
            border: '1.5px solid rgba(78,199,245,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.75rem',
            transform: hovered ? 'scale(1.06)' : 'scale(1)',
            transition: 'all 0.3s',
          }}>↑</div>

          <p style={{ color: 'var(--text)', fontWeight: 700, fontSize: '1.1rem', marginBottom: 6 }}>
            Subí tu Excel y obtené tu análisis en segundos
          </p>
          <p style={{ color: 'var(--text3)', fontSize: '0.83rem', marginBottom: '1.5rem' }}>
            CSV o Excel • hasta 10MB • resultados inmediatos
          </p>

          <button
            style={{
              ...btnGradStyle,
              padding: '0.65rem 1.75rem', fontSize: '0.95rem',
              display: 'inline-flex',
            }}
            onClick={e => { e.stopPropagation(); navigate('/login') }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 12px 36px rgba(254,120,8,0.42)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 6px 24px rgba(254,120,8,0.3)'
            }}
          >
            Seleccionar mi archivo →
          </button>

          <div className="flex items-center justify-center flex-wrap gap-6"
            style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
            {['No guardamos tus datos', '100% seguro', 'Sin registro previo'].map(t => (
              <div key={t} className="flex items-center gap-1.5">
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22C55E', display: 'inline-block' }} />
                <span style={{ color: 'var(--text3)', fontSize: '0.75rem', fontWeight: 500 }}>{t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ── Footer ──────────────────────────────────────────────── */
function Footer() {
  return (
    <footer style={{
      background: 'var(--card)',
      borderTop: '1px solid rgba(0,0,0,0.06)',
      padding: '2rem 1rem',
      textAlign: 'center',
    }}>
      <div className="flex items-center justify-center gap-2 mb-2">
        <img src="/logo-reporti.png" alt="R" style={{ height: 24, width: 'auto' }} />
        <span className="grad-text" style={{ fontWeight: 800, fontSize: '0.95rem' }}>Reporti</span>
      </div>
      <p style={{ color: 'var(--text3)', fontSize: '0.75rem' }}>
        Impulsado por IA · © 2026 Reporti · Tu análisis, en segundos.
      </p>
    </footer>
  )
}

/* ── LANDING PAGE ────────────────────────────────────────── */
export default function Landing() {
  const navigate = useNavigate()
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <LandingNav />

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section style={{
        background: isDark
          ? 'var(--bg)'
          : 'linear-gradient(160deg, #F0F9FF 0%, #FAFBFC 40%, #FFF8F3 100%)',
        padding: '6rem 1.5rem 5rem',
      }}>
        <div className="max-w-5xl mx-auto" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '3.5rem', alignItems: 'center',
        }}>
          {/* Left col */}
          <div>
            {/* Trust row */}
            <div className="flex items-center gap-3" style={{ marginBottom: '1.5rem', flexWrap: 'wrap' }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                background: '#FFF3EA', border: '1px solid rgba(254,120,8,0.22)',
                color: '#D45F00', fontSize: '0.72rem', fontWeight: 700,
                borderRadius: 999, padding: '0.25rem 0.65rem',
              }}>✦ Impulsado por IA</span>
              <span style={{ width: 1, height: 14, background: 'rgba(0,0,0,0.15)', display: 'block' }} />
              <span style={{ color: 'var(--text3)', fontSize: '0.72rem' }}>+500 reportes generados esta semana</span>
            </div>

            <h1 style={{
              fontWeight: 900, lineHeight: 1.1, marginBottom: '1rem',
              color: 'var(--text)', letterSpacing: '-0.02em',
              fontSize: 'clamp(2rem, 4vw, 2.75rem)',
            }}>
              Convertí tu Excel en{' '}
              <span className="grad-text">decisiones de negocio</span>
              {' '}en 30 segundos
            </h1>

            <p style={{ color: 'var(--text2)', fontSize: '1.05rem', lineHeight: 1.65, marginBottom: '2rem', maxWidth: 490 }}>
              Subí tu archivo y obtené KPIs, tendencias y recomendaciones de IA
              listas para presentar. Sin consultores, sin esperas.
            </p>

            {/* CTAs */}
            <div className="flex gap-3 flex-wrap" style={{ marginBottom: '0.75rem' }}>
              <button
                style={{ ...btnGradStyle, padding: '0.75rem 1.5rem', fontSize: '0.95rem' }}
                onClick={() => navigate('/login')}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 12px 36px rgba(254,120,8,0.42)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 6px 24px rgba(254,120,8,0.3)'
                }}
              >
                ↑ Analizar mi archivo ahora
              </button>
              <a
                href="#como-funciona"
                style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  padding: '0.75rem 1.5rem', fontSize: '0.95rem', fontWeight: 600,
                  borderRadius: 12, border: '2px solid rgba(0,0,0,0.12)',
                  color: 'var(--text2)', textDecoration: 'none',
                  background: 'transparent', transition: 'all 0.2s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = '#93C5FD'
                  e.currentTarget.style.color = '#1D4ED8'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'rgba(0,0,0,0.12)'
                  e.currentTarget.style.color = 'var(--text2)'
                }}
              >
                Ver ejemplo de reporte
              </a>
            </div>

            <p style={{ color: 'var(--text3)', fontSize: '0.75rem', marginBottom: '2rem' }}>
              Gratis ·{' '}
              <span style={{ color: '#4EC7F5', fontWeight: 600 }}>sin tarjeta</span>
              {' '}· listo en segundos
            </p>

            {/* Stats row */}
            <div style={{
              paddingTop: '1.5rem',
              borderTop: '1px solid rgba(0,0,0,0.07)',
              display: 'flex', gap: '1.75rem', flexWrap: 'wrap',
            }}>
              {[
                { num: '30 seg', label: 'por reporte' },
                { num: 'PDF + PPTX', label: 'listos para compartir' },
                { num: '3 gratis', label: 'sin tarjeta' },
              ].map(s => (
                <div key={s.num}>
                  <p className="grad-text" style={{ fontWeight: 800, fontSize: '1.35rem', lineHeight: 1 }}>{s.num}</p>
                  <p style={{ color: 'var(--text3)', fontSize: '0.72rem', marginTop: 3 }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right col — preview */}
          <ReportPreview />
        </div>
      </section>

      <TrustBar />
      <HowItWorks />
      <Features />
      <UploadSection />

      {/* FAQ */}
      <section id="faq" style={{ padding: '5rem 1.5rem' }}>
        <div className="max-w-2xl mx-auto">
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <span style={{
              display: 'inline-flex',
              background: '#F5F3FF', border: '1px solid #DDD6FE', color: '#5B21B6',
              fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
              borderRadius: 999, padding: '0.25rem 0.75rem', marginBottom: '0.875rem',
            }}>FAQ</span>
            <h2 style={{ color: 'var(--text)', fontWeight: 800, fontSize: '2rem' }}>Preguntas frecuentes</h2>
          </div>
          <FAQ />
        </div>
      </section>

      <Pricing />
      <Footer />
    </div>
  )
}

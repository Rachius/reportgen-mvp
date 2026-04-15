import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import FAQ from '../components/FAQ'
import ClaudeStrip from '../components/ClaudeStrip'
import { useTheme } from '../context/ThemeContext'

/* ── Landing Navbar ───────────────────────────────────────── */
function LandingNav() {
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <nav style={{
      background: 'var(--nav-bg)',
      backdropFilter: 'blur(8px)',
      borderBottom: '1px solid var(--border)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
    }}>
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <img src="/logo-reporti.png" alt="R" style={{ height: '32px', width: 'auto' }} />
          <span className="grad-text" style={{ fontWeight: 700, fontSize: '1.05rem' }}>Reporti</span>
        </div>

        {/* Links + actions */}
        <div className="flex items-center gap-6">
          <a href="#como-funciona" style={{ color: 'var(--text2)', fontSize: '0.85rem', textDecoration: 'none' }}
            onMouseEnter={e => e.target.style.color = 'var(--text)'}
            onMouseLeave={e => e.target.style.color = 'var(--text2)'}>
            Cómo funciona
          </a>
          <a href="#precios" style={{ color: 'var(--text2)', fontSize: '0.85rem', textDecoration: 'none' }}
            onMouseEnter={e => e.target.style.color = 'var(--text)'}
            onMouseLeave={e => e.target.style.color = 'var(--text2)'}>
            Precios
          </a>
          <a href="#faq" style={{ color: 'var(--text2)', fontSize: '0.85rem', textDecoration: 'none' }}
            onMouseEnter={e => e.target.style.color = 'var(--text)'}
            onMouseLeave={e => e.target.style.color = 'var(--text2)'}>
            FAQ
          </a>
          {/* Theme toggle */}
          <div className="flex items-center gap-1">
            <span style={{ fontSize: '0.75rem' }}>☀️</span>
            <button onClick={toggleTheme} style={{
              width: 28, height: 16, borderRadius: 999,
              background: isDark ? 'var(--blue)' : 'var(--border-strong)',
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
          <button onClick={() => navigate('/login')} className="btn btn-grad" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>
            Empezar gratis
          </button>
        </div>
      </div>
    </nav>
  )
}

/* ── Report Preview (hero right) ──────────────────────────── */
function ReportPreview() {
  return (
    <div style={{
      background: 'var(--card)',
      border: '1px solid var(--border)',
      borderRadius: 14,
      padding: '1.25rem',
      boxShadow: 'var(--shadow)',
    }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p style={{ color: 'var(--text)', fontWeight: 600, fontSize: '0.85rem' }}>
            Reporte de Ventas — Q1 2025
          </p>
          <p style={{ color: 'var(--text3)', fontSize: '0.7rem', marginTop: 2 }}>Generado hace 30 seg</p>
        </div>
        <span className="pill pill-green">Análisis listo</span>
      </div>

      {/* KPI cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: '1rem' }}>
        {[
          { label: 'Facturación', value: '$2.4M', delta: '↑18%', color: '#10B981' },
          { label: 'Ticket prom.', value: '$12.8K', delta: '↑7%', color: '#10B981' },
          { label: 'Cancelac.', value: '4.2%', delta: '', color: 'var(--text3)' },
        ].map(k => (
          <div key={k.label} style={{
            background: 'var(--bg)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            padding: '0.6rem 0.75rem',
          }}>
            <p style={{ color: 'var(--text3)', fontSize: '0.65rem', marginBottom: 2 }}>{k.label}</p>
            <p style={{ color: 'var(--text)', fontWeight: 700, fontSize: '0.95rem' }}>{k.value}</p>
            {k.delta && <p style={{ color: k.color, fontSize: '0.65rem', fontWeight: 600 }}>{k.delta}</p>}
          </div>
        ))}
      </div>

      {/* Bar chart */}
      <div style={{ marginBottom: '1rem' }}>
        <p style={{ color: 'var(--text3)', fontSize: '0.65rem', marginBottom: 6 }}>Facturación mensual</p>
        <div className="flex items-end gap-1.5" style={{ height: 52 }}>
          {[40, 58, 45, 72, 60, 85].map((h, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: `${h}%`,
                borderRadius: '3px 3px 0 0',
                background: i === 5
                  ? 'var(--grad)'
                  : 'var(--blue-light)',
                border: i === 5 ? 'none' : '1px solid var(--border)',
              }}
            />
          ))}
        </div>
        <div className="flex gap-1.5 mt-1">
          {['Ago','Sep','Oct','Nov','Dic','Ene'].map(m => (
            <p key={m} style={{ flex: 1, fontSize: '0.6rem', color: 'var(--text3)', textAlign: 'center' }}>{m}</p>
          ))}
        </div>
      </div>

      {/* Recommendation */}
      <div style={{
        background: 'var(--orange-light)',
        border: '1px solid var(--orange)',
        borderRadius: 8,
        padding: '0.65rem 0.75rem',
      }}>
        <p style={{ color: 'var(--orange-dark)', fontSize: '0.62rem', fontWeight: 700, marginBottom: 3 }}>
          ✦ Recomendación IA · Claude
        </p>
        <p style={{ color: 'var(--text2)', fontSize: '0.72rem', lineHeight: 1.5 }}>
          Enero mostró el mayor crecimiento (+18%). Reforzá la estrategia de ese período para Q2.
        </p>
      </div>
    </div>
  )
}

/* ── How It Works steps ───────────────────────────────────── */
const STEPS = [
  { num: '1', title: 'Subí tu archivo', desc: 'Arrastrá o seleccioná tu CSV o Excel. Hasta 10 MB.', icon: '↑' },
  { num: '2', title: 'Elegí el análisis', desc: 'Seleccioná el tipo de reporte y el formato de salida.', icon: '✎' },
  { num: '3', title: 'Recibí insights automáticos', desc: 'Obtené un reporte profesional con KPIs, tendencias y recomendaciones.', icon: '✓' },
]

function HowItWorks() {
  return (
    <section id="como-funciona" style={{ padding: '5rem 0' }}>
      <div className="max-w-5xl mx-auto px-6">
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <p className="section-label mb-2">Proceso</p>
          <h2 style={{ color: 'var(--text)', fontWeight: 800, fontSize: '1.75rem' }}>
            Tres pasos para tu reporte
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
          {STEPS.map(s => (
            <div
              key={s.num}
              className="card"
              style={{ textAlign: 'center', transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'default' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.10)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow)' }}
            >
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                background: 'var(--tab-active-bg)',
                border: '1.5px solid var(--tab-active-border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: '1rem', color: 'var(--tab-active-text)',
                margin: '0 auto 0.875rem',
              }}>
                {s.num}
              </div>
              <p style={{ color: 'var(--text)', fontWeight: 600, fontSize: '0.9rem', marginBottom: 6 }}>{s.title}</p>
              <p style={{ color: 'var(--text2)', fontSize: '0.8rem', lineHeight: 1.5 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ── Features grid ────────────────────────────────────────── */
const FEATURES = [
  { icon: '⊞', color: 'var(--blue)', bg: 'var(--blue-light)', title: 'KPIs automáticos', desc: 'Métricas clave calculadas e interpretadas automáticamente.' },
  { icon: '〜', color: 'var(--orange)', bg: 'var(--orange-light)', title: 'Detección de tendencias', desc: 'Identifica patrones y anomalías en tus datos.' },
  { icon: '✦', color: '#10B981', bg: '#ECFDF5', title: 'Recomendaciones con IA', desc: 'Sugerencias accionables basadas en tu contexto de negocio.' },
  { icon: '⌂', color: '#F59E0B', bg: '#FFFBEB', title: 'Adaptado a tu negocio', desc: 'Configurá tu perfil para análisis más precisos y relevantes.' },
]

function Features() {
  return (
    <section style={{ padding: '4rem 0', background: 'var(--bg3)' }}>
      <div className="max-w-5xl mx-auto px-6">
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <p className="section-label mb-2">Funcionalidades</p>
          <h2 style={{ color: 'var(--text)', fontWeight: 800, fontSize: '1.75rem' }}>
            Todo lo que necesitás para decidir mejor
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          {FEATURES.map(f => (
            <div key={f.title} className="card" style={{ transition: 'transform 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
              <div style={{
                width: 38, height: 38, borderRadius: 9,
                background: f.bg, display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: '1.1rem', color: f.color,
                marginBottom: '0.875rem',
              }}>
                {f.icon}
              </div>
              <p style={{ color: 'var(--text)', fontWeight: 600, fontSize: '0.875rem', marginBottom: 4 }}>{f.title}</p>
              <p style={{ color: 'var(--text2)', fontSize: '0.8rem', lineHeight: 1.5 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ── Pricing strip ────────────────────────────────────────── */
const PRICING_PLANS = [
  {
    name: 'Free',
    price: 'Gratis',
    period: 'para siempre',
    features: ['3 reportes totales', 'Solo PDF', 'Sin perfil de empresa'],
    cta: 'Empezar gratis',
    accent: 'var(--blue)',
  },
  {
    name: 'Starter',
    price: '$17.500',
    period: '/mes ARS',
    features: ['10 reportes por mes', 'PDF + PPTX', 'Perfil de empresa personalizado', '3 consultas al analista', 'Renovación automática'],
    cta: 'Suscribirme',
    accent: 'var(--orange)',
    highlight: true,
  },
  {
    name: 'Pro',
    price: '$35',
    period: '/mes USD',
    features: ['30 reportes por mes', 'PDF + PPTX', 'Perfil de empresa', '10 consultas al analista', 'Soporte prioritario'],
    cta: 'Próximamente',
    accent: 'var(--orange)',
    comingSoon: true,
  },
]

function Pricing() {
  const navigate = useNavigate()
  return (
    <section id="precios" style={{ padding: '5rem 0' }}>
      <div className="max-w-5xl mx-auto px-6">
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <p className="section-label mb-2">Planes</p>
          <h2 style={{ color: 'var(--text)', fontWeight: 800, fontSize: '1.75rem' }}>Simple y transparente</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
          {PRICING_PLANS.map(p => (
            <div key={p.name} className="card" style={{
              border: p.highlight ? `2px solid var(--orange)` : '1px solid var(--border)',
              position: 'relative',
              transition: 'transform 0.2s',
            }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              {p.comingSoon && (
                <span className="pill pill-orange" style={{ position: 'absolute', top: 12, right: 12 }}>Próximamente</span>
              )}
              <p style={{ color: 'var(--text)', fontWeight: 700, fontSize: '1rem', marginBottom: 4 }}>{p.name}</p>
              <p>
                <span style={{ color: p.accent, fontWeight: 800, fontSize: '1.5rem' }}>{p.price}</span>
                <span style={{ color: 'var(--text3)', fontSize: '0.8rem', marginLeft: 2 }}>{p.period}</span>
              </p>
              <ul style={{ marginTop: '1rem', marginBottom: '1.25rem' }} className="space-y-2">
                {p.features.map(f => (
                  <li key={f} className="flex items-start gap-2" style={{ fontSize: '0.8rem', color: 'var(--text2)' }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: p.accent, flexShrink: 0, marginTop: 5 }} />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => !p.comingSoon && navigate('/login')}
                disabled={p.comingSoon}
                className={p.highlight ? 'btn btn-grad' : 'btn btn-outline'}
                style={{ width: '100%', justifyContent: 'center' }}
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

/* ── Upload section ───────────────────────────────────────── */
function UploadSection() {
  const navigate = useNavigate()
  const [hovered, setHovered] = useState(false)

  return (
    <section style={{ padding: '5rem 0', background: 'var(--bg3)' }}>
      <div className="max-w-xl mx-auto px-6 text-center">
        <p className="section-label mb-2">Probalo</p>
        <h2 style={{ color: 'var(--text)', fontWeight: 800, fontSize: '1.75rem', marginBottom: 8 }}>
          Probalo ahora · gratis
        </h2>
        <p style={{ color: 'var(--text2)', fontSize: '0.875rem', marginBottom: '2rem' }}>
          3 reportes gratuitos, sin tarjeta de crédito.
        </p>

        <div
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onClick={() => navigate('/login')}
          style={{
            border: `2px dashed ${hovered ? 'var(--blue)' : 'var(--border-strong)'}`,
            borderRadius: 16,
            padding: '2.5rem 2rem',
            cursor: 'pointer',
            transition: 'all 0.2s',
            background: hovered ? 'var(--blue-light)' : 'var(--card)',
            boxShadow: hovered ? '0 0 0 4px rgba(78,199,245,0.10)' : 'none',
          }}
        >
          {/* Upload icon */}
          <div style={{
            width: 56, height: 56, borderRadius: 14,
            background: 'var(--grad-soft)',
            border: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.75rem', margin: '0 auto 1rem',
          }}>
            ↑
          </div>
          <p style={{ color: 'var(--text)', fontWeight: 600, fontSize: '0.95rem', marginBottom: 6 }}>
            Arrastrá tu archivo o hacé click para subirlo
          </p>
          <p style={{ color: 'var(--text3)', fontSize: '0.8rem', marginBottom: '1.25rem' }}>
            CSV o Excel · hasta 10MB · sin registro previo
          </p>
          <button
            className="btn btn-grad"
            style={{ padding: '0.5rem 1.5rem', fontSize: '0.875rem' }}
            onClick={e => { e.stopPropagation(); navigate('/login') }}
          >
            Seleccionar archivo
          </button>
        </div>

        <p style={{ color: 'var(--text3)', fontSize: '0.72rem', marginTop: '0.875rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
          Procesado de forma segura · no almacenamos tus archivos
        </p>
      </div>
    </section>
  )
}

/* ── Footer ───────────────────────────────────────────────── */
function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid var(--border)',
      padding: '2rem 1rem',
      textAlign: 'center',
      background: 'var(--bg2)',
    }}>
      <div className="flex items-center justify-center gap-2 mb-2">
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--grad)' }} />
        <span className="grad-text" style={{ fontWeight: 700, fontSize: '0.9rem' }}>Reporti</span>
      </div>
      <p style={{ color: 'var(--text3)', fontSize: '0.75rem' }}>
        Impulsado por Claude · Anthropic · © 2026 Reporti
      </p>
    </footer>
  )
}

/* ── LANDING PAGE ─────────────────────────────────────────── */
export default function Landing() {
  const navigate = useNavigate()

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <LandingNav />

      {/* HERO */}
      <section style={{ padding: '5rem 1.5rem 4rem' }}>
        <div className="max-w-5xl mx-auto" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '3rem', alignItems: 'center' }}>
          {/* Left */}
          <div>
            {/* Badge */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '0.3rem 0.75rem', borderRadius: 999,
              border: '1px solid var(--border-strong)',
              background: 'var(--grad-soft)',
              marginBottom: '1.5rem',
            }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--grad)', display: 'inline-block' }} />
              <span style={{ fontSize: '0.75rem', color: 'var(--text2)', fontWeight: 500 }}>
                Impulsado por Claude · Anthropic
              </span>
            </div>

            <h1 style={{
              fontWeight: 800,
              fontSize: '2.5rem',
              lineHeight: 1.15,
              marginBottom: '1rem',
              color: 'var(--text)',
            }}>
              Transformá tus datos en{' '}
              <span className="grad-text">decisiones en segundos</span>
            </h1>

            <p style={{ color: 'var(--text2)', fontSize: '0.95rem', lineHeight: 1.65, marginBottom: '2rem' }}>
              Subí tu Excel y obtené un reporte profesional con KPIs, tendencias y recomendaciones
              generadas por inteligencia artificial.
            </p>

            {/* CTAs */}
            <div className="flex gap-3 flex-wrap" style={{ marginBottom: '2.5rem' }}>
              <button className="btn btn-grad" style={{ padding: '0.6rem 1.4rem', fontSize: '0.9rem' }}
                onClick={() => navigate('/login')}>
                Analizar mi archivo
              </button>
              <a href="#como-funciona" className="btn btn-outline" style={{ padding: '0.6rem 1.4rem', fontSize: '0.9rem' }}>
                Ver cómo funciona
              </a>
            </div>

            {/* Stats */}
            <div className="flex gap-5 flex-wrap">
              {[
                { num: '30 seg', label: 'por reporte' },
                { num: 'PDF + PPTX', label: 'formatos' },
                { num: '100%', label: 'privado' },
              ].map(s => (
                <div key={s.num}>
                  <p className="grad-text" style={{ fontWeight: 800, fontSize: '1.1rem', lineHeight: 1 }}>{s.num}</p>
                  <p style={{ color: 'var(--text3)', fontSize: '0.72rem', marginTop: 2 }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Preview */}
          <div>
            <ReportPreview />
          </div>
        </div>
      </section>

      <HowItWorks />

      {/* Claude Strip */}
      <div className="max-w-5xl mx-auto px-6" style={{ marginBottom: '1rem' }}>
        <ClaudeStrip />
      </div>

      <Features />
      <UploadSection />

      {/* FAQ */}
      <section id="faq" style={{ padding: '5rem 0' }}>
        <div className="max-w-2xl mx-auto px-6">
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <p className="section-label mb-2">FAQ</p>
            <h2 style={{ color: 'var(--text)', fontWeight: 800, fontSize: '1.75rem' }}>Preguntas frecuentes</h2>
          </div>
          <FAQ />
        </div>
      </section>

      <Pricing />
      <Footer />
    </div>
  )
}

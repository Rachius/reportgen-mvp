import { useState } from 'react'
import PageLayout from '../components/PageLayout'

const STEPS = [
  {
    num: '1',
    title: 'Subí tu archivo',
    desc: 'Arrastrá o seleccioná tu CSV o Excel. Acepta archivos de hasta 10 MB.',
  },
  {
    num: '2',
    title: 'Elegí el análisis',
    desc: 'Seleccioná el tipo de reporte (Ventas, Finanzas, Operaciones) y el formato de salida.',
  },
  {
    num: '3',
    title: 'Descargá el reporte',
    desc: 'En segundos obtenés un PDF o PPTX profesional con KPIs, tendencias y recomendaciones.',
  },
]

const FAQ = [
  {
    q: '¿Qué formatos de archivo acepta Reporti?',
    a: 'Reporti acepta archivos CSV (.csv) y Excel (.xlsx, .xls) de hasta 10 MB. Las columnas se mapean automáticamente según tu configuración de perfil.',
  },
  {
    q: '¿Cómo se personaliza el análisis?',
    a: 'Completá tu Perfil de empresa con el rubro, moneda, descripción del negocio y el mapeo de columnas. Cuanta más información le das a Reporti, más preciso y relevante es el análisis.',
  },
  {
    q: '¿Cuántos reportes puedo generar?',
    a: 'Con el plan Free tenés 3 reportes totales. Con el plan Starter ($ 17.500 ARS/mes) tenés 10 reportes mensuales con renovación automática. El plan Pro (próximamente) ofrecerá 30 reportes mensuales.',
  },
  {
    q: '¿Qué son las consultas al analista?',
    a: 'Las consultas al analista son preguntas directas que podés enviarle a nuestro equipo sobre tus reportes, datos o estrategia. Los planes Starter incluyen 3 consultas mensuales. El equipo responde en 24-48 horas hábiles.',
  },
  {
    q: '¿Mis datos son privados?',
    a: 'Sí. Tus archivos se procesan de forma segura y no se almacenan permanentemente en nuestros servidores. El análisis se realiza con Claude (Anthropic) bajo estrictas políticas de privacidad de datos.',
  },
]

export default function AboutPage() {
  const [openFaq, setOpenFaq] = useState(null)

  return (
    <PageLayout>
      <div style={{ maxWidth: 700, margin: '0 auto' }}>

        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{
            width: 56,
            height: 56,
            borderRadius: 'var(--radius-card)',
            background: 'var(--blue-light)',
            border: '1px solid var(--blue)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.75rem',
            margin: '0 auto 1.25rem',
          }}>
            📊
          </div>
          <h1 style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '1.5rem', marginBottom: '0.75rem' }}>
            Bienvenido a Reporti
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, maxWidth: 480, margin: '0 auto' }}>
            Reporti transforma tus datos de negocio en reportes profesionales con análisis, KPIs,
            tendencias y recomendaciones generadas por inteligencia artificial en segundos.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 gap-4 mb-10" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
          {STEPS.map(step => (
            <div key={step.num} className="card" style={{ textAlign: 'center' }}>
              <div style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: 'var(--orange-light)',
                border: '1.5px solid var(--orange)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '1rem',
                color: 'var(--orange-dark)',
                margin: '0 auto 0.75rem',
              }}>
                {step.num}
              </div>
              <p style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.875rem', marginBottom: 4 }}>
                {step.title}
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', lineHeight: 1.5 }}>
                {step.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Divider */}
        <hr className="divider" style={{ marginBottom: '2rem' }} />

        {/* FAQ */}
        <div>
          <h2 style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '1.1rem', marginBottom: '1rem' }}>
            Preguntas frecuentes
          </h2>
          <div className="space-y-2">
            {FAQ.map((item, i) => (
              <div key={i} style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-card)',
                overflow: 'hidden',
              }}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '0.875rem 1rem',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.75rem',
                  }}
                >
                  <span style={{ color: 'var(--text-primary)', fontWeight: 500, fontSize: '0.875rem' }}>
                    {item.q}
                  </span>
                  <span style={{
                    color: 'var(--text-muted)',
                    fontSize: '1rem',
                    transition: 'transform 0.2s',
                    transform: openFaq === i ? 'rotate(180deg)' : 'rotate(0deg)',
                    flexShrink: 0,
                  }}>
                    ▾
                  </span>
                </button>
                {openFaq === i && (
                  <div style={{
                    padding: '0 1rem 0.875rem',
                    borderTop: '1px solid var(--border)',
                    paddingTop: '0.75rem',
                  }}>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', lineHeight: 1.6 }}>
                      {item.a}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageLayout>
  )
}

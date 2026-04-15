import PageLayout from '../components/PageLayout'
import FAQ from '../components/FAQ'
import ClaudeStrip from '../components/ClaudeStrip'

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

export default function AboutPage() {
  return (
    <PageLayout>
      <div style={{ maxWidth: 700, margin: '0 auto' }}>

        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ margin: '0 auto 1.25rem', width: 64, height: 64 }}>
            <img src="/logo-reporti.png" alt="Reporti" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <h1 className="grad-text" style={{ fontWeight: 800, fontSize: '1.75rem', marginBottom: '0.75rem' }}>
            Bienvenido a Reporti
          </h1>
          <p style={{ color: 'var(--text2)', fontSize: '0.95rem', lineHeight: 1.65, maxWidth: 480, margin: '0 auto' }}>
            Reporti transforma tus datos de negocio en reportes profesionales con análisis,
            KPIs, tendencias y recomendaciones generadas por inteligencia artificial en segundos.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 gap-4 mb-8" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
          {STEPS.map(step => (
            <div
              key={step.num}
              className="card"
              style={{ textAlign: 'center', transition: 'transform 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                background: 'var(--tab-active-bg)',
                border: '1.5px solid var(--tab-active-border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: '1rem', color: 'var(--tab-active-text)',
                margin: '0 auto 0.875rem',
              }}>
                {step.num}
              </div>
              <p style={{ color: 'var(--text)', fontWeight: 600, fontSize: '0.9rem', marginBottom: 4 }}>
                {step.title}
              </p>
              <p style={{ color: 'var(--text2)', fontSize: '0.8rem', lineHeight: 1.5 }}>
                {step.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Claude strip */}
        <div style={{ marginBottom: '3rem' }}>
          <ClaudeStrip />
        </div>

        {/* FAQ */}
        <div>
          <h2 style={{ color: 'var(--text)', fontWeight: 700, fontSize: '1.2rem', marginBottom: '1rem' }}>
            Preguntas frecuentes
          </h2>
          <FAQ />
        </div>

      </div>
    </PageLayout>
  )
}

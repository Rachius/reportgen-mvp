import { useState } from 'react'

const DEFAULT_FAQS = [
  {
    q: '¿Qué formatos de archivo acepta Reporti?',
    a: 'Reporti acepta archivos CSV (.csv) y Excel (.xlsx, .xls) de hasta 10 MB. Las columnas se mapean automáticamente según tu configuración de perfil.',
  },
  {
    q: '¿Cómo personaliza el análisis a mi negocio?',
    a: 'Completá tu Perfil de empresa con el rubro, moneda, descripción del negocio y el mapeo de columnas. Cuanta más información le das a Reporti, más preciso y relevante es el análisis.',
  },
  {
    q: '¿Mis datos son seguros y privados?',
    a: 'Sí. Tus archivos se procesan de forma segura y no se almacenan permanentemente en nuestros servidores. El análisis se realiza con Claude (Anthropic) bajo estrictas políticas de privacidad de datos.',
  },
  {
    q: '¿Qué incluyen los 3 reportes gratuitos?',
    a: 'Con el plan Free tenés 3 reportes totales en formato PDF. No requiere tarjeta de crédito y podés empezar en segundos.',
  },
  {
    q: '¿Qué son las consultas al analista?',
    a: 'Las consultas al analista son preguntas directas que podés enviarle a nuestro equipo sobre tus reportes, datos o estrategia. El plan Starter incluye 3 consultas mensuales. El equipo responde en 24-48 horas hábiles.',
  },
]

export default function FAQ({ items = DEFAULT_FAQS }) {
  const [open, setOpen] = useState(null)

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div
          key={i}
          style={{
            background: 'var(--card)',
            border: `1px solid ${open === i ? 'rgba(78,199,245,0.3)' : 'rgba(0,0,0,0.07)'}`,
            borderRadius: 12,
            overflow: 'hidden',
            boxShadow: open === i ? '0 4px 20px rgba(78,199,245,0.08)' : '0 1px 4px rgba(0,0,0,0.03)',
            transition: 'border-color 0.2s, box-shadow 0.2s',
          }}
        >
          <button
            onClick={() => setOpen(open === i ? null : i)}
            style={{
              width: '100%', textAlign: 'left',
              padding: '1rem 1.25rem',
              background: 'none', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem',
            }}
            onMouseEnter={e => {
              if (open !== i) e.currentTarget.parentElement.style.borderColor = 'rgba(78,199,245,0.2)'
            }}
            onMouseLeave={e => {
              if (open !== i) e.currentTarget.parentElement.style.borderColor = 'rgba(0,0,0,0.07)'
            }}
          >
            <span style={{ color: 'var(--text)', fontWeight: 600, fontSize: '0.875rem', lineHeight: 1.4 }}>
              {item.q}
            </span>
            <span style={{
              width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
              background: open === i ? 'rgba(78,199,245,0.12)' : 'var(--bg3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: open === i ? '#1A9FD4' : 'var(--text3)',
              fontSize: '0.8rem', fontWeight: 700,
              transform: open === i ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.25s ease, background 0.2s, color 0.2s',
            }}>
              ▾
            </span>
          </button>

          {open === i && (
            <div style={{
              padding: '0 1.25rem 1rem',
              borderTop: '1px solid rgba(0,0,0,0.05)',
              paddingTop: '0.875rem',
            }}>
              <p style={{ color: 'var(--text2)', fontSize: '0.83rem', lineHeight: 1.65 }}>
                {item.a}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

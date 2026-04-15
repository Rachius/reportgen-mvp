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
    q: '¿Qué incluye el plan gratuito?',
    a: 'Con el plan Free tenés 3 reportes totales, solo en formato PDF. No requiere tarjeta de crédito.',
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
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-card)',
            overflow: 'hidden',
          }}
        >
          <button
            onClick={() => setOpen(open === i ? null : i)}
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
            <span style={{ color: 'var(--text)', fontWeight: 500, fontSize: '0.875rem' }}>
              {item.q}
            </span>
            <span style={{
              color: 'var(--text3)',
              fontSize: '1rem',
              transition: 'transform 0.2s',
              transform: open === i ? 'rotate(180deg)' : 'rotate(0deg)',
              flexShrink: 0,
            }}>
              ▾
            </span>
          </button>
          {open === i && (
            <div style={{
              padding: '0 1rem 0.875rem',
              borderTop: '1px solid var(--border)',
              paddingTop: '0.75rem',
            }}>
              <p style={{ color: 'var(--text2)', fontSize: '0.8rem', lineHeight: 1.6 }}>
                {item.a}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

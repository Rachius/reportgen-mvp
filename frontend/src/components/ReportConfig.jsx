const TYPES = [
  { value: 'ventas', label: 'Ventas / Comercial' },
  { value: 'finanzas', label: 'Finanzas' },
  { value: 'operaciones', label: 'Operaciones' },
]

const FORMATS = ['pdf', 'pptx']

export default function ReportConfig({ config, onChange }) {
  const toggleFormat = (fmt) => {
    const current = config.formats
    const updated = current.includes(fmt)
      ? current.filter(f => f !== fmt)
      : [...current, fmt]
    if (updated.length === 0) return
    onChange({ ...config, formats: updated })
  }

  return (
    <div className="space-y-4">
      {/* Tipo de reporte */}
      <div>
        <p className="section-label mb-2">Tipo de reporte</p>
        <div className="flex gap-2">
          {TYPES.map(t => {
            const active = config.type === t.value
            return (
              <button
                key={t.value}
                onClick={() => onChange({ ...config, type: t.value })}
                style={{
                  flex: 1,
                  padding: '0.4rem 0.5rem',
                  borderRadius: 'var(--radius-btn)',
                  border: active
                    ? '1px solid var(--blue)'
                    : '1px solid var(--border-strong)',
                  background: active ? 'var(--blue-light)' : 'var(--surface)',
                  color: active ? 'var(--blue-darker)' : 'var(--text-secondary)',
                  fontWeight: active ? 500 : 400,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  transition: 'var(--transition-fast)',
                }}
                onMouseEnter={e => {
                  if (!active) {
                    e.currentTarget.style.background = 'var(--orange-light)'
                    e.currentTarget.style.color = 'var(--orange-dark)'
                    e.currentTarget.style.borderColor = 'var(--orange)'
                  }
                }}
                onMouseLeave={e => {
                  if (!active) {
                    e.currentTarget.style.background = 'var(--surface)'
                    e.currentTarget.style.color = 'var(--text-secondary)'
                    e.currentTarget.style.borderColor = 'var(--border-strong)'
                  }
                }}
              >
                {t.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Formato de salida */}
      <div>
        <p className="section-label mb-2">Formato de salida</p>
        <div className="flex gap-2">
          {FORMATS.map(fmt => {
            const active = config.formats.includes(fmt)
            return (
              <button
                key={fmt}
                onClick={() => toggleFormat(fmt)}
                style={{
                  padding: '0.4rem 1rem',
                  borderRadius: 'var(--radius-btn)',
                  border: active
                    ? '1.5px solid var(--orange)'
                    : '1px solid var(--border-strong)',
                  background: active ? 'rgba(254,120,8,0.10)' : 'var(--surface)',
                  color: active ? 'var(--orange-dark)' : 'var(--text-secondary)',
                  fontWeight: active ? 600 : 400,
                  fontSize: '0.8rem',
                  fontFamily: 'monospace',
                  cursor: 'pointer',
                  transition: 'var(--transition-fast)',
                }}
                onMouseEnter={e => {
                  if (!active) {
                    e.currentTarget.style.background = 'var(--orange-light)'
                    e.currentTarget.style.color = 'var(--orange-dark)'
                    e.currentTarget.style.borderColor = 'var(--orange)'
                  } else {
                    e.currentTarget.style.background = 'var(--orange)'
                    e.currentTarget.style.color = '#fff'
                  }
                }}
                onMouseLeave={e => {
                  if (!active) {
                    e.currentTarget.style.background = 'var(--surface)'
                    e.currentTarget.style.color = 'var(--text-secondary)'
                    e.currentTarget.style.borderColor = 'var(--border-strong)'
                  } else {
                    e.currentTarget.style.background = 'rgba(254,120,8,0.10)'
                    e.currentTarget.style.color = 'var(--orange-dark)'
                  }
                }}
              >
                {fmt.toUpperCase()}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

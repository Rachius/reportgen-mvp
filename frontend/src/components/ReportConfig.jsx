import { useTheme } from '../context/ThemeContext'

const TYPES = [
  {
    value: 'ventas',
    label: 'Ventas / Comercial',
    helper: 'Facturas, pedidos, clientes, vendedores',
    icon: '▦',
    color: '#4EC7F5',
  },
  {
    value: 'finanzas',
    label: 'Finanzas',
    helper: 'Ingresos, gastos, P&L, flujo de caja',
    icon: '⌁',
    color: '#FE7808',
  },
  {
    value: 'operaciones',
    label: 'Operaciones',
    helper: 'Stock, producción, logística, KPIs operativos',
    icon: '▣',
    color: '#22C55E',
  },
]

const FORMATS = [
  { value: 'pdf', label: 'PDF', icon: '▯' },
  { value: 'pptx', label: 'PPTX', icon: '▣' },
]

export default function ReportConfig({ config, onChange }) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const toggleFormat = (fmt) => {
    const current = config.formats
    const updated = current.includes(fmt)
      ? current.filter((f) => f !== fmt)
      : [...current, fmt]

    if (updated.length === 0) return
    onChange({ ...config, formats: updated })
  }

  return (
    <div className="space-y-7">
      <section>
        <div className="mb-3 flex items-center gap-2">
          <span
            className="flex h-6 w-6 items-center justify-center rounded-full text-[0.7rem] font-bold"
            style={{
              background: 'rgba(254,120,8,0.10)',
              color: '#D45F00',
              border: '1px solid rgba(254,120,8,0.25)',
            }}
          >
            2
          </span>
          <p
            style={{
              fontSize: '0.7rem',
              fontWeight: 800,
              color: 'var(--text3)',
              textTransform: 'uppercase',
              letterSpacing: '0.09em',
            }}
          >
            ¿Qué querés analizar?
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {TYPES.map((t) => {
            const active = config.type === t.value

            return (
              <button
                key={t.value}
                onClick={() => onChange({ ...config, type: t.value })}
                className={[
                  'group rounded-2xl p-4 text-left transition-all duration-200',
                  active ? 'scale-[1.01] shadow-lg' : 'shadow-sm hover:-translate-y-0.5 hover:shadow-lg',
                ].join(' ')}
                style={{
                  background: active
                    ? isDark
                      ? `linear-gradient(135deg, ${t.color}22, rgba(255,255,255,0.06))`
                      : `linear-gradient(135deg, ${t.color}18, rgba(255,255,255,0.96))`
                    : isDark ? '#1E2D3D' : 'rgba(255,255,255,0.78)',
                  border: active
                    ? `1px solid ${t.color}80`
                    : `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)'}`,
                  boxShadow: active ? `0 14px 35px ${t.color}24` : undefined,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                <div
                  className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold"
                  style={{
                    background: `${t.color}18`,
                    color: t.color,
                    border: `1px solid ${t.color}30`,
                  }}
                >
                  {t.icon}
                </div>

                <p
                  style={{
                    fontSize: '0.86rem',
                    fontWeight: 800,
                    color: active ? 'var(--text)' : 'var(--text)',
                    lineHeight: 1.25,
                  }}
                >
                  {t.label}
                </p>

                <p
                  style={{
                    fontSize: '0.68rem',
                    marginTop: 6,
                    lineHeight: 1.45,
                    color: active ? 'var(--text2)' : 'var(--text3)',
                  }}
                >
                  {t.helper}
                </p>
              </button>
            )
          })}
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center gap-2">
          <span
            className="flex h-6 w-6 items-center justify-center rounded-full text-[0.7rem] font-bold"
            style={{
              background: 'rgba(254,120,8,0.10)',
              color: '#D45F00',
              border: '1px solid rgba(254,120,8,0.25)',
            }}
          >
            3
          </span>
          <p
            style={{
              fontSize: '0.7rem',
              fontWeight: 800,
              color: 'var(--text3)',
              textTransform: 'uppercase',
              letterSpacing: '0.09em',
            }}
          >
            Formato de salida
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {FORMATS.map((fmt) => {
            const active = config.formats.includes(fmt.value)

            return (
              <button
                key={fmt.value}
                onClick={() => toggleFormat(fmt.value)}
                className="rounded-2xl px-5 py-3 text-center transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                style={{
                  background: active
                    ? isDark
                      ? 'linear-gradient(135deg, rgba(254,120,8,0.18), rgba(255,255,255,0.06))'
                      : 'linear-gradient(135deg, rgba(254,120,8,0.12), rgba(255,255,255,0.95))'
                    : isDark ? '#1E2D3D' : 'rgba(255,255,255,0.72)',
                  border: active
                    ? '1px solid rgba(254,120,8,0.55)'
                    : `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)'}`,
                  color: active
                    ? isDark ? '#FFA040' : '#D45F00'
                    : 'var(--text2)',
                  fontWeight: 800,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                <span style={{ marginRight: 8 }}>{fmt.icon}</span>
                {fmt.label}
              </button>
            )
          })}
        </div>
      </section>
    </div>
  )
}
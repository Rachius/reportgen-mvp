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
      <div>
        <p className="text-xs text-gray-500 mb-2">tipo de reporte</p>
        <div className="flex gap-2">
          {TYPES.map(t => (
            <button
              key={t.value}
              onClick={() => onChange({ ...config, type: t.value })}
              className={`flex-1 py-2 text-xs rounded-lg border transition
                ${config.type === t.value
                  ? 'border-teal-500 bg-teal-50 text-teal-800 font-medium'
                  : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs text-gray-500 mb-2">formato de salida</p>
        <div className="flex gap-2">
          {FORMATS.map(fmt => (
            <button
              key={fmt}
              onClick={() => toggleFormat(fmt)}
              className={`px-4 py-2 text-xs rounded-lg border transition
                ${config.formats.includes(fmt)
                  ? 'border-purple-400 bg-purple-50 text-purple-800 font-medium'
                  : 'border-gray-200 text-gray-400 hover:border-gray-300'}`}
            >
              {fmt.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
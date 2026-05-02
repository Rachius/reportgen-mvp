import { useRef, useState } from 'react'
import { validateFile } from '../lib/fileValidator'
import { useTheme } from '../context/ThemeContext'

function formatBytes(bytes) {
  if (!bytes) return ''
  const kb = bytes / 1024
  if (kb < 1024) return `${Math.round(kb)} KB`
  return `${(kb / 1024).toFixed(1)} MB`
}

export default function FileDropzone({ file, onFile, onClear }) {
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)
  const [validationError, setValidationError] = useState(null)
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const handleFile = (f) => {
    if (!f) return
    const { ok, error } = validateFile(f)
    if (!ok) {
      setValidationError(error)
      return
    }
    setValidationError(null)
    onFile(f)
  }

  const onDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0])
  }

  return (
    <div>
      <div
        onClick={() => !file && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={[
          'relative overflow-hidden rounded-3xl px-6 py-8 text-center transition-all duration-300',
          file ? 'cursor-default' : 'cursor-pointer',
          dragging
            ? 'scale-[1.01] shadow-2xl ring-2 ring-sky-300'
            : 'shadow-lg hover:-translate-y-0.5 hover:shadow-2xl',
        ].join(' ')}
        style={{
          background: isDark
            ? 'radial-gradient(circle at 50% 0%, rgba(78,199,245,0.07), transparent 40%), #1A2535'
            : 'radial-gradient(circle at 50% 0%, rgba(78,199,245,0.16), transparent 40%), linear-gradient(135deg, rgba(78,199,245,0.09), rgba(255,255,255,0.96) 45%, rgba(254,120,8,0.07))',
          border: isDark ? '1px solid rgba(78,199,245,0.12)' : '1px solid rgba(78,199,245,0.18)',
        }}
      >
        <div
          className="pointer-events-none absolute inset-x-8 top-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(78,199,245,0.8), rgba(254,120,8,0.7), transparent)' }}
        />

        {!file ? (
          <div className="flex flex-col items-center">
            <div
              className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl shadow-md"
              style={{
                background: 'linear-gradient(135deg, rgba(78,199,245,0.18), rgba(254,120,8,0.14))',
                color: 'var(--blue-dark)',
              }}
            >
              <span style={{ fontSize: '1.5rem' }}>↑</span>
            </div>

            <p style={{ color: 'var(--text)', fontWeight: 800, fontSize: '1rem' }}>
              Subí tu archivo y generá tu análisis
            </p>

            <p style={{ color: 'var(--text3)', fontSize: '0.8rem', marginTop: 6 }}>
              CSV o Excel · hasta 10MB · sin configuración previa
            </p>

            <button
              type="button"
              className="mt-5 rounded-xl px-5 py-2 text-sm font-bold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl"
              style={{ background: 'linear-gradient(135deg, #4EC7F5, #FE7808)' }}
            >
              Seleccionar archivo
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div
              className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl shadow-md"
              style={{
                background: 'linear-gradient(135deg, rgba(34,197,94,0.18), rgba(78,199,245,0.14))',
                color: '#059669',
              }}
            >
              <span style={{ fontSize: '1.4rem' }}>✓</span>
            </div>

            <p style={{ color: 'var(--blue-dark)', fontWeight: 800, fontSize: '1rem' }}>
              {file.name} cargado
            </p>

            <p style={{ color: 'var(--text3)', fontSize: '0.8rem', marginTop: 6 }}>
              {formatBytes(file.size)} · listo para analizar
            </p>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              {['.CSV', '.XLSX', '.XLS', 'hasta 10 MB'].map((chip) => (
                <span
                  key={chip}
                  className="rounded-full px-3 py-1 text-[0.65rem] font-semibold"
                  style={{
                    background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.78)',
                    color: 'var(--text3)',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
                  }}
                >
                  {chip}
                </span>
              ))}
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onFile(null)
                onClear()
              }}
              className="mt-5 text-xs font-semibold transition-colors"
              style={{ color: 'var(--text3)' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#DC2626')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text3)')}
            >
              Quitar archivo
            </button>
          </div>
        )}
      </div>

      {validationError && (
        <p style={{ color: '#DC2626', fontSize: '0.75rem', marginTop: 8 }}>
          {validationError}
        </p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept=".csv,.xlsx,.xls"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </div>
  )
}
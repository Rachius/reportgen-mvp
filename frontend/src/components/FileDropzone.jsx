import { useRef, useState } from 'react'
import { validateFile } from '../lib/fileValidator'

export default function FileDropzone({ file, onFile, onClear }) {
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)
  const [validationError, setValidationError] = useState(null)

  const handleFile = (f) => {
    const { ok, error } = validateFile(f)
    if (!ok) { setValidationError(error); return }
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
        onClick={() => !file && inputRef.current.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        style={{
          border: dragging
            ? '2px dashed var(--blue)'
            : '2px dashed var(--border-strong)',
          borderRadius: 'var(--radius-card)',
          padding: '2rem',
          textAlign: 'center',
          cursor: file ? 'default' : 'pointer',
          background: dragging ? 'var(--blue-light)' : 'var(--surface)',
          transition: 'var(--transition-fast)',
        }}
      >
        {!file ? (
          <div className="flex flex-col items-center gap-2">
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 'var(--radius-card)',
              background: 'var(--blue-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--blue-dark)',
              fontSize: '1.1rem',
            }}>
              📄
            </div>
            <p style={{ color: 'var(--text-primary)', fontWeight: 500, fontSize: '0.875rem' }}>
              Arrastrá tu archivo aquí
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
              CSV o Excel hasta 10 MB
            </p>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-3">
            <span style={{ fontSize: '1rem' }}>📊</span>
            <span style={{ color: 'var(--text-primary)', fontSize: '0.875rem', fontWeight: 500 }}>
              {file.name}
            </span>
            <button
              onClick={(e) => { e.stopPropagation(); onFile(null); onClear() }}
              style={{
                color: 'var(--text-muted)',
                fontSize: '0.75rem',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                transition: 'var(--transition-fast)',
              }}
              onMouseEnter={e => e.target.style.color = '#DC2626'}
              onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}
            >
              quitar
            </button>
          </div>
        )}
      </div>
      {validationError && (
        <p style={{ color: '#DC2626', fontSize: '0.75rem', marginTop: 4 }}>{validationError}</p>
      )}
      <input
        ref={inputRef}
        type="file"
        accept=".csv,.xlsx,.xls"
        className="hidden"
        onChange={(e) => handleFile(e.target.files[0])}
      />
    </div>
  )
}

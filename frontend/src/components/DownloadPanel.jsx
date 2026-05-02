export default function DownloadPanel({ phase, progress, label, urls, error, PHASES, onNew }) {
  return (
    <div className="card space-y-3">
      {phase !== PHASES.DONE && phase !== PHASES.ERROR && (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{label}</span>
            <span style={{ color: 'var(--blue-dark)', fontSize: '0.8rem', fontWeight: 600 }}>
              {progress}%
            </span>
          </div>
          <div className="progress-track">
            <div
              className="progress-fill-blue"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {phase === PHASES.DONE && (
        <div className="space-y-3">
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
            ¡Reporte generado!
          </p>
          <div className="flex gap-2">
            {urls.pdf && (
              <a
                href={`${import.meta.env.VITE_API_URL}${urls.pdf}`}
                download="reporte.pdf"
                className="btn btn-primary"
                style={{ flex: 1, textAlign: 'center' }}
              >
                Descargar PDF
              </a>
            )}
            {urls.pptx && (
              <a
                href={`${import.meta.env.VITE_API_URL}${urls.pptx}`}
                download="reporte.pptx"
                className="btn btn-outline"
                style={{ flex: 1, textAlign: 'center' }}
              >
                Descargar PPTX
              </a>
            )}
          </div>
          <button
            onClick={onNew}
            style={{
              width: '100%',
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: '0.75rem',
              cursor: 'pointer',
              padding: '0.4rem',
              transition: 'var(--transition-fast)',
            }}
            onMouseEnter={e => e.target.style.color = 'var(--text-secondary)'}
            onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}
          >
            generar nuevo reporte
          </button>
        </div>
      )}

      {phase === PHASES.ERROR && (
        <div className="space-y-3">
          <p style={{ color: '#DC2626', fontSize: '0.8rem' }}>{error}</p>
          <button
            onClick={onNew}
            style={{
              width: '100%',
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: '0.75rem',
              cursor: 'pointer',
              padding: '0.4rem',
            }}
          >
            intentar de nuevo
          </button>
        </div>
      )}
    </div>
  )
}

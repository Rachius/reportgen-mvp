export default function DownloadPanel({ phase, progress, label, urls, error, PHASES, onNew }) {
  return (
    <div className="border border-gray-200 rounded-xl p-4 space-y-3 bg-white">
      {phase !== PHASES.DONE && phase !== PHASES.ERROR && (
        <>
          <div className="flex justify-between text-xs text-gray-500">
            <span>{label}</span>
            <span>{progress}%</span>
          </div>
          <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-teal-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </>
      )}

      {phase === PHASES.DONE && (
        <>
          <p className="text-xs text-gray-500">Reporte generado</p>
          <div className="flex gap-2">
            {urls.pdf && (
              <a href={urls.pdf} target="_blank" rel="noreferrer"
                className="flex-1 py-2 text-center text-xs font-medium rounded-lg border
                  border-orange-200 bg-orange-50 text-orange-800 hover:bg-orange-100 transition">
                Descargar PDF
              </a>
            )}
            {urls.pptx && (
              <a href={urls.pptx} target="_blank" rel="noreferrer"
                className="flex-1 py-2 text-center text-xs font-medium rounded-lg border
                  border-purple-200 bg-purple-50 text-purple-800 hover:bg-purple-100 transition">
                Descargar PPTX
              </a>
            )}
          </div>
          <button onClick={onNew} className="w-full py-2 text-xs text-gray-400 hover:text-gray-600 transition">
            generar nuevo reporte
          </button>
        </>
      )}

      {phase === PHASES.ERROR && (
        <>
          <p className="text-xs text-red-500">{error}</p>
          <button onClick={onNew} className="w-full py-2 text-xs text-gray-400 hover:text-gray-600 transition">
            intentar de nuevo
          </button>
        </>
      )}
    </div>
  )
}
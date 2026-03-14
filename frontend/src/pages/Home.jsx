import FileDropzone from '../components/FileDropzone'
import ReportConfig from '../components/ReportConfig'
import DownloadPanel from '../components/DownloadPanel'
import { useReportGenerator } from '../hooks/useReportGenerator'
import { useState } from 'react'

export default function Home() {
  const [file, setFile] = useState(null)
  const [config, setConfig] = useState({ type: 'ventas', formats: ['pdf', 'pptx'] })
  const { phase, progress, label, urls, error, generate, reset, PHASES } = useReportGenerator()

  const handleGenerate = () => generate(file, config)

  const handleNewReport = () => {
    setFile(null)
    reset()
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-start justify-center pt-16 px-4">
      <div className="w-full max-w-xl space-y-6">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-teal-600" />
          <span className="font-medium text-gray-800">ReportGen</span>
        </div>

        <FileDropzone file={file} onFile={setFile} onClear={reset} />

        <ReportConfig config={config} onChange={setConfig} />

        {phase === PHASES.IDLE && (
          <button
            onClick={handleGenerate}
            disabled={!file}
            className="w-full py-2.5 rounded-lg bg-teal-600 text-white font-medium text-sm
              hover:bg-teal-700 transition disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            {file ? 'Generar reporte' : 'Seleccioná un archivo para continuar'}
          </button>
        )}

        {phase !== PHASES.IDLE && (
          <DownloadPanel
            phase={phase}
            progress={progress}
            label={label}
            urls={urls}
            error={error}
            PHASES={PHASES}
            onNew={handleNewReport}
          />
        )}
      </div>
    </div>
  )
}
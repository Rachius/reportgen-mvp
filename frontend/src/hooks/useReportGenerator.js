import { useState, useRef } from 'react'
import { generateReport, getReportStatus } from '../lib/reportApi'

const PHASES = {
  IDLE: 'idle',
  UPLOADING: 'uploading',
  PROCESSING: 'processing',
  DONE: 'done',
  ERROR: 'error',
}

export function useReportGenerator() {
  const [phase, setPhase] = useState(PHASES.IDLE)
  const [progress, setProgress] = useState(0)
  const [label, setLabel] = useState('')
  const [urls, setUrls] = useState({ pdf: null, pptx: null })
  const [error, setError] = useState(null)
  const pollRef = useRef(null)

  const reset = () => {
    clearInterval(pollRef.current)
    setPhase(PHASES.IDLE)
    setProgress(0)
    setLabel('')
    setUrls({ pdf: null, pptx: null })
    setError(null)
  }

  const generate = async (file, config) => {
    reset()
    try {
      setPhase(PHASES.UPLOADING)
      setLabel('Subiendo archivo...')
      setProgress(10)

      const { job_id } = await generateReport(file, config)

      setPhase(PHASES.PROCESSING)
      setLabel('Analizando con Claude...')
      setProgress(30)

      pollRef.current = setInterval(async () => {
        try {
          const status = await getReportStatus(job_id)
          setProgress(status.progress)
          setLabel(status.message)

          if (status.status === 'done') {
            clearInterval(pollRef.current)
            setUrls({ pdf: status.pdf_url, pptx: status.pptx_url })
            setPhase(PHASES.DONE)
          }
          if (status.status === 'error') {
            clearInterval(pollRef.current)
            setError(status.message)
            setPhase(PHASES.ERROR)
          }
        } catch {
          clearInterval(pollRef.current)
          setError('Error al consultar el estado del reporte.')
          setPhase(PHASES.ERROR)
        }
      }, 2000)

    } catch (err) {
      setError(err?.response?.data?.detail || 'Error al iniciar la generación.')
      setPhase(PHASES.ERROR)
    }
  }

  return { phase, progress, label, urls, error, generate, reset, PHASES }
}
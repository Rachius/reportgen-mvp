import { useState, useEffect } from 'react'
import PageLayout from '../components/PageLayout'
import FileDropzone from '../components/FileDropzone'
import ReportConfig from '../components/ReportConfig'
import DownloadPanel from '../components/DownloadPanel'
import { useReportGenerator } from '../hooks/useReportGenerator'
import { useAuth } from '../context/AuthContext'
import { getSubscription, getRecentReports } from '../lib/reportApi'
import { getUserConsultations } from '../lib/adminApi'

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Buenos días'
  if (h < 20) return 'Buenas tardes'
  return 'Buenas noches'
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

const PLAN_LABELS = { free: 'Free', starter: 'Starter', pro: 'Pro' }
const STATUS_LABELS = { done: 'Listo', error: 'Error', processing: 'Procesando', pending: 'Pendiente' }
const STATUS_COLORS = {
  done: { background: '#ECFDF5', color: '#065F46' },
  error: { background: '#FEF2F2', color: '#991B1B' },
  processing: { background: '#FFFBEB', color: '#92400E' },
  pending: { background: '#FFFBEB', color: '#92400E' },
}

export default function Home() {
  const { user } = useAuth()
  const [file, setFile] = useState(null)
  const [config, setConfig] = useState({ type: 'ventas', formats: ['pdf'] })
  const { phase, progress, label, urls, error, generate, reset, PHASES } = useReportGenerator()

  const [sub, setSub] = useState(null)
  const [recentReports, setRecentReports] = useState([])
  const [pendingConsultation, setPendingConsultation] = useState(null)
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    Promise.all([
      getSubscription().catch(() => null),
      getRecentReports(5).catch(() => []),
      getUserConsultations().catch(() => []),
    ]).then(([subData, reports, consultations]) => {
      setSub(subData)
      setRecentReports(reports || [])
      const pending = consultations?.find(c => c.status === 'pending')
      setPendingConsultation(pending || null)
    }).finally(() => setLoadingData(false))
  }, [])

  const handleGenerate = () => generate(file, config)
  const handleNewReport = () => { setFile(null); reset() }

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'usuario'
  const reportsPct = sub ? Math.min(100, Math.round((sub.reports_used / sub.reports_limit) * 100)) : 0
  const consultPct = sub?.consultations_limit
    ? Math.min(100, Math.round(((sub.consultations_used || 0) / sub.consultations_limit) * 100))
    : 0

  const renewalDate = sub?.current_period_end
    ? new Date(sub.current_period_end).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : null

  return (
    <PageLayout>
      {/* ── Saludo ──────────────────────────────────────────── */}
      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '1.25rem' }}>
            {getGreeting()}, {displayName}
          </h1>
          {sub && (
            <div className="flex items-center gap-2 mt-1">
              <span className="pill">{PLAN_LABELS[sub.plan] || 'Free'}</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                {sub.reports_used}/{sub.reports_limit} reportes usados
              </span>
            </div>
          )}
        </div>
        {renewalDate && (
          <span className="pill pill-orange" style={{ fontSize: '0.72rem' }}>
            Se renueva el {renewalDate}
          </span>
        )}
      </div>

      {/* ── 3 Cards ─────────────────────────────────────────── */}
      {!loadingData && (
        <div className="grid grid-cols-1 gap-4 mb-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
          {/* Último reporte */}
          <div className="card card-accent-blue">
            <p className="section-label mb-2">Último reporte</p>
            {recentReports[0] ? (
              <div className="space-y-1.5">
                <p style={{ color: 'var(--text-primary)', fontWeight: 500, fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {recentReports[0].filename}
                </p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>
                  {formatDate(recentReports[0].created_at)}
                </p>
                <div className="flex gap-1 flex-wrap mt-1">
                  <span className="pill">{recentReports[0].report_type}</span>
                  {(() => {
                    const fmts = Array.isArray(recentReports[0].formats)
                      ? recentReports[0].formats
                      : JSON.parse(recentReports[0].formats || '[]')
                    return fmts.map(f => (
                      <span key={f} className="pill" style={{ fontFamily: 'monospace', textTransform: 'uppercase' }}>{f}</span>
                    ))
                  })()}
                </div>
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Sin reportes aún</p>
            )}
          </div>

          {/* Reporte anterior */}
          <div className="card card-accent-blue">
            <p className="section-label mb-2">Reporte anterior</p>
            {recentReports[1] ? (
              <div className="space-y-1.5">
                <p style={{ color: 'var(--text-primary)', fontWeight: 500, fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {recentReports[1].filename}
                </p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>
                  {formatDate(recentReports[1].created_at)}
                </p>
                <div className="flex gap-1 flex-wrap mt-1">
                  <span className="pill">{recentReports[1].report_type}</span>
                  {(() => {
                    const fmts = Array.isArray(recentReports[1].formats)
                      ? recentReports[1].formats
                      : JSON.parse(recentReports[1].formats || '[]')
                    return fmts.map(f => (
                      <span key={f} className="pill" style={{ fontFamily: 'monospace', textTransform: 'uppercase' }}>{f}</span>
                    ))
                  })()}
                </div>
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                {recentReports[0] ? 'Solo un reporte hasta ahora' : 'Sin reportes aún'}
              </p>
            )}
          </div>

          {/* Consulta pendiente */}
          <div className="card card-accent-orange">
            <p className="section-label mb-2">Consulta pendiente</p>
            {pendingConsultation ? (
              <div className="space-y-1.5">
                <p style={{ color: 'var(--text-primary)', fontWeight: 500, fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {pendingConsultation.subject}
                </p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>
                  {formatDate(pendingConsultation.created_at)}
                </p>
                <span className="pill pill-amber">Esperando respuesta</span>
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Sin consultas pendientes</p>
            )}
          </div>
        </div>
      )}

      {/* ── Barras de uso ────────────────────────────────────── */}
      {sub && (
        <div className="card mb-6">
          <div className="flex flex-wrap gap-6">
            <div style={{ flex: 1, minWidth: 180 }}>
              <div className="flex justify-between mb-1">
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Reportes mensuales</span>
                <span style={{ color: 'var(--blue-dark)', fontSize: '0.8rem', fontWeight: 600 }}>
                  {sub.reports_used}/{sub.reports_limit}
                </span>
              </div>
              <div className="progress-track">
                <div className="progress-fill-blue" style={{ width: `${reportsPct}%` }} />
              </div>
            </div>
            {sub.consultations_limit > 0 && (
              <div style={{ flex: 1, minWidth: 180 }}>
                <div className="flex justify-between mb-1">
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Consultas al analista</span>
                  <span style={{ color: 'var(--orange-dark)', fontSize: '0.8rem', fontWeight: 600 }}>
                    {sub.consultations_used || 0}/{sub.consultations_limit}
                  </span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill-orange" style={{ width: `${consultPct}%` }} />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Generar reporte ──────────────────────────────────── */}
      <div className="card mb-6 space-y-4">
        <h2 style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.95rem' }}>
          Generar nuevo reporte
        </h2>

        <FileDropzone file={file} onFile={setFile} onClear={reset} />
        <ReportConfig config={config} onChange={setConfig} />

        {phase === PHASES.IDLE && (
          <button
            onClick={handleGenerate}
            disabled={!file}
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '0.6rem' }}
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

      {/* ── Reportes recientes ───────────────────────────────── */}
      {recentReports.length > 0 && (
        <div>
          <h2 style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.75rem' }}>
            Reportes recientes
          </h2>
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-card)',
            overflow: 'hidden',
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
              <thead>
                <tr style={{ background: 'var(--surface-2)' }}>
                  {['Archivo', 'Tipo', 'Fecha', 'Formatos', 'Estado'].map(h => (
                    <th key={h} style={{
                      padding: '0.6rem 1rem',
                      textAlign: 'left',
                      color: 'var(--text-muted)',
                      fontWeight: 600,
                      fontSize: '0.7rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentReports.map((r, i) => {
                  const fmts = Array.isArray(r.formats) ? r.formats : JSON.parse(r.formats || '[]')
                  const statusStyle = STATUS_COLORS[r.status] || STATUS_COLORS.pending
                  return (
                    <tr key={r.id || i} style={{ borderTop: '1px solid var(--border)' }}>
                      <td style={{ padding: '0.65rem 1rem', color: 'var(--text-primary)', fontWeight: 500, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        📊 {r.filename}
                      </td>
                      <td style={{ padding: '0.65rem 1rem', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
                        {r.report_type}
                      </td>
                      <td style={{ padding: '0.65rem 1rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                        {formatDate(r.created_at)}
                      </td>
                      <td style={{ padding: '0.65rem 1rem' }}>
                        <div className="flex gap-1">
                          {fmts.map(f => (
                            <span key={f} className="pill" style={{ fontFamily: 'monospace', textTransform: 'uppercase' }}>{f}</span>
                          ))}
                        </div>
                      </td>
                      <td style={{ padding: '0.65rem 1rem' }}>
                        <span style={{
                          ...statusStyle,
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: '0.15rem 0.6rem',
                          borderRadius: 999,
                          fontSize: '0.7rem',
                          fontWeight: 500,
                        }}>
                          {STATUS_LABELS[r.status] || r.status}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </PageLayout>
  )
}

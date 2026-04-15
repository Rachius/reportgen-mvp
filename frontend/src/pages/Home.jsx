import { useState, useEffect } from 'react'
import PageLayout from '../components/PageLayout'
import FileDropzone from '../components/FileDropzone'
import ReportConfig from '../components/ReportConfig'
import DownloadPanel from '../components/DownloadPanel'
import { useReportGenerator } from '../hooks/useReportGenerator'
import { useAuth } from '../context/AuthContext'
import { getSubscription, getRecentReports } from '../lib/reportApi'
import { getUserConsultations } from '../lib/adminApi'
import { useNavigate } from 'react-router-dom'

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
const STATUS_STYLES = {
  done:       { background: '#ECFDF5', color: '#065F46' },
  error:      { background: '#FEF2F2', color: '#991B1B' },
  processing: { background: '#FFFBEB', color: '#92400E' },
  pending:    { background: '#FFFBEB', color: '#92400E' },
}

export default function Home() {
  const { user } = useAuth()
  const navigate = useNavigate()
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
  const reportsPct   = sub ? Math.min(100, Math.round((sub.reports_used / sub.reports_limit) * 100)) : 0
  const consultPct   = sub?.consultations_limit
    ? Math.min(100, Math.round(((sub.consultations_used || 0) / sub.consultations_limit) * 100))
    : 0

  const renewalDate = sub?.current_period_end
    ? new Date(sub.current_period_end).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : null

  const nearLimit = sub && sub.reports_used >= sub.reports_limit - 2
  const reportsLeft = sub ? Math.max(0, sub.reports_limit - sub.reports_used) : 0

  return (
    <PageLayout>
      {/* ── Header ────────────────────────────────────────────── */}
      <div className="flex items-start justify-between mb-5 flex-wrap gap-3">
        <div>
          <h1 className="grad-text" style={{ fontWeight: 700, fontSize: '1.2rem' }}>
            {getGreeting()}, {displayName}
          </h1>
          {sub && (
            <p style={{ color: 'var(--text2)', fontSize: '0.78rem', marginTop: 3 }}>
              Plan {PLAN_LABELS[sub.plan] || 'Free'} · {sub.reports_used} de {sub.reports_limit} reportes usados este mes
            </p>
          )}
        </div>
        {renewalDate && (
          <span className="pill pill-orange" style={{ fontSize: '0.72rem' }}>
            Se renueva el {renewalDate}
          </span>
        )}
      </div>

      {/* ── Warning bar ───────────────────────────────────────── */}
      {nearLimit && (
        <div style={{
          background: '#FFFBEB',
          border: '1px solid #FCD34D',
          borderRadius: 'var(--radius-card)',
          padding: '0.65rem 1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          marginBottom: '1.25rem',
        }}>
          <span style={{ fontSize: '0.9rem' }}>!</span>
          <p style={{ color: '#92400E', fontSize: '0.8rem' }}>
            Te {reportsLeft === 1 ? 'queda' : 'quedan'} {reportsLeft} reporte{reportsLeft !== 1 ? 's' : ''} este mes.{' '}
            <button
              onClick={() => navigate('/subscription')}
              style={{ color: '#B45309', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
            >
              Actualizá tu plan
            </button>
          </p>
        </div>
      )}

      {/* ── 3 Cards ───────────────────────────────────────────── */}
      {!loadingData && (
        <div className="grid grid-cols-1 gap-4 mb-5" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          {/* Último reporte */}
          <div className="card card-accent-blue" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <p className="section-label">Último reporte</p>
            {recentReports[0] ? (
              <>
                <p style={{ color: 'var(--text)', fontWeight: 500, fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {recentReports[0].filename}
                </p>
                <p style={{ color: 'var(--text3)', fontSize: '0.72rem' }}>{formatDate(recentReports[0].created_at)}</p>
                <div className="flex gap-1 flex-wrap">
                  <span className="pill">{recentReports[0].report_type}</span>
                  {(Array.isArray(recentReports[0].formats)
                    ? recentReports[0].formats
                    : JSON.parse(recentReports[0].formats || '[]')
                  ).map(f => (
                    <span key={f} className="pill" style={{ fontFamily: 'monospace', textTransform: 'uppercase' }}>{f}</span>
                  ))}
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '0.75rem 0' }}>
                <p style={{ fontSize: '1.5rem', marginBottom: 6 }}>📄</p>
                <p style={{ color: 'var(--text)', fontWeight: 500, fontSize: '0.8rem', marginBottom: 4 }}>Sin reportes todavía</p>
                <p style={{ color: 'var(--text3)', fontSize: '0.72rem', marginBottom: 8 }}>
                  Subí tu primer archivo para generar un análisis profesional
                </p>
                <button
                  onClick={() => document.getElementById('upload-section')?.scrollIntoView({ behavior: 'smooth' })}
                  style={{ color: 'var(--blue-dark)', fontSize: '0.78rem', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
                >
                  Generar mi primer reporte
                </button>
              </div>
            )}
          </div>

          {/* Reporte anterior */}
          <div className="card card-accent-blue" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <p className="section-label">Reporte anterior</p>
            {recentReports[1] ? (
              <>
                <p style={{ color: 'var(--text)', fontWeight: 500, fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {recentReports[1].filename}
                </p>
                <p style={{ color: 'var(--text3)', fontSize: '0.72rem' }}>{formatDate(recentReports[1].created_at)}</p>
                <div className="flex gap-1 flex-wrap">
                  <span className="pill">{recentReports[1].report_type}</span>
                  {(Array.isArray(recentReports[1].formats)
                    ? recentReports[1].formats
                    : JSON.parse(recentReports[1].formats || '[]')
                  ).map(f => (
                    <span key={f} className="pill" style={{ fontFamily: 'monospace', textTransform: 'uppercase' }}>{f}</span>
                  ))}
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '0.75rem 0' }}>
                <p style={{ color: 'var(--text3)', fontSize: '0.8rem' }}>
                  {recentReports[0] ? 'Todavía no hay más reportes' : 'Sin reportes todavía'}
                </p>
                <p style={{ color: 'var(--text3)', fontSize: '0.72rem', marginTop: 4 }}>
                  A partir del segundo reporte verás el historial aquí
                </p>
              </div>
            )}
          </div>

          {/* Consulta pendiente */}
          <div className="card card-accent-orange" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <p className="section-label">Consulta pendiente</p>
            {pendingConsultation ? (
              <>
                <p style={{ color: 'var(--text)', fontWeight: 500, fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {pendingConsultation.subject}
                </p>
                <p style={{ color: 'var(--text3)', fontSize: '0.72rem' }}>{formatDate(pendingConsultation.created_at)}</p>
                <span className="pill pill-amber">Pendiente de respuesta</span>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '0.75rem 0' }}>
                <p style={{ fontSize: '1.5rem', marginBottom: 6 }}>💬</p>
                <p style={{ color: 'var(--text)', fontWeight: 500, fontSize: '0.8rem', marginBottom: 4 }}>Sin consultas pendientes</p>
                <p style={{ color: 'var(--text3)', fontSize: '0.72rem', marginBottom: 8 }}>
                  Con el plan Starter podés enviar consultas al analista
                </p>
                <button
                  onClick={() => navigate('/subscription')}
                  style={{ color: 'var(--orange-dark)', fontSize: '0.78rem', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
                >
                  Ver plan Starter
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Barra de uso ──────────────────────────────────────── */}
      {sub && (
        <div className="card mb-5">
          <div className="flex flex-wrap gap-6">
            <div style={{ flex: 1, minWidth: 160 }}>
              <div className="flex justify-between mb-1">
                <span style={{ color: 'var(--text2)', fontSize: '0.78rem' }}>Reportes mensuales</span>
                <span style={{ color: nearLimit ? '#B45309' : 'var(--blue-dark)', fontSize: '0.78rem', fontWeight: nearLimit ? 700 : 600 }}>
                  {sub.reports_used}/{sub.reports_limit}
                </span>
              </div>
              <div className="progress-track">
                <div
                  className={nearLimit ? 'progress-fill-amber' : 'progress-fill-blue'}
                  style={{ width: `${reportsPct}%` }}
                />
              </div>
            </div>
            {sub.consultations_limit > 0 && (
              <div style={{ flex: 1, minWidth: 160 }}>
                <div className="flex justify-between mb-1">
                  <span style={{ color: 'var(--text2)', fontSize: '0.78rem' }}>Consultas al analista</span>
                  <span style={{ color: 'var(--orange-dark)', fontSize: '0.78rem', fontWeight: 600 }}>
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

      {/* ── Generar reporte ───────────────────────────────────── */}
      <div id="upload-section" className="card mb-5" style={{
        borderTop: '3px solid transparent',
        borderImage: 'var(--grad) 1',
        borderRadius: 'var(--radius-card)',
        padding: 0,
        overflow: 'hidden',
      }}>
        <div style={{ padding: '1.25rem' }}>
          <h2 style={{ color: 'var(--text)', fontWeight: 600, fontSize: '0.95rem', marginBottom: 3 }}>
            Generar nuevo reporte
          </h2>
          <p style={{ color: 'var(--text3)', fontSize: '0.78rem', marginBottom: '1rem' }}>
            Subí tu archivo de datos y obtené un análisis profesional en segundos.
          </p>

          <FileDropzone file={file} onFile={setFile} onClear={reset} />

          {/* Trust line */}
          <p style={{ color: 'var(--text3)', fontSize: '0.7rem', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981', display: 'inline-block', flexShrink: 0 }} />
            Tus archivos se procesan de forma segura y no se almacenan.
          </p>

          <div style={{ marginTop: '1rem' }}>
            <ReportConfig config={config} onChange={setConfig} />
          </div>

          {phase === PHASES.IDLE && (
            <button
              onClick={handleGenerate}
              disabled={!file}
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '0.6rem', marginTop: '1rem' }}
            >
              {file ? 'Generar reporte' : 'Seleccioná un archivo para continuar'}
            </button>
          )}

          {phase !== PHASES.IDLE && (
            <div style={{ marginTop: '1rem' }}>
              <DownloadPanel
                phase={phase}
                progress={progress}
                label={label}
                urls={urls}
                error={error}
                PHASES={PHASES}
                onNew={handleNewReport}
              />
            </div>
          )}
        </div>
      </div>

      {/* ── Reportes recientes ────────────────────────────────── */}
      {recentReports.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 style={{ color: 'var(--text)', fontWeight: 600, fontSize: '0.95rem' }}>
              Reportes recientes
            </h2>
          </div>
          <div style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-card)',
            overflow: 'hidden',
            boxShadow: 'var(--shadow)',
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg3)' }}>
                  {['Archivo', 'Tipo', 'Fecha', 'Formatos', 'Estado'].map(h => (
                    <th key={h} style={{
                      padding: '0.6rem 1rem', textAlign: 'left',
                      color: 'var(--text3)', fontWeight: 600,
                      fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.05em',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentReports.map((r, i) => {
                  const fmts = Array.isArray(r.formats) ? r.formats : JSON.parse(r.formats || '[]')
                  const stStyle = STATUS_STYLES[r.status] || STATUS_STYLES.pending
                  return (
                    <tr key={r.id || i} style={{ borderTop: '1px solid var(--border)' }}>
                      <td style={{ padding: '0.65rem 1rem', color: 'var(--text)', fontWeight: 500, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        📊 {r.filename}
                      </td>
                      <td style={{ padding: '0.65rem 1rem', color: 'var(--text2)', textTransform: 'capitalize' }}>
                        {r.report_type}
                      </td>
                      <td style={{ padding: '0.65rem 1rem', color: 'var(--text3)', whiteSpace: 'nowrap' }}>
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
                          ...stStyle,
                          display: 'inline-flex', alignItems: 'center',
                          padding: '0.15rem 0.6rem', borderRadius: 999,
                          fontSize: '0.7rem', fontWeight: 500,
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

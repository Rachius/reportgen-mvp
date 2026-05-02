import { useState, useEffect } from 'react'
import PageLayout from '../components/PageLayout'
import FileDropzone from '../components/FileDropzone'
import ReportConfig from '../components/ReportConfig'
import DownloadPanel from '../components/DownloadPanel'
import { useReportGenerator } from '../hooks/useReportGenerator'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { getSubscription, getRecentReports } from '../lib/reportApi'
import { getUserConsultations } from '../lib/adminApi'
import { useNavigate } from 'react-router-dom'

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('es-AR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  })
}

const PLAN_LABELS = { free: 'Free', starter: 'Starter', pro: 'Pro' }
const STATUS_LABELS = { done: 'Listo', error: 'Error', processing: 'Procesando', pending: 'Pendiente' }

export default function Home() {
  const { user } = useAuth()
  const { theme } = useTheme()
  const isDark = theme === 'dark'
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
      setPendingConsultation(consultations?.find(c => c.status === 'pending') || null)
    }).finally(() => setLoadingData(false))
  }, [])

  const handleGenerate = () => generate(file, config)
  const handleNewReport = () => { setFile(null); reset() }

  const reportsPct = sub ? Math.min(100, Math.round((sub.reports_used / sub.reports_limit) * 100)) : 0
  const consultPct = sub?.consultations_limit
    ? Math.min(100, Math.round(((sub.consultations_used || 0) / sub.consultations_limit) * 100))
    : 0
  const nearLimit = sub && sub.reports_used >= sub.reports_limit - 2
  const reportsLeft = sub ? Math.max(0, sub.reports_limit - sub.reports_used) : 0
  const renewalDate = sub?.current_period_end
    ? new Date(sub.current_period_end).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : null

  /* ── Theme-aware style helpers ─────────────────────────── */
  const getStatusStyle = (status) => ({
    done:       isDark ? { background: 'rgba(34,197,94,0.12)',  color: '#86EFAC' } : { background: 'rgba(34,197,94,0.10)',  color: '#15803D' },
    error:      isDark ? { background: 'rgba(239,68,68,0.12)',  color: '#FCA5A5' } : { background: 'rgba(239,68,68,0.10)',  color: '#991B1B' },
    processing: isDark ? { background: 'rgba(245,158,11,0.12)', color: '#FCD34D' } : { background: 'rgba(245,158,11,0.10)', color: '#92400E' },
    pending:    isDark ? { background: 'rgba(245,158,11,0.12)', color: '#FCD34D' } : { background: 'rgba(245,158,11,0.10)', color: '#92400E' },
  }[status] || (isDark ? { background: 'rgba(245,158,11,0.12)', color: '#FCD34D' } : { background: 'rgba(245,158,11,0.10)', color: '#92400E' }))

  const fmtPillStyle = isDark
    ? { background: 'rgba(78,199,245,0.15)', color: '#4EC7F5' }
    : { background: 'rgba(78,199,245,0.12)', color: '#0E6B8F' }

  const glassCard = {
    background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.72)',
    border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.05)',
    borderRadius: 12,
    backdropFilter: 'blur(12px)',
    boxShadow: isDark ? 'none' : '0 1px 4px rgba(0,0,0,0.03)',
  }

  const progressTrackStyle = {
    width: '100%', height: 4, borderRadius: 999,
    background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)',
    overflow: 'hidden',
  }

  const stepBadgeStyle = {
    background: isDark ? 'rgba(254,120,8,0.12)' : 'rgba(254,120,8,0.10)',
    color: isDark ? '#FFA040' : '#D45F00',
    border: `1px solid ${isDark ? 'rgba(254,120,8,0.2)' : 'rgba(254,120,8,0.25)'}`,
  }

  const dividerStyle = {
    background: isDark
      ? 'linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)'
      : 'linear-gradient(90deg, transparent, rgba(15,23,42,0.10), transparent)',
  }

  const workspaceCard = {
    background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.88)',
    border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(15,23,42,0.07)',
    backdropFilter: 'blur(18px)',
    boxShadow: isDark
      ? '0 20px 60px rgba(0,0,0,0.3), 0 4px 16px rgba(0,0,0,0.2)'
      : undefined,
  }

  const valuePillStyle = {
    background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.78)',
    border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.06)'}`,
    backdropFilter: 'blur(12px)',
  }

  const heroGradient = isDark
    ? 'radial-gradient(circle at 15% 10%, rgba(59,130,246,0.10), transparent 28%), radial-gradient(circle at 85% 15%, rgba(139,92,246,0.08), transparent 25%), #0F172A'
    : 'radial-gradient(circle at 15% 10%, rgba(78,199,245,0.12), transparent 28%), radial-gradient(circle at 85% 15%, rgba(254,120,8,0.10), transparent 25%), linear-gradient(180deg, #F5F8FA 0%, #FAFBFC 100%)'

  return (
    <PageLayout maxWidth="max-w-6xl">

      {/* ── Hero / workspace wrapper ─────────────────────── */}
      <div className="relative -mx-4 -mt-8 px-4 pb-10 pt-8" style={{ background: heroGradient }}>

        {/* Page header */}
        <section className="mx-auto mb-7 max-w-3xl text-center">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold"
            style={{ background: 'rgba(78,199,245,0.10)', color: 'var(--blue-dark)', border: '1px solid rgba(78,199,245,0.22)' }}>
            ✦ Workspace de análisis
          </p>
          <h1 style={{
            fontWeight: 900, fontSize: 'clamp(1.6rem, 3vw, 2.45rem)',
            color: 'var(--text)', lineHeight: 1.05, letterSpacing: '-0.04em',
          }}>
            Subí tu Excel y obtené decisiones en segundos
          </h1>
          {sub && (
            <p style={{ color: 'var(--text3)', fontSize: '0.82rem', marginTop: 10 }}>
              Plan {PLAN_LABELS[sub.plan] || 'Free'} · {sub.reports_used} de {sub.reports_limit} reportes usados este mes
              {renewalDate ? ` · Se renueva el ${renewalDate}` : ''}
            </p>
          )}
        </section>

        {/* Value props pill */}
        <div className="mx-auto mb-5 grid max-w-5xl grid-cols-1 gap-2 rounded-2xl px-4 py-3 shadow-sm md:grid-cols-3"
          style={valuePillStyle}>
          {['KPIs automáticos', 'Recomendaciones con IA', 'Listo en 30 segundos'].map(item => (
            <div key={item} className="flex items-center justify-center gap-2 text-sm font-semibold"
              style={{ color: 'var(--text2)' }}>
              <span style={{ color: '#22C55E' }}>✓</span>
              {item}
            </div>
          ))}
        </div>

        {/* Warning bar */}
        {nearLimit && (
          <div className="mx-auto mb-5 flex max-w-5xl items-center gap-3 rounded-2xl px-4 py-3"
            style={{ background: '#FFFBEB', border: '1px solid #FCD34D' }}>
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-black"
              style={{ background: '#FCD34D', color: '#78350F' }}>!</span>
            <p style={{ color: '#92400E', fontSize: '0.85rem' }}>
              Te {reportsLeft === 1 ? 'queda' : 'quedan'} <strong>{reportsLeft}</strong> reporte{reportsLeft !== 1 ? 's' : ''} este mes.{' '}
              <button onClick={() => navigate('/subscription')}
                style={{ color: '#B45309', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}>
                Actualizá tu plan
              </button>
            </p>
          </div>
        )}

        {/* ── Main workspace card ───────────────────────── */}
        <section id="upload-section" className="mx-auto max-w-5xl overflow-hidden rounded-[2rem] shadow-2xl"
          style={workspaceCard}>
          <div style={{ height: 4, background: 'linear-gradient(90deg, #4EC7F5, #FE7808)' }} />

          <div className="p-5 md:p-8">

            {/* Step 1 */}
            <div className="mb-4 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full text-[0.7rem] font-bold"
                style={stepBadgeStyle}>1</span>
              <p style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.09em' }}>
                Subí tu archivo
              </p>
            </div>

            <FileDropzone file={file} onFile={setFile} onClear={reset} />

            {/* Trust chips */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-4">
              {['No guardamos tus datos', '100% seguro', 'Resultados en segundos'].map(t => (
                <div key={t} className="flex items-center gap-1.5">
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22C55E', display: 'inline-block' }} />
                  <span style={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'var(--text3)', fontSize: '0.72rem', fontWeight: 600 }}>{t}</span>
                </div>
              ))}
            </div>

            {/* Divider */}
            <div className="my-8 h-px" style={dividerStyle} />

            <ReportConfig config={config} onChange={setConfig} />

            {/* Generate button */}
            {phase === PHASES.IDLE && (
              file ? (
                <button onClick={handleGenerate}
                  className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-4 text-base font-black text-white shadow-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-2xl"
                  style={{ background: 'linear-gradient(135deg, #4EC7F5, #FE7808)', boxShadow: '0 16px 35px rgba(254,120,8,0.28)' }}>
                  ✦ Generar análisis →
                </button>
              ) : (
                <button disabled className="mt-8 w-full rounded-2xl px-5 py-4 text-sm font-bold"
                  style={{ background: isDark ? 'rgba(255,255,255,0.04)' : 'var(--bg3)', color: 'var(--text3)', cursor: 'not-allowed', border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.06)'}` }}>
                  Subí un archivo para comenzar
                </button>
              )
            )}

            {phase !== PHASES.IDLE && (
              <div className="mt-8">
                <DownloadPanel phase={phase} progress={progress} label={label}
                  urls={urls} error={error} PHASES={PHASES} onNew={handleNewReport} />
              </div>
            )}
          </div>
        </section>
      </div>

      {/* ── Activity section ─────────────────────────────── */}
      <section className="mt-8 space-y-5">

        {/* Section header */}
        <div>
          <p style={{ fontSize: '0.625rem', fontWeight: 700, color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)', textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: 4 }}>
            Actividad de tu cuenta
          </p>
          <h2 style={{ color: 'var(--text)', fontWeight: 800, fontSize: '1.15rem', letterSpacing: '-0.02em' }}>
            Seguimiento de uso y reportes
          </h2>
        </div>

        {/* Usage card */}
        {sub && (
          <div className="grid grid-cols-1 gap-5 rounded-2xl p-4 md:grid-cols-2" style={glassCard}>
            {/* Reportes */}
            <div>
              <div className="mb-2 flex justify-between">
                <span style={{ color: 'var(--text2)', fontSize: '0.78rem', fontWeight: 600 }}>Reportes mensuales</span>
                <span style={{ color: nearLimit ? '#F59E0B' : 'var(--blue-dark)', fontSize: '0.78rem', fontWeight: 800 }}>
                  {sub.reports_used}/{sub.reports_limit}
                </span>
              </div>
              <div style={progressTrackStyle}>
                <div style={{
                  height: '100%', borderRadius: 999, transition: 'width 0.4s ease',
                  width: `${reportsPct}%`,
                  background: nearLimit ? 'linear-gradient(90deg, #F59E0B, #FCD34D)' : 'linear-gradient(90deg, #4EC7F5, #38BDF8)',
                }} />
              </div>
            </div>

            {/* Consultas */}
            {sub.consultations_limit > 0 && (
              <div>
                <div className="mb-2 flex justify-between">
                  <span style={{ color: 'var(--text2)', fontSize: '0.78rem', fontWeight: 600 }}>Consultas al analista</span>
                  <span style={{ color: 'var(--orange-dark)', fontSize: '0.78rem', fontWeight: 800 }}>
                    {sub.consultations_used || 0}/{sub.consultations_limit}
                  </span>
                </div>
                <div style={progressTrackStyle}>
                  <div style={{
                    height: '100%', borderRadius: 999, transition: 'width 0.4s ease',
                    width: `${consultPct}%`,
                    background: 'linear-gradient(90deg, #FE7808, #FB923C)',
                  }} />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Info cards */}
        {!loadingData && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

            {/* Último reporte */}
            <div style={{
              ...glassCard,
              padding: '1.15rem', minHeight: 118,
              borderLeft: '2.5px solid #4EC7F5',
            }}>
              <p style={{ fontSize: '0.6rem', fontWeight: 700, color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                Último reporte
              </p>
              {recentReports[0] ? (
                <>
                  <p style={{ color: 'var(--text)', fontWeight: 600, fontSize: '0.82rem', marginTop: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {recentReports[0].filename}
                  </p>
                  <p style={{ color: 'var(--text3)', fontSize: '0.68rem', marginTop: 3 }}>
                    {formatDate(recentReports[0].created_at)}
                  </p>
                </>
              ) : (
                <p style={{ color: 'var(--text3)', fontSize: '0.75rem', marginTop: 8 }}>Sin reportes todavía</p>
              )}
            </div>

            {/* Reporte anterior */}
            <div style={{
              ...glassCard,
              padding: '1.15rem', minHeight: 118,
              borderLeft: '2.5px solid #4EC7F5',
            }}>
              <p style={{ fontSize: '0.6rem', fontWeight: 700, color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                Reporte anterior
              </p>
              {recentReports[1] ? (
                <>
                  <p style={{ color: 'var(--text)', fontWeight: 600, fontSize: '0.82rem', marginTop: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {recentReports[1].filename}
                  </p>
                  <p style={{ color: 'var(--text3)', fontSize: '0.68rem', marginTop: 3 }}>
                    {formatDate(recentReports[1].created_at)}
                  </p>
                </>
              ) : (
                <p style={{ color: 'var(--text3)', fontSize: '0.75rem', marginTop: 8 }}>
                  {recentReports[0] ? 'Todavía no hay más reportes' : 'Sin reportes todavía'}
                </p>
              )}
            </div>

            {/* Consulta pendiente */}
            <div style={{
              ...glassCard,
              padding: '1.15rem', minHeight: 118,
              borderLeft: '2.5px solid #FE7808',
            }}>
              <p style={{ fontSize: '0.6rem', fontWeight: 700, color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                Consulta pendiente
              </p>
              {pendingConsultation ? (
                <>
                  <p style={{ color: 'var(--text)', fontWeight: 600, fontSize: '0.82rem', marginTop: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {pendingConsultation.subject}
                  </p>
                  <p style={{ color: 'var(--text3)', fontSize: '0.68rem', marginTop: 3 }}>
                    {formatDate(pendingConsultation.created_at)}
                  </p>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', marginTop: 8,
                    padding: '0.15rem 0.55rem', borderRadius: 999, fontSize: '0.65rem', fontWeight: 700,
                    ...(isDark ? { background: 'rgba(245,158,11,0.12)', color: '#FCD34D' } : { background: 'rgba(245,158,11,0.10)', color: '#92400E' }),
                  }}>Pendiente</span>
                </>
              ) : (
                <p style={{ color: 'var(--text3)', fontSize: '0.75rem', marginTop: 8 }}>Sin consultas pendientes</p>
              )}
            </div>
          </div>
        )}

        {/* Recent reports */}
        {recentReports.length > 0 && (
          <div className="rounded-2xl p-4" style={glassCard}>
            <h2 style={{ color: 'var(--text)', fontWeight: 800, fontSize: '0.95rem', marginBottom: 12 }}>
              Reportes recientes
            </h2>
            <div>
              {recentReports.map((r, i) => {
                const fmts = Array.isArray(r.formats) ? r.formats : JSON.parse(r.formats || '[]')
                const rowBorder = isDark ? '1px solid rgba(255,255,255,0.04)' : '1px solid rgba(0,0,0,0.04)'
                return (
                  <div key={r.id || i}
                    className="flex flex-wrap items-center justify-between gap-3 py-2.5"
                    style={{ borderBottom: i < recentReports.length - 1 ? rowBorder : 'none' }}>
                    <div style={{ minWidth: 160 }}>
                      <p style={{
                        color: 'var(--text)', fontWeight: 600, fontSize: '0.82rem',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        <span style={{ color: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)', marginRight: 4 }}>📊</span>
                        {r.filename}
                      </p>
                      <p style={{ color: 'var(--text3)', fontSize: '0.68rem', marginTop: 2 }}>
                        {r.report_type} · {formatDate(r.created_at)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {fmts.map(f => (
                        <span key={f} style={{
                          ...fmtPillStyle,
                          display: 'inline-flex', alignItems: 'center',
                          padding: '0.12rem 0.5rem', borderRadius: 999,
                          fontSize: '0.65rem', fontWeight: 700,
                          fontFamily: 'monospace', textTransform: 'uppercase',
                        }}>{f}</span>
                      ))}
                      <span style={{
                        ...getStatusStyle(r.status),
                        display: 'inline-flex', alignItems: 'center',
                        padding: '0.12rem 0.5rem', borderRadius: 999,
                        fontSize: '0.65rem', fontWeight: 700,
                      }}>
                        {STATUS_LABELS[r.status] || r.status}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </section>
    </PageLayout>
  )
}

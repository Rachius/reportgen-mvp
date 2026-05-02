import { useState, useEffect } from 'react'
import { getProfile, updateProfile, uploadCompanyLogo, deleteCompanyLogo } from '../lib/reportApi'
import { useAuth } from '../context/AuthContext'
import PageLayout from '../components/PageLayout'

const INDUSTRIES = [
  'Agro / Agroindustria', 'Retail / Comercio', 'Manufactura / Industria',
  'Servicios profesionales', 'Tecnología', 'Salud', 'Construcción',
  'Logística / Transporte', 'Alimentación / Gastronomía', 'Otro',
]
const CURRENCIES = ['ARS', 'USD', 'EUR', 'BRL', 'CLP', 'UYU']
const COLUMN_FIELDS = [
  { key: 'amount',   label: 'Monto / Ventas',  placeholder: 'ej: total, monto_neto, importe' },
  { key: 'date',     label: 'Fecha',            placeholder: 'ej: fecha, fecha_venta, date' },
  { key: 'status',   label: 'Estado',           placeholder: 'ej: estado, status, condicion' },
  { key: 'seller',   label: 'Vendedor',         placeholder: 'ej: vendedor, rep_comercial' },
  { key: 'product',  label: 'Producto',         placeholder: 'ej: producto, articulo, item' },
  { key: 'category', label: 'Categoría',        placeholder: 'ej: categoria, rubro, tipo' },
  { key: 'customer', label: 'Cliente',          placeholder: 'ej: cliente, razon_social' },
  { key: 'quantity', label: 'Cantidad',         placeholder: 'ej: cantidad, qty, unidades' },
]

const selectStyle = {
  width: '100%',
  padding: '8px 12px',
  borderRadius: 'var(--radius-input)',
  border: '1px solid var(--border-strong)',
  background: 'var(--bg)',
  color: 'var(--text)',
  fontSize: '0.875rem',
  outline: 'none',
  fontFamily: 'inherit',
}

function Section({ title, desc, children }) {
  return (
    <div className="card space-y-4">
      <div>
        <h2 style={{ color: 'var(--text)', fontWeight: 600, fontSize: '0.9rem' }}>{title}</h2>
        {desc && <p style={{ color: 'var(--text3)', fontSize: '0.78rem', marginTop: 2 }}>{desc}</p>}
      </div>
      {children}
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <label style={{ color: 'var(--text3)', fontSize: '0.72rem', display: 'block', marginBottom: 4 }}>
        {label}
      </label>
      {children}
    </div>
  )
}

export default function Profile() {
  const [form, setForm] = useState({
    company_name: '', industry: '', country: 'Argentina', currency: 'ARS',
    business_description: '', extra_context: '', column_mapping: {}, onboarding_completed: false,
  })
  const [logoUrl, setLogoUrl] = useState(null)
  const [logoUploading, setLogoUploading] = useState(false)
  const [logoError, setLogoError] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const { user, changePassword, deleteAccount, resendVerification } = useAuth()

  const [pwForm, setPwForm] = useState({ current: '', new: '', confirm: '' })
  const [pwError, setPwError] = useState(null)
  const [pwSuccess, setPwSuccess] = useState(false)
  const [pwLoading, setPwLoading] = useState(false)

  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [deleteError, setDeleteError] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [verificationSent, setVerificationSent] = useState(false)

  const isGoogleUser = user?.providerData?.some(p => p.providerId === 'google.com')

  useEffect(() => {
    getProfile().then(({ profile }) => {
      if (profile) {
        setForm({
          company_name: profile.company_name || '',
          industry: profile.industry || '',
          country: profile.country || 'Argentina',
          currency: profile.currency || 'ARS',
          business_description: profile.business_description || '',
          extra_context: profile.extra_context || '',
          column_mapping: typeof profile.column_mapping === 'string'
            ? JSON.parse(profile.column_mapping || '{}')
            : (profile.column_mapping || {}),
          onboarding_completed: profile.onboarding_completed || false,
        })
        setLogoUrl(profile.logo_url || null)
      }
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setLogoUploading(true)
    setLogoError(null)
    try {
      const result = await uploadCompanyLogo(file)
      setLogoUrl(result.logo_url)
    } catch (err) {
      setLogoError(err.response?.data?.detail || 'Error al subir el logo. Intentá de nuevo.')
    } finally {
      setLogoUploading(false)
    }
  }

  const handleDeleteLogo = async () => {
    try {
      await deleteCompanyLogo()
      setLogoUrl(null)
    } catch (err) {
      console.error('Error al eliminar logo:', err)
    }
  }

  const set = (key, value) => setForm(f => ({ ...f, [key]: value }))
  const setMapping = (key, value) =>
    setForm(f => ({ ...f, column_mapping: { ...f.column_mapping, [key]: value } }))

  const handleSave = async () => {
    setSaving(true); setSaved(false)
    try {
      await updateProfile({ ...form, onboarding_completed: true })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async () => {
    setPwError(null); setPwSuccess(false)
    if (pwForm.new !== pwForm.confirm) { setPwError('Las contraseñas nuevas no coinciden.'); return }
    if (pwForm.new.length < 6) { setPwError('La contraseña debe tener al menos 6 caracteres.'); return }
    setPwLoading(true)
    try {
      await changePassword(pwForm.current, pwForm.new)
      setPwSuccess(true)
      setPwForm({ current: '', new: '', confirm: '' })
    } catch (err) {
      const msgs = {
        'auth/wrong-password': 'La contraseña actual es incorrecta.',
        'auth/too-many-requests': 'Demasiados intentos. Esperá unos minutos.',
      }
      setPwError(msgs[err.code] || 'Error al cambiar la contraseña.')
    } finally {
      setPwLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    setDeleteError(null)
    if (!deleteConfirm) { setDeleteError('Completá el campo para confirmar.'); return }
    if (isGoogleUser && deleteConfirm !== 'DELETE') { setDeleteError('Escribí DELETE para confirmar.'); return }
    setDeleteLoading(true)
    try {
      await deleteAccount(deleteConfirm)
    } catch (err) {
      const msgs = { 'auth/wrong-password': 'Contraseña incorrecta.' }
      setDeleteError(msgs[err.code] || 'Error al eliminar la cuenta.')
      setDeleteLoading(false)
    }
  }

  if (loading) return (
    <PageLayout>
      <div className="flex items-center justify-center h-40">
        <div className="spinner" />
      </div>
    </PageLayout>
  )

  return (
    <PageLayout>
      <div style={{ maxWidth: 680, margin: '0 auto' }} className="space-y-5">

        {/* Header */}
        <div>
          <h1 className="grad-text" style={{ fontWeight: 700, fontSize: '1.25rem' }}>Perfil de empresa</h1>
          <p style={{ color: 'var(--text2)', fontSize: '0.875rem', marginTop: 4 }}>
            Esta información le da contexto a Reporti para generar análisis más precisos.
          </p>
        </div>

        {/* Email no verificado */}
        {user && !user.emailVerified && !isGoogleUser && (
          <div style={{
            background: '#FFFBEB', border: '1px solid #FCD34D',
            borderRadius: 'var(--radius-card)', padding: '0.875rem 1rem',
          }}>
            <p style={{ color: '#92400E', fontWeight: 600, fontSize: '0.8rem' }}>Email no verificado</p>
            <p style={{ color: '#B45309', fontSize: '0.75rem', marginTop: 2 }}>
              Verificá tu email para acceder a todas las funciones.
            </p>
            {verificationSent ? (
              <p style={{ color: 'var(--blue-dark)', fontSize: '0.75rem', marginTop: 6 }}>Email enviado. Revisá tu casilla.</p>
            ) : (
              <button
                onClick={async () => { await resendVerification(); setVerificationSent(true) }}
                style={{ color: '#92400E', fontSize: '0.75rem', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', marginTop: 6, padding: 0 }}
              >
                Reenviar email de verificación
              </button>
            )}
          </div>
        )}

        {/* Datos básicos */}
        <Section title="Datos básicos">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Field label="Logo de la empresa">
                {logoUrl && (
                  <div className="flex items-center gap-3 mb-3">
                    <div style={{
                      width: 64, height: 64, borderRadius: 12,
                      border: '1px solid var(--border-strong)',
                      background: 'var(--bg3)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      overflow: 'hidden', flexShrink: 0,
                    }}>
                      <img src={logoUrl} alt="Logo" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                    </div>
                    <div>
                      <p style={{ color: 'var(--text2)', fontSize: '0.75rem', fontWeight: 600, marginBottom: 4 }}>Logo actual</p>
                      <button
                        onClick={handleDeleteLogo}
                        style={{ color: '#EF4444', fontSize: '0.72rem', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                        onMouseEnter={e => (e.currentTarget.style.color = '#B91C1C')}
                        onMouseLeave={e => (e.currentTarget.style.color = '#EF4444')}
                      >
                        Eliminar logo
                      </button>
                    </div>
                  </div>
                )}
                <label style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  width: '100%', height: 88,
                  border: '2px dashed var(--border-strong)', borderRadius: 12,
                  cursor: logoUploading ? 'not-allowed' : 'pointer',
                  background: 'var(--bg3)', transition: 'border-color 0.2s, background 0.2s',
                }}
                  onMouseEnter={e => { if (!logoUploading) { e.currentTarget.style.borderColor = '#4EC7F5'; e.currentTarget.style.background = 'rgba(78,199,245,0.04)' } }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.background = 'var(--bg3)' }}
                >
                  <input type="file" style={{ display: 'none' }}
                    accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
                    onChange={handleLogoUpload} disabled={logoUploading} />
                  {logoUploading ? (
                    <span style={{ color: 'var(--text3)', fontSize: '0.78rem' }}>Subiendo...</span>
                  ) : (
                    <>
                      <svg width={22} height={22} fill="none" stroke="currentColor" viewBox="0 0 24 24"
                        style={{ color: 'var(--text3)', marginBottom: 4 }}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span style={{ color: 'var(--text3)', fontSize: '0.72rem' }}>PNG, JPG, SVG · máx. 2 MB</span>
                    </>
                  )}
                </label>
                {logoError && <p style={{ color: '#DC2626', fontSize: '0.72rem', marginTop: 4 }}>{logoError}</p>}
                <p style={{ color: 'var(--text3)', fontSize: '0.68rem', marginTop: 4 }}>
                  El logo aparecerá en el encabezado de tus reportes PDF y PPTX.
                </p>
              </Field>
            </div>
            <div className="col-span-2">
              <Field label="Nombre de la empresa">
                <input value={form.company_name} onChange={e => set('company_name', e.target.value)}
                  placeholder="Agro Norte S.A." className="input" />
              </Field>
            </div>
            <Field label="Industria / Rubro">
              <select value={form.industry} onChange={e => set('industry', e.target.value)} style={selectStyle}>
                <option value="">Seleccioná...</option>
                {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </Field>
            <Field label="Moneda principal">
              <select value={form.currency} onChange={e => set('currency', e.target.value)} style={selectStyle}>
                {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <div className="col-span-2">
              <Field label="País">
                <input value={form.country} onChange={e => set('country', e.target.value)}
                  placeholder="Argentina" className="input" />
              </Field>
            </div>
            <div className="col-span-2">
              <Field label="Descripción del negocio">
                <textarea value={form.business_description} onChange={e => set('business_description', e.target.value)}
                  placeholder="Distribuimos semillas e insumos agropecuarios en el NOA..."
                  rows={3} className="input" style={{ resize: 'none' }} />
              </Field>
            </div>
            <div className="col-span-2">
              <Field label={<>Contexto adicional para el análisis <span style={{ color: 'var(--text3)', fontWeight: 400 }}>(opcional)</span></>}>
                <textarea value={form.extra_context} onChange={e => set('extra_context', e.target.value)}
                  placeholder="Ej: nuestro año fiscal empieza en julio, los valores están en miles de pesos..."
                  rows={3} className="input" style={{ resize: 'none' }} />
              </Field>
            </div>
          </div>
        </Section>

        {/* Mapeo de columnas */}
        <Section
          title="Mapeo de columnas"
          desc="Indicá cómo se llaman las columnas clave en tus archivos para que Reporti las identifique correctamente."
        >
          <div className="grid grid-cols-2 gap-4">
            {COLUMN_FIELDS.map(field => (
              <Field key={field.key} label={field.label}>
                <input
                  value={form.column_mapping[field.key] || ''}
                  onChange={e => setMapping(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  className="input"
                />
              </Field>
            ))}
          </div>
        </Section>

        {/* Cambiar contraseña */}
        {!isGoogleUser && (
          <Section title="Cambiar contraseña">
            <Field label="Contraseña actual">
              <input type="password" value={pwForm.current}
                onChange={e => setPwForm(f => ({ ...f, current: e.target.value }))} className="input" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Nueva contraseña">
                <input type="password" value={pwForm.new}
                  onChange={e => setPwForm(f => ({ ...f, new: e.target.value }))} className="input" />
              </Field>
              <Field label="Confirmar contraseña">
                <input type="password" value={pwForm.confirm}
                  onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))} className="input" />
              </Field>
            </div>
            {pwError && (
              <p style={{ color: '#DC2626', fontSize: '0.75rem', background: '#FEF2F2', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--radius-btn)', padding: '0.4rem 0.75rem' }}>
                {pwError}
              </p>
            )}
            {pwSuccess && <p style={{ color: 'var(--blue-dark)', fontSize: '0.75rem' }}>Contraseña actualizada correctamente.</p>}
            <button
              onClick={handleChangePassword}
              disabled={pwLoading || !pwForm.current || !pwForm.new || !pwForm.confirm}
              className="btn btn-outline"
            >
              {pwLoading ? 'Guardando...' : 'Cambiar contraseña'}
            </button>
          </Section>
        )}

        {/* Guardar */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn btn-grad"
          style={{ width: '100%', justifyContent: 'center', padding: '0.6rem', marginBottom: 4 }}
        >
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </button>
        {saved && (
          <p style={{ color: 'var(--blue-dark)', fontSize: '0.8rem', textAlign: 'center' }}>
            Perfil guardado correctamente.
          </p>
        )}

        {/* Zona de peligro */}
        <div style={{
          background: 'var(--card)',
          border: '1px solid rgba(239,68,68,0.25)',
          borderRadius: 'var(--radius-card)',
          padding: '1.25rem',
          boxShadow: 'var(--shadow)',
        }} className="space-y-4">
          <div>
            <h2 style={{ color: '#DC2626', fontWeight: 600, fontSize: '0.9rem' }}>Zona de peligro</h2>
            <p style={{ color: 'var(--text3)', fontSize: '0.8rem', marginTop: 2 }}>
              Eliminar tu cuenta es permanente. Se borrarán todos tus datos y reportes.
            </p>
          </div>
          <div>
            <label style={{ color: 'var(--text3)', fontSize: '0.72rem', display: 'block', marginBottom: 4 }}>
              {isGoogleUser ? 'Escribí DELETE para confirmar' : 'Ingresá tu contraseña para confirmar'}
            </label>
            <input
              type={isGoogleUser ? 'text' : 'password'}
              value={deleteConfirm}
              onChange={e => setDeleteConfirm(e.target.value)}
              className="input"
              style={{ borderColor: 'rgba(239,68,68,0.3)' }}
            />
          </div>
          {deleteError && <p style={{ color: '#DC2626', fontSize: '0.75rem' }}>{deleteError}</p>}
          <button
            onClick={handleDeleteAccount}
            disabled={deleteLoading || !deleteConfirm}
            className="btn btn-danger"
          >
            {deleteLoading ? 'Eliminando...' : 'Eliminar mi cuenta'}
          </button>
        </div>
      </div>
    </PageLayout>
  )
}

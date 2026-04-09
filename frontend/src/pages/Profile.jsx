import { useState, useEffect } from 'react'
import { getProfile, updateProfile } from '../lib/reportApi'
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

function Section({ title, children }) {
  return (
    <div className="card space-y-4">
      <h2 style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.875rem' }}>{title}</h2>
      {children}
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <label style={{ color: 'var(--text-muted)', fontSize: '0.72rem', display: 'block', marginBottom: 4 }}>
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
      }
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

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
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Cargando perfil...</p>
      </div>
    </PageLayout>
  )

  const selectStyle = {
    width: '100%',
    padding: '0.45rem 0.75rem',
    borderRadius: 'var(--radius-input)',
    border: '1px solid var(--border-strong)',
    background: 'var(--surface)',
    color: 'var(--text-primary)',
    fontSize: '0.875rem',
    outline: 'none',
  }

  return (
    <PageLayout>
      <div style={{ maxWidth: 680, margin: '0 auto' }} className="space-y-5">
        <div>
          <h1 style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '1.25rem' }}>Perfil de empresa</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: 4 }}>
            Esta información le da contexto a Reporti para generar análisis más precisos.
          </p>
        </div>

        {/* Email no verificado */}
        {user && !user.emailVerified && !isGoogleUser && (
          <div style={{
            background: '#FFFBEB',
            border: '1px solid #FCD34D',
            borderRadius: 'var(--radius-card)',
            padding: '0.875rem 1rem',
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
                style={{ color: '#92400E', fontSize: '0.75rem', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', marginTop: 6 }}
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
              <Field label={<>Contexto adicional para el análisis <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(opcional)</span></>}>
                <textarea value={form.extra_context} onChange={e => set('extra_context', e.target.value)}
                  placeholder="Ej: nuestro año fiscal empieza en julio, los valores están en miles de pesos..."
                  rows={3} className="input" style={{ resize: 'none' }} />
              </Field>
            </div>
          </div>
        </Section>

        {/* Mapeo de columnas */}
        <Section title="Mapeo de columnas">
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: -8 }}>
            Indicá cómo se llaman las columnas clave en tus archivos para que Reporti las identifique correctamente.
          </p>
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
            <div className="space-y-3">
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
        <div className="flex items-center justify-between">
          {saved
            ? <p style={{ color: 'var(--blue-dark)', fontSize: '0.8rem' }}>Perfil guardado correctamente.</p>
            : <div />
          }
          <button onClick={handleSave} disabled={saving} className="btn btn-primary" style={{ padding: '0.5rem 1.5rem' }}>
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>

        {/* Zona de peligro */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid rgba(239,68,68,0.25)',
          borderRadius: 'var(--radius-card)',
          padding: '1.25rem',
        }} className="space-y-4">
          <div>
            <h2 style={{ color: '#DC2626', fontWeight: 600, fontSize: '0.875rem' }}>Zona de peligro</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: 2 }}>
              Eliminar tu cuenta es permanente. Se borrarán todos tus datos y reportes.
            </p>
          </div>
          <div>
            <label style={{ color: 'var(--text-muted)', fontSize: '0.72rem', display: 'block', marginBottom: 4 }}>
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

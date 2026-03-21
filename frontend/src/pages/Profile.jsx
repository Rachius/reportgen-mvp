
import { useState, useEffect } from 'react'
import { getProfile, updateProfile } from '../lib/reportApi'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'

const INDUSTRIES = [
  'Agro / Agroindustria',
  'Retail / Comercio',
  'Manufactura / Industria',
  'Servicios profesionales',
  'Tecnología',
  'Salud',
  'Construcción',
  'Logística / Transporte',
  'Alimentación / Gastronomía',
  'Otro',
]

const CURRENCIES = ['ARS', 'USD', 'EUR', 'BRL', 'CLP', 'UYU']

const COLUMN_FIELDS = [
  { key: 'amount', label: 'Columna de monto / ventas', placeholder: 'ej: total, monto_neto, importe' },
  { key: 'date', label: 'Columna de fecha', placeholder: 'ej: fecha, fecha_venta, date' },
  { key: 'status', label: 'Columna de estado', placeholder: 'ej: estado, status, condicion' },
  { key: 'seller', label: 'Columna de vendedor', placeholder: 'ej: vendedor, rep_comercial, seller' },
  { key: 'product', label: 'Columna de producto', placeholder: 'ej: producto, articulo, item' },
  { key: 'category', label: 'Columna de categoría', placeholder: 'ej: categoria, rubro, tipo' },
  { key: 'customer', label: 'Columna de cliente', placeholder: 'ej: cliente, razon_social, customer' },
  { key: 'quantity', label: 'Columna de cantidad', placeholder: 'ej: cantidad, qty, unidades' },
]

export default function Profile() {
  const [form, setForm] = useState({
    company_name: '',
    industry: '',
    country: 'Argentina',
    currency: 'ARS',
    business_description: '',
    extra_context: '',
    column_mapping: {},
    onboarding_completed: false,
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
    setSaving(true)
    setSaved(false)
    try {
      await updateProfile({ ...form, onboarding_completed: true })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center pt-32">
          <p className="text-sm text-gray-400">Cargando perfil...</p>
        </div>
      </div>
    )
  }
const handleChangePassword = async () => {
  setPwError(null)
  setPwSuccess(false)
  if (pwForm.new !== pwForm.confirm) {
    setPwError('Las contraseñas nuevas no coinciden.')
    return
  }
  if (pwForm.new.length < 6) {
    setPwError('La contraseña debe tener al menos 6 caracteres.')
    return
  }
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
  if (!deleteConfirm) { setDeleteError('Ingresá tu contraseña para confirmar.'); return }
  setDeleteLoading(true)
  try {
    await deleteAccount(deleteConfirm)
  } catch (err) {
    const msgs = {
      'auth/wrong-password': 'Contraseña incorrecta.',
    }
    setDeleteError(msgs[err.code] || 'Error al eliminar la cuenta.')
    setDeleteLoading(false)
  }
}

const handleResendVerification = async () => {
  await resendVerification()
  setVerificationSent(true)
}







  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-10 space-y-8">

        <div>
          <h1 className="text-lg font-medium text-gray-800">Perfil de empresa</h1>
          <p className="text-sm text-gray-500 mt-1">
            Esta información le da contexto a Claude para generar análisis más precisos y personalizados.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          <h2 className="text-sm font-medium text-gray-700">Datos básicos</h2>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-xs text-gray-500 block mb-1">Nombre de la empresa</label>
              <input
                value={form.company_name}
                onChange={e => set('company_name', e.target.value)}
                placeholder="Agro Norte S.A."
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm
                  focus:outline-none focus:border-teal-400 transition"
              />
            </div>

            <div>
              <label className="text-xs text-gray-500 block mb-1">Industria / Rubro</label>
              <select
                value={form.industry}
                onChange={e => set('industry', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm
                  focus:outline-none focus:border-teal-400 transition bg-white"
              >
                <option value="">Seleccioná...</option>
                {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>

            <div>
              <label className="text-xs text-gray-500 block mb-1">Moneda principal</label>
              <select
                value={form.currency}
                onChange={e => set('currency', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm
                  focus:outline-none focus:border-teal-400 transition bg-white"
              >
                {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="col-span-2">
              <label className="text-xs text-gray-500 block mb-1">País</label>
              <input
                value={form.country}
                onChange={e => set('country', e.target.value)}
                placeholder="Argentina"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm
                  focus:outline-none focus:border-teal-400 transition"
              />
            </div>

            <div className="col-span-2">
              <label className="text-xs text-gray-500 block mb-1">
                Descripción del negocio
              </label>
              <textarea
                value={form.business_description}
                onChange={e => set('business_description', e.target.value)}
                placeholder="Distribuimos semillas e insumos agropecuarios en el NOA. Nuestros clientes son productores y acopios."
                rows={3}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm
                  focus:outline-none focus:border-teal-400 transition resize-none"
              />
            </div>

            <div className="col-span-2">
              <label className="text-xs text-gray-500 block mb-1">
                Contexto adicional para el análisis
                <span className="ml-1 text-gray-400">(opcional)</span>
              </label>
              <textarea
                value={form.extra_context}
                onChange={e => set('extra_context', e.target.value)}
                placeholder="Ej: nuestro año fiscal empieza en julio, los valores están en miles de pesos, el objetivo anual de ventas es $500M ARS."
                rows={3}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm
                  focus:outline-none focus:border-teal-400 transition resize-none"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          <div>
            <h2 className="text-sm font-medium text-gray-700">Mapeo de columnas</h2>
            <p className="text-xs text-gray-400 mt-1">
              Indicá cómo se llaman las columnas clave en tus archivos. Así Claude siempre
              identifica correctamente los datos sin importar los nombres que uses.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {COLUMN_FIELDS.map(field => (
              <div key={field.key}>
                <label className="text-xs text-gray-500 block mb-1">{field.label}</label>
                <input
                  value={form.column_mapping[field.key] || ''}
                  onChange={e => setMapping(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm
                    focus:outline-none focus:border-teal-400 transition"
                />
              </div>
            ))}
          </div>
        </div>

          {user && !user.emailVerified && !user.providerData.some(p => p.providerId === 'google.com') && (
  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
    <p className="text-sm text-amber-800 font-medium mb-1">Email no verificado</p>
    <p className="text-xs text-amber-700 mb-3">
      Verificá tu email para acceder a todas las funciones.
    </p>
    {verificationSent ? (
      <p className="text-xs text-teal-600">Email enviado. Revisá tu casilla.</p>
    ) : (
      <button
        onClick={handleResendVerification}
        className="text-xs text-amber-800 underline hover:no-underline"
      >
        Reenviar email de verificación
      </button>
    )}
  </div>
)}

{user && !user.providerData.some(p => p.providerId === 'google.com') && (
  <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
    <h2 className="text-sm font-medium text-gray-700">Cambiar contraseña</h2>
    <div className="space-y-3">
      <div>
        <label className="text-xs text-gray-500 block mb-1">Contraseña actual</label>
        <input
          type="password"
          value={pwForm.current}
          onChange={e => setPwForm(f => ({ ...f, current: e.target.value }))}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm
            focus:outline-none focus:border-teal-400 transition"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-500 block mb-1">Nueva contraseña</label>
          <input
            type="password"
            value={pwForm.new}
            onChange={e => setPwForm(f => ({ ...f, new: e.target.value }))}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm
              focus:outline-none focus:border-teal-400 transition"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">Confirmar contraseña</label>
          <input
            type="password"
            value={pwForm.confirm}
            onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm
              focus:outline-none focus:border-teal-400 transition"
          />
        </div>
      </div>
    </div>
    {pwError && <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{pwError}</p>}
    {pwSuccess && <p className="text-xs text-teal-600">Contraseña actualizada correctamente.</p>}
    <button
      onClick={handleChangePassword}
      disabled={pwLoading || !pwForm.current || !pwForm.new || !pwForm.confirm}
      className="px-4 py-2 rounded-lg bg-teal-600 text-white text-sm font-medium
        hover:bg-teal-700 transition disabled:bg-gray-200 disabled:text-gray-400
        disabled:cursor-not-allowed"
    >
      {pwLoading ? 'Guardando...' : 'Cambiar contraseña'}
    </button>
  </div>
)}

<div className="bg-white rounded-xl border border-red-100 p-6 space-y-4">
  <div>
    <h2 className="text-sm font-medium text-red-600">Zona de peligro</h2>
    <p className="text-xs text-gray-500 mt-1">
      Eliminar tu cuenta es permanente. Se borrarán todos tus datos y reportes.
    </p>
  </div>
  <div>
    <label className="text-xs text-gray-500 block mb-1">
      {user?.providerData.some(p => p.providerId === 'google.com')
        ? 'Escribí DELETE para confirmar'
        : 'Ingresá tu contraseña para confirmar'}
    </label>
    <input
      type={user?.providerData.some(p => p.providerId === 'google.com') ? 'text' : 'password'}
      value={deleteConfirm}
      onChange={e => setDeleteConfirm(e.target.value)}
      className="w-full border border-red-200 rounded-lg px-3 py-2 text-sm
        focus:outline-none focus:border-red-400 transition"
    />
  </div>
  {deleteError && <p className="text-xs text-red-500">{deleteError}</p>}
  <button
    onClick={handleDeleteAccount}
    disabled={deleteLoading || !deleteConfirm}
    className="px-4 py-2 rounded-lg border border-red-200 text-red-600 text-sm
      hover:bg-red-50 transition disabled:opacity-40 disabled:cursor-not-allowed"
  >
    {deleteLoading ? 'Eliminando...' : 'Eliminar mi cuenta'}
  </button>
</div>






        <div className="flex items-center justify-between">
          {saved && (
            <p className="text-xs text-teal-600">Perfil guardado correctamente.</p>
          )}
          {!saved && <div />}
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 rounded-lg bg-teal-600 text-white font-medium text-sm
              hover:bg-teal-700 transition disabled:bg-gray-200 disabled:text-gray-400"
          >
            {saving ? 'Guardando...' : 'Guardar perfil'}
          </button>
        </div>

      </div>
    </div>
  )
}
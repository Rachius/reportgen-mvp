const ALLOWED_TYPES = [
  'text/csv',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
]
const ALLOWED_EXTENSIONS = /\.(csv|xlsx|xls)$/i

export function validateFile(file, maxMb = 10) {
  if (!file) return { ok: false, error: 'No se seleccionó ningún archivo.' }

  const validType = ALLOWED_TYPES.includes(file.type) || ALLOWED_EXTENSIONS.test(file.name)
  if (!validType) return { ok: false, error: 'Formato no soportado. Subí un CSV o Excel.' }

  const maxBytes = maxMb * 1024 * 1024
  if (file.size > maxBytes) return { ok: false, error: `El archivo supera los ${maxMb} MB.` }

  return { ok: true, error: null }
}
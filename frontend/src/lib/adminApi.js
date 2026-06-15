import { api } from './reportApi'

export async function getMetrics() {
  const { data } = await api.get('/api/admin/metrics')
  return data
}

export async function getUsers(page = 1) {
  const { data } = await api.get('/api/admin/users', { params: { page } })
  return data
}

export async function approveUser(userId) {
  const { data } = await api.put(`/api/admin/users/${userId}/approve`)
  return data
}

export async function blockUser(userId) {
  const { data } = await api.put(`/api/admin/users/${userId}/block`)
  return data
}

export async function getConsultations(status = null) {
  const { data } = await api.get('/api/admin/consultations', {
    params: status ? { status } : {},
  })
  return data
}

export async function answerConsultation(id, response) {
  const { data } = await api.put(`/api/admin/consultations/${id}/answer`, { response })
  return data
}

export async function getAdminReports() {
  const { data } = await api.get('/api/admin/reports')
  return data
}

// Para el usuario
export async function sendConsultation(subject, message) {
  const { data } = await api.post('/api/consultations', { subject, message })
  return data
}

export async function getUserConsultations() {
  const { data } = await api.get('/api/consultations')
  return data
}

export async function setUserPlan(userId, plan) {
  const { data } = await api.put(`/api/admin/users/${userId}/plan`, { plan })
  return data
}

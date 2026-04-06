import axios from 'axios'
import { auth } from './firebase'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})

api.interceptors.request.use(async (config) => {
  const user = auth.currentUser
  if (user) {
    const token = await user.getIdToken()
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export async function generateReport(file, config) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('report_type', config.type)
  formData.append('formats', JSON.stringify(config.formats))
  const { data } = await api.post('/api/reports/generate', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export async function getReportStatus(jobId) {
  const { data } = await api.get(`/api/reports/status/${jobId}`)
  return data
}

export async function getProfile() {
  const { data } = await api.get('/api/profile')
  return data
}

export async function updateProfile(profileData) {
  const { data } = await api.put('/api/profile', profileData)
  return data
}

export async function loginToBackend() {
  const { data } = await api.post('/api/auth/login')
  return data
}

export async function getSubscription() {
  const { data } = await api.get('/api/subscription')
  return data
}

export async function createCheckout() {
  const { data } = await api.post('/api/subscription/checkout')
  return data
}
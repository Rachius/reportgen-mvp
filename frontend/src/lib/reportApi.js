import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
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

export async function checkHealth() {
  const { data } = await api.get('/health')
  return data
}
import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
})

export async function submitContact(data) {
  const response = await api.post('/contact', data)
  return response.data
}

export async function submitLead(data) {
  const response = await api.post('/leads', data)
  return response.data
}

export async function checkHealth() {
  const response = await api.get('/health')
  return response.data
}

export default api

import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor - add auth token
api.interceptors.request.use(config => {
  const user = localStorage.getItem('admin_user')
  if (user) {
    try {
      const parsed = JSON.parse(user)
      if (parsed.token) {
        config.headers.Authorization = `Bearer ${parsed.token}`
      }
    } catch (e) {
      console.error('[api] stored admin_user is not valid JSON, clearing it', e)
      localStorage.removeItem('admin_user')
    }
  }
  return config
})

// Response interceptor
api.interceptors.response.use(
  response => response.data,
  error => {
    const { method, url } = error.config || {}
    const status = error.response?.status
    console.error(
      `[api] ${String(method || 'GET').toUpperCase()} ${url || '(unknown url)'} failed` +
        (status ? ` with ${status}` : ''),
      error
    )

    if (status === 401) {
      localStorage.removeItem('admin_user')
      window.location.href = '/login'
    }

    // Reject with an Error so status/response context survives, while exposing
    // the server-provided reason as the message.
    const serverMessage = error.response?.data?.error || error.response?.data?.message
    if (serverMessage) {
      error.message = serverMessage
    }
    return Promise.reject(error)
  }
)

export default api

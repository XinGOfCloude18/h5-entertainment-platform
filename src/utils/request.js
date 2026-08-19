import axios from 'axios'

const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/h5',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
})

request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

async function handleUnauthorized() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  try {
    // Dynamic import to avoid circular deps
    const { useUserStore } = await import('@/stores/user')
    const userStore = useUserStore()
    userStore.logout()
    userStore.showLoginModal = true
  } catch (err) {
    console.error('[request] failed to reset user session after 401', err)
  }
}

request.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const { method, url } = error.config || {}
    const status = error.response?.status
    console.error(
      `[request] ${String(method || 'GET').toUpperCase()} ${url || '(unknown url)'} failed` +
        (status ? ` with ${status}` : ''),
      error
    )

    if (status === 401) {
      await handleUnauthorized()
    }

    // Surface the server-provided reason on error.message so callers that only
    // read err.message don't report a generic axios string.
    const serverMessage = error.response?.data?.error || error.response?.data?.message
    if (serverMessage) {
      error.message = serverMessage
    }
    return Promise.reject(error)
  }
)

export default request

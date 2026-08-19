import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from 'axios'
import { setActivePinia, createPinia } from 'pinia'
import { useUserStore } from '@/stores/user'

// Mock axios
vi.mock('axios', () => {
  const interceptors = {
    request: { use: vi.fn() },
    response: { use: vi.fn() }
  }
  const instance = {
    interceptors,
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
  }
  return {
    default: {
      create: vi.fn(() => instance)
    }
  }
})

describe('utils/request', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('creates an axios instance with correct defaults', async () => {
    // Re-import to trigger module execution
    vi.resetModules()
    await import('@/utils/request')

    expect(axios.create).toHaveBeenCalledWith(
      expect.objectContaining({
        timeout: 15000,
        headers: { 'Content-Type': 'application/json' }
      })
    )
  })

  it('registers request and response interceptors', async () => {
    vi.resetModules()
    const mod = await import('@/utils/request')
    const instance = mod.default

    expect(instance.interceptors.request.use).toHaveBeenCalledTimes(1)
    expect(instance.interceptors.response.use).toHaveBeenCalledTimes(1)
  })

  it('request interceptor attaches Bearer token from localStorage', async () => {
    vi.resetModules()
    localStorage.setItem('token', 'test-jwt-token')

    await import('@/utils/request')
    const requestFulfill = axios.create().interceptors.request.use.mock.calls[0][0]

    const config = { headers: {} }
    const result = requestFulfill(config)
    expect(result.headers.Authorization).toBe('Bearer test-jwt-token')
  })

  it('request interceptor does not attach token when absent', async () => {
    vi.resetModules()
    localStorage.removeItem('token')

    await import('@/utils/request')
    const requestFulfill = axios.create().interceptors.request.use.mock.calls[0][0]

    const config = { headers: {} }
    const result = requestFulfill(config)
    expect(result.headers.Authorization).toBeUndefined()
  })

  it('response interceptor returns response.data on success', async () => {
    vi.resetModules()
    await import('@/utils/request')
    const responseFulfill = axios.create().interceptors.response.use.mock.calls[0][0]

    const response = { data: { success: true, user: 'alice' } }
    expect(responseFulfill(response)).toEqual({ success: true, user: 'alice' })
  })

  it('request interceptor rejects with the original error', async () => {
    vi.resetModules()
    await import('@/utils/request')
    const requestReject = axios.create().interceptors.request.use.mock.calls[0][1]

    const error = new Error('bad config')
    await expect(requestReject(error)).rejects.toThrow('bad config')
  })

  it('response interceptor clears the session and opens the login modal on 401', async () => {
    vi.resetModules()
    setActivePinia(createPinia())
    localStorage.setItem('token', 'expired-token')
    localStorage.setItem('user', JSON.stringify({ phone: '138****5678' }))

    await import('@/utils/request')
    const responseReject = axios.create().interceptors.response.use.mock.calls[0][1]

    const error = { response: { status: 401 } }
    await expect(responseReject(error)).rejects.toBe(error)

    expect(localStorage.getItem('token')).toBeNull()
    expect(localStorage.getItem('user')).toBeNull()

    // The store is updated from a dynamic import inside the interceptor
    await vi.waitFor(() => {
      const userStore = useUserStore()
      expect(userStore.showLoginModal).toBe(true)
      expect(userStore.isLoggedIn).toBe(false)
    })
  })

  it('response interceptor leaves the session alone for non-401 errors', async () => {
    vi.resetModules()
    localStorage.setItem('token', 'valid-token')

    await import('@/utils/request')
    const responseReject = axios.create().interceptors.response.use.mock.calls[0][1]

    const error = { response: { status: 500 } }
    await expect(responseReject(error)).rejects.toBe(error)
    expect(localStorage.getItem('token')).toBe('valid-token')
  })

  it('response interceptor handles network errors without a response', async () => {
    vi.resetModules()
    localStorage.setItem('token', 'valid-token')

    await import('@/utils/request')
    const responseReject = axios.create().interceptors.response.use.mock.calls[0][1]

    const error = new Error('Network Error')
    await expect(responseReject(error)).rejects.toThrow('Network Error')
    expect(localStorage.getItem('token')).toBe('valid-token')
  })
})

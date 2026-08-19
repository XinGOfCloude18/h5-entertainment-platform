import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

vi.mock('@/api/app', () => ({
  getBannersApi: vi.fn(),
  getAnnouncementsApi: vi.fn(),
  getAppConfigApi: vi.fn()
}))

import { getBannersApi, getAnnouncementsApi, getAppConfigApi } from '@/api/app'
import { useAppStore } from '@/stores/app'

describe('stores/app', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  it('initializes with default banners and announcements', () => {
    const store = useAppStore()
    expect(store.banners.length).toBeGreaterThan(0)
    expect(store.announcements.length).toBeGreaterThan(0)
    expect(store.config).toEqual({})
    expect(store.loading).toBe(false)
  })

  it('fetchBanners() replaces defaults with API data', async () => {
    const remote = [{ id: 'r1', title: 'remote banner' }]
    getBannersApi.mockResolvedValue(remote)

    const store = useAppStore()
    const result = await store.fetchBanners()

    expect(result).toEqual(remote)
    expect(store.banners).toEqual(remote)
  })

  it('fetchBanners() keeps defaults when API returns an empty list', async () => {
    getBannersApi.mockResolvedValue([])

    const store = useAppStore()
    const before = store.banners
    const result = await store.fetchBanners()

    expect(result).toEqual(before)
    expect(store.banners.length).toBeGreaterThan(0)
  })

  it('fetchBanners() falls back to defaults when API rejects', async () => {
    getBannersApi.mockRejectedValue(new Error('offline'))

    const store = useAppStore()
    store.banners = []
    const result = await store.fetchBanners()

    expect(result.length).toBeGreaterThan(0)
    expect(store.banners.length).toBeGreaterThan(0)
  })

  it('fetchAnnouncements() replaces defaults with API data', async () => {
    const remote = [{ id: 'r1', content: 'remote notice' }]
    getAnnouncementsApi.mockResolvedValue(remote)

    const store = useAppStore()
    await store.fetchAnnouncements()

    expect(store.announcements).toEqual(remote)
  })

  it('fetchAnnouncements() falls back to defaults when API rejects and list is empty', async () => {
    getAnnouncementsApi.mockRejectedValue(new Error('offline'))

    const store = useAppStore()
    store.announcements = []
    const result = await store.fetchAnnouncements()

    expect(result.length).toBeGreaterThan(0)
  })

  it('fetchConfig() stores API config', async () => {
    getAppConfigApi.mockResolvedValue({ siteName: 'Remote Site' })

    const store = useAppStore()
    const result = await store.fetchConfig()

    expect(result).toEqual({ siteName: 'Remote Site' })
    expect(store.config).toEqual({ siteName: 'Remote Site' })
  })

  it('fetchConfig() uses fallback config when API returns falsy', async () => {
    getAppConfigApi.mockResolvedValue(null)

    const store = useAppStore()
    const result = await store.fetchConfig()

    expect(result).toEqual({
      siteName: 'H5 Entertainment',
      customerService: 'https://t.me/support',
      downloadUrl: '#'
    })
  })

  it('fetchConfig() uses fallback config when API rejects', async () => {
    getAppConfigApi.mockRejectedValue(new Error('offline'))

    const store = useAppStore()
    const result = await store.fetchConfig()

    expect(result.siteName).toBe('H5 Entertainment')
  })

  it('initApp() fetches everything and resets loading', async () => {
    getBannersApi.mockResolvedValue([{ id: 'r1' }])
    getAnnouncementsApi.mockResolvedValue([{ id: 'a1' }])
    getAppConfigApi.mockResolvedValue({ siteName: 'Remote Site' })

    const store = useAppStore()
    const pending = store.initApp()
    expect(store.loading).toBe(true)

    await pending

    expect(store.loading).toBe(false)
    expect(getBannersApi).toHaveBeenCalledTimes(1)
    expect(getAnnouncementsApi).toHaveBeenCalledTimes(1)
    expect(getAppConfigApi).toHaveBeenCalledTimes(1)
  })

  it('initApp() resets loading even when every API fails', async () => {
    getBannersApi.mockRejectedValue(new Error('offline'))
    getAnnouncementsApi.mockRejectedValue(new Error('offline'))
    getAppConfigApi.mockRejectedValue(new Error('offline'))

    const store = useAppStore()
    await store.initApp()

    expect(store.loading).toBe(false)
  })
})

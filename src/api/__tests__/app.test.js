import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/utils/request', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn()
  }
}))

import request from '@/utils/request'
import { getBannersApi, getAnnouncementsApi, getAppConfigApi, getSupportInfoApi } from '@/api/app'

describe('api/app', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('getBannersApi() calls GET /app/banners', async () => {
    const banners = [{ id: 'b1', title: 'promo' }]
    request.get.mockResolvedValue(banners)

    await expect(getBannersApi()).resolves.toEqual(banners)
    expect(request.get).toHaveBeenCalledWith('/app/banners')
  })

  it('getAnnouncementsApi() calls GET /app/announcements', async () => {
    request.get.mockResolvedValue([{ id: 'a1', content: 'notice' }])

    await getAnnouncementsApi()
    expect(request.get).toHaveBeenCalledWith('/app/announcements')
  })

  it('getAppConfigApi() calls GET /app/config', async () => {
    request.get.mockResolvedValue({ siteName: 'H5' })

    await expect(getAppConfigApi()).resolves.toEqual({ siteName: 'H5' })
    expect(request.get).toHaveBeenCalledWith('/app/config')
  })

  it('getSupportInfoApi() calls GET /app/support', async () => {
    request.get.mockResolvedValue({ telegram: 'https://t.me/support' })

    await getSupportInfoApi()
    expect(request.get).toHaveBeenCalledWith('/app/support')
  })

  it('propagates request errors', async () => {
    request.get.mockRejectedValue(new Error('network down'))

    await expect(getBannersApi()).rejects.toThrow('network down')
  })
})

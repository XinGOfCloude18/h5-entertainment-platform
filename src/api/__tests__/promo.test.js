import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/utils/request', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn()
  }
}))

import request from '@/utils/request'
import { getPromotionsApi, getPromotionDetailApi, applyPromotionApi } from '@/api/promo'

describe('api/promo', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('getPromotionsApi() calls GET /promotions with params', async () => {
    request.get.mockResolvedValue([{ id: 1 }])

    await expect(getPromotionsApi({ type: 'deposit' })).resolves.toEqual([{ id: 1 }])
    expect(request.get).toHaveBeenCalledWith('/promotions', { params: { type: 'deposit' } })
  })

  it('getPromotionDetailApi() calls GET /promotions/:id', async () => {
    request.get.mockResolvedValue({ id: 7 })

    await getPromotionDetailApi(7)
    expect(request.get).toHaveBeenCalledWith('/promotions/7')
  })

  it('applyPromotionApi() calls POST /promotions/:id/claim', async () => {
    request.post.mockResolvedValue({ success: true })

    await expect(applyPromotionApi(7)).resolves.toEqual({ success: true })
    expect(request.post).toHaveBeenCalledWith('/promotions/7/claim')
  })

  it('propagates claim errors', async () => {
    request.post.mockRejectedValue(new Error('already claimed'))

    await expect(applyPromotionApi(7)).rejects.toThrow('already claimed')
  })
})

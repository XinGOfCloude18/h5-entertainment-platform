import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/utils/request', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn()
  }
}))

import request from '@/utils/request'
import {
  getGamesApi,
  getGameDetailApi,
  getGameCategoriesApi,
  getProvidersApi,
  launchGameApi,
  demoGameApi,
  getSK7755GamesApi,
  launchSK7755GameApi
} from '@/api/game'

describe('api/game', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('getGamesApi() calls GET /games with params', async () => {
    request.get.mockResolvedValue({ list: [] })

    await getGamesApi({ category: 'slots', page: 2 })
    expect(request.get).toHaveBeenCalledWith('/games', { params: { category: 'slots', page: 2 } })
  })

  it('getGamesApi() passes undefined params through', async () => {
    request.get.mockResolvedValue({ list: [] })

    await getGamesApi()
    expect(request.get).toHaveBeenCalledWith('/games', { params: undefined })
  })

  it('getGameDetailApi() calls GET /games/:id', async () => {
    request.get.mockResolvedValue({ id: 42 })

    await expect(getGameDetailApi(42)).resolves.toEqual({ id: 42 })
    expect(request.get).toHaveBeenCalledWith('/games/42')
  })

  it('getGameCategoriesApi() calls GET /games/categories', async () => {
    request.get.mockResolvedValue([])

    await getGameCategoriesApi()
    expect(request.get).toHaveBeenCalledWith('/games/categories')
  })

  it('getProvidersApi() calls GET /games/providers with category param', async () => {
    request.get.mockResolvedValue([])

    await getProvidersApi('live')
    expect(request.get).toHaveBeenCalledWith('/games/providers', { params: { category: 'live' } })
  })

  it('launchGameApi() calls POST /games/:id/launch', async () => {
    request.post.mockResolvedValue({ url: 'https://game' })

    await expect(launchGameApi('g1')).resolves.toEqual({ url: 'https://game' })
    expect(request.post).toHaveBeenCalledWith('/games/g1/launch')
  })

  it('demoGameApi() calls POST /games/:id/demo', async () => {
    request.post.mockResolvedValue({ url: 'https://demo' })

    await demoGameApi('g1')
    expect(request.post).toHaveBeenCalledWith('/games/g1/demo')
  })

  it('getSK7755GamesApi() calls GET /sk7755/games with category param', async () => {
    request.get.mockResolvedValue({ list: [] })

    await getSK7755GamesApi('slot')
    expect(request.get).toHaveBeenCalledWith('/sk7755/games', { params: { category: 'slot' } })
  })

  it('launchSK7755GameApi() calls POST /sk7755/launch with platform and game_code', async () => {
    request.post.mockResolvedValue({ url: 'https://sk' })

    await launchSK7755GameApi('PG', 'pg-001')
    expect(request.post).toHaveBeenCalledWith('/sk7755/launch', { platform: 'PG', game_code: 'pg-001' })
  })

  it('propagates launch errors', async () => {
    request.post.mockRejectedValue(new Error('game unavailable'))

    await expect(launchGameApi('g1')).rejects.toThrow('game unavailable')
  })
})

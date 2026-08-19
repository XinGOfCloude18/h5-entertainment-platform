import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

vi.mock('@/api/game', () => ({
  getGamesApi: vi.fn(),
  getSK7755GamesApi: vi.fn()
}))

import { getGamesApi, getSK7755GamesApi } from '@/api/game'
import { useGameStore } from '@/stores/game'

const localGames = [
  { id: '1', category: 'slot', hot: true },
  { id: '2', category: 'live' },
  { id: '3', category: 'card' }
]

describe('stores/game', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    getSK7755GamesApi.mockResolvedValue({ list: [] })
  })

  it('initializes empty with default categories', () => {
    const store = useGameStore()
    expect(store.games).toEqual([])
    expect(store.sk7755Games).toEqual([])
    expect(store.categories.map(c => c.id)).toContain('slots')
    expect(store.loading).toBe(false)
  })

  it('fetchGames() stores a plain array response and clears loading', async () => {
    getGamesApi.mockResolvedValue(localGames)

    const store = useGameStore()
    const result = await store.fetchGames()

    expect(result).toEqual(localGames)
    expect(store.games).toEqual(localGames)
    expect(store.loading).toBe(false)
  })

  it('fetchGames() unwraps a paginated { list } response', async () => {
    getGamesApi.mockResolvedValue({ list: localGames, total: 3 })

    const store = useGameStore()
    await store.fetchGames()

    expect(store.games).toEqual(localGames)
  })

  it('fetchGames() does not overwrite the cache for filtered queries', async () => {
    getGamesApi.mockResolvedValue({ list: [{ id: '9', category: 'slot' }] })

    const store = useGameStore()
    await store.fetchGames({ category: 'slots' })

    expect(store.games).toEqual([])
    expect(getGamesApi).toHaveBeenCalledWith({ category: 'slots' })
  })

  it('fetchGames() survives API failures and still loads SK7755 games', async () => {
    getGamesApi.mockRejectedValue(new Error('offline'))
    getSK7755GamesApi.mockResolvedValue({ list: [{ id: 's1', category: 'slot' }] })

    const store = useGameStore()
    await store.fetchGames()

    expect(store.games).toEqual([])
    expect(store.sk7755Games).toHaveLength(1)
    expect(store.loading).toBe(false)
  })

  it('fetchSK7755Games() tags games with their source', async () => {
    getSK7755GamesApi.mockResolvedValue({ list: [{ id: 's1', category: 'fish' }] })

    const store = useGameStore()
    await store.fetchSK7755Games()

    expect(store.sk7755Games[0]).toEqual({ id: 's1', category: 'fish', source: 'sk7755' })
  })

  it('fetchSK7755Games() defaults to an empty list when the response has no list', async () => {
    getSK7755GamesApi.mockResolvedValue({})

    const store = useGameStore()
    await store.fetchSK7755Games()

    expect(store.sk7755Games).toEqual([])
  })

  it('fetchSK7755Games() swallows API failures', async () => {
    getSK7755GamesApi.mockRejectedValue(new Error('offline'))

    const store = useGameStore()
    await store.fetchSK7755Games()

    expect(store.sk7755Games).toEqual([])
  })

  it('hotGames merges local hot flags with SK7755 hot games', async () => {
    getGamesApi.mockResolvedValue(localGames)
    getSK7755GamesApi.mockResolvedValue({
      list: [{ id: 's1', category: 'slot', is_hot: true }, { id: 's2', category: 'slot' }]
    })

    const store = useGameStore()
    await store.fetchGames()

    expect(store.hotGames.map(g => g.id)).toEqual(['1', 's1'])
  })

  it('getGamesByCategory() returns hot games for the home and hot tabs', async () => {
    getGamesApi.mockResolvedValue([{ id: '1', category: 'slot', is_hot: true }])

    const store = useGameStore()
    await store.fetchGames()

    expect(store.getGamesByCategory('home').map(g => g.id)).toEqual(['1'])
    expect(store.getGamesByCategory('hot').map(g => g.id)).toEqual(['1'])
  })

  it('getGamesByCategory() maps SK7755 category codes onto H5 tabs', async () => {
    getGamesApi.mockResolvedValue(localGames)
    getSK7755GamesApi.mockResolvedValue({ list: [{ id: 's1', category: 'egame' }] })

    const store = useGameStore()
    await store.fetchGames()

    expect(store.getGamesByCategory('slots').map(g => g.id)).toEqual(['1', 's1'])
    expect(store.getGamesByCategory('chess').map(g => g.id)).toEqual(['3'])
    expect(store.getGamesByCategory('sports')).toEqual([])
  })

  it('getGamesByCategory() keeps unmapped categories as-is', async () => {
    getGamesApi.mockResolvedValue([{ id: '4', category: 'custom' }])

    const store = useGameStore()
    await store.fetchGames()

    expect(store.getGamesByCategory('custom').map(g => g.id)).toEqual(['4'])
  })

  it('getGameById() finds local games, SK7755 games, and returns null otherwise', async () => {
    getGamesApi.mockResolvedValue(localGames)
    getSK7755GamesApi.mockResolvedValue({ list: [{ id: 's1', category: 'slot' }] })

    const store = useGameStore()
    await store.fetchGames()

    expect(store.getGameById('2').id).toBe('2')
    expect(store.getGameById(2).id).toBe('2')
    expect(store.getGameById('s1').id).toBe('s1')
    expect(store.getGameById('nope')).toBeNull()
  })
})

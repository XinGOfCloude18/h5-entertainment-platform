import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

vi.mock('@/api/wallet', () => ({
  getBalanceApi: vi.fn(),
  depositApi: vi.fn(),
  withdrawApi: vi.fn(),
  getTransactionsApi: vi.fn()
}))

import { getBalanceApi, depositApi, withdrawApi } from '@/api/wallet'
import { useWalletStore } from '@/stores/wallet'

describe('stores/wallet', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('initializes with zero balance and no transactions', () => {
    const store = useWalletStore()
    expect(store.balance).toBe(0)
    expect(store.transactions).toEqual([])
  })

  it('fetchBalance() stores the balance from the API', async () => {
    getBalanceApi.mockResolvedValue({ balance: 320.5 })

    const store = useWalletStore()
    const result = await store.fetchBalance()

    expect(result).toBe(320.5)
    expect(store.balance).toBe(320.5)
  })

  it('fetchBalance() keeps the current balance when the API omits it', async () => {
    getBalanceApi.mockResolvedValue({})

    const store = useWalletStore()
    store.balance = 42
    const result = await store.fetchBalance()

    expect(result).toBe(42)
  })

  it('deposit() uses the server balance and records a success transaction', async () => {
    depositApi.mockResolvedValue({ balance: 150, id: 'tx-1' })

    const store = useWalletStore()
    const result = await store.deposit('100')

    expect(depositApi).toHaveBeenCalledWith({ amount: 100 })
    expect(result).toEqual({ success: true, balance: 150 })
    expect(store.balance).toBe(150)
    expect(store.transactions[0]).toMatchObject({
      id: 'tx-1',
      type: 'deposit',
      amount: 100,
      status: 'success'
    })
  })

  it('deposit() adds the amount locally when the server omits the balance', async () => {
    depositApi.mockResolvedValue({})

    const store = useWalletStore()
    store.balance = 20
    await store.deposit(30)

    expect(store.balance).toBe(50)
    expect(typeof store.transactions[0].id).toBe('number')
  })

  it('withdraw() uses the server balance and records a pending transaction', async () => {
    withdrawApi.mockResolvedValue({ balance: 60, id: 'tx-2' })

    const store = useWalletStore()
    const result = await store.withdraw('40')

    expect(withdrawApi).toHaveBeenCalledWith({ amount: 40 })
    expect(result).toEqual({ success: true, balance: 60 })
    expect(store.transactions[0]).toMatchObject({
      id: 'tx-2',
      type: 'withdraw',
      amount: 40,
      status: 'pending'
    })
  })

  it('withdraw() subtracts the amount locally when the server omits the balance', async () => {
    withdrawApi.mockResolvedValue({})

    const store = useWalletStore()
    store.balance = 100
    await store.withdraw(25)

    expect(store.balance).toBe(75)
  })

  it('newest transaction is first', async () => {
    depositApi.mockResolvedValue({ balance: 10, id: 'tx-a' })
    withdrawApi.mockResolvedValue({ balance: 5, id: 'tx-b' })

    const store = useWalletStore()
    await store.deposit(10)
    await store.withdraw(5)

    expect(store.transactions.map(t => t.id)).toEqual(['tx-b', 'tx-a'])
  })

  it('deposit() propagates API errors without recording a transaction', async () => {
    depositApi.mockRejectedValue(new Error('gateway error'))

    const store = useWalletStore()
    await expect(store.deposit(10)).rejects.toThrow('gateway error')
    expect(store.transactions).toEqual([])
  })
})

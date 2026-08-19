import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/utils/request', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn()
  }
}))

import request from '@/utils/request'
import { getBalanceApi, depositApi, withdrawApi, getTransactionsApi } from '@/api/wallet'

describe('api/wallet', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('getBalanceApi() calls GET /wallet/balance', async () => {
    request.get.mockResolvedValue({ balance: 250 })

    await expect(getBalanceApi()).resolves.toEqual({ balance: 250 })
    expect(request.get).toHaveBeenCalledWith('/wallet/balance')
  })

  it('depositApi() calls POST /wallet/deposit with data', async () => {
    request.post.mockResolvedValue({ balance: 350 })

    await depositApi({ amount: 100 })
    expect(request.post).toHaveBeenCalledWith('/wallet/deposit', { amount: 100 })
  })

  it('withdrawApi() calls POST /wallet/withdraw with data', async () => {
    request.post.mockResolvedValue({ balance: 150 })

    await withdrawApi({ amount: 100, address: 'TXaddr' })
    expect(request.post).toHaveBeenCalledWith('/wallet/withdraw', { amount: 100, address: 'TXaddr' })
  })

  it('getTransactionsApi() calls GET /wallet/transactions with params', async () => {
    request.get.mockResolvedValue({ list: [] })

    await getTransactionsApi({ type: 'deposit', page: 1 })
    expect(request.get).toHaveBeenCalledWith('/wallet/transactions', { params: { type: 'deposit', page: 1 } })
  })

  it('propagates withdraw errors', async () => {
    request.post.mockRejectedValue(new Error('insufficient balance'))

    await expect(withdrawApi({ amount: 1e9 })).rejects.toThrow('insufficient balance')
  })
})

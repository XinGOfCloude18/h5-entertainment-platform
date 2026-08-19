import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/utils/request', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn()
  }
}))

import request from '@/utils/request'
import {
  getProfileApi,
  updateProfileApi,
  getIncomeApi,
  getInviteInfoApi,
  getTasksApi,
  claimTaskApi
} from '@/api/user'

describe('api/user', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('getProfileApi() calls GET /user/profile', async () => {
    request.get.mockResolvedValue({ phone: '138****5678' })

    await expect(getProfileApi()).resolves.toEqual({ phone: '138****5678' })
    expect(request.get).toHaveBeenCalledWith('/user/profile')
  })

  it('updateProfileApi() calls PUT /user/profile with data', async () => {
    request.put.mockResolvedValue({ success: true })

    await updateProfileApi({ nickname: 'alice' })
    expect(request.put).toHaveBeenCalledWith('/user/profile', { nickname: 'alice' })
  })

  it('getIncomeApi() calls GET /user/income with params', async () => {
    request.get.mockResolvedValue({ total: 100 })

    await getIncomeApi({ range: '7d' })
    expect(request.get).toHaveBeenCalledWith('/user/income', { params: { range: '7d' } })
  })

  it('getInviteInfoApi() calls GET /user/invite', async () => {
    request.get.mockResolvedValue({ code: 'INV1' })

    await getInviteInfoApi()
    expect(request.get).toHaveBeenCalledWith('/user/invite')
  })

  it('getTasksApi() calls GET /user/tasks', async () => {
    request.get.mockResolvedValue([{ id: 't1' }])

    await getTasksApi()
    expect(request.get).toHaveBeenCalledWith('/user/tasks')
  })

  it('claimTaskApi() calls POST /user/tasks/:taskId/claim', async () => {
    request.post.mockResolvedValue({ reward: 5 })

    await expect(claimTaskApi('t1')).resolves.toEqual({ reward: 5 })
    expect(request.post).toHaveBeenCalledWith('/user/tasks/t1/claim')
  })

  it('propagates profile update errors', async () => {
    request.put.mockRejectedValue(new Error('invalid nickname'))

    await expect(updateProfileApi({ nickname: '' })).rejects.toThrow('invalid nickname')
  })
})

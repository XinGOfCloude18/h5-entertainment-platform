import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const showToast = vi.fn()
vi.mock('vant', () => ({ showToast: (...args) => showToast(...args) }))

const { copyToClipboard } = await import('@/utils/clipboard')

describe('utils/clipboard', () => {
  const original = navigator.clipboard

  beforeEach(() => {
    showToast.mockClear()
  })

  afterEach(() => {
    Object.defineProperty(navigator, 'clipboard', { value: original, configurable: true })
  })

  function stubClipboard(writeText) {
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true })
  }

  it('writes the text and shows the success toast', async () => {
    const writeText = vi.fn().mockResolvedValue()
    stubClipboard(writeText)

    await expect(copyToClipboard('ABC123', { message: 'Copied!', position: 'bottom' })).resolves.toBe(true)
    expect(writeText).toHaveBeenCalledWith('ABC123')
    expect(showToast).toHaveBeenCalledWith({ message: 'Copied!', position: 'bottom' })
  })

  it('shows a failure toast when the clipboard rejects', async () => {
    stubClipboard(vi.fn().mockRejectedValue(new Error('denied')))

    await expect(copyToClipboard('ABC123')).resolves.toBe(false)
    expect(showToast).toHaveBeenCalledWith({ message: 'Copy failed', type: 'fail', position: undefined })
  })

  it('shows a failure toast when the clipboard API is unavailable', async () => {
    Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true })

    await expect(copyToClipboard('ABC123', { failureMessage: 'Nope' })).resolves.toBe(false)
    expect(showToast).toHaveBeenCalledWith({ message: 'Nope', type: 'fail', position: undefined })
  })
})

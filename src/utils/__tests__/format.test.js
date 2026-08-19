import { describe, it, expect } from 'vitest'
import { formatAmount, formatSigned } from '@/utils/format'

describe('utils/format', () => {
  it('formatAmount() always renders two decimals', () => {
    expect(formatAmount(1234.5)).toBe('1,234.50')
    expect(formatAmount(0)).toBe('0.00')
  })

  it('formatAmount() falls back to zero for invalid input', () => {
    expect(formatAmount(undefined)).toBe('0.00')
    expect(formatAmount('abc')).toBe('0.00')
  })

  it('formatSigned() prefixes positive amounts only', () => {
    expect(formatSigned(12)).toBe('+12.00')
    expect(formatSigned(-3.5)).toBe('-3.50')
    expect(formatSigned(0)).toBe('0.00')
  })
})

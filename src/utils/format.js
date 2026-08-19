// Fixed 2-decimal amount, e.g. 1234.5 -> "1,234.50".
export function formatAmount(value) {
  const n = Number(value) || 0
  return n.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// Signed 2-decimal amount used by bet/transaction lists, e.g. 12 -> "+12.00", -3 -> "-3.00", 0 -> "0.00".
export function formatSigned(value) {
  const n = Number(value) || 0
  return (n > 0 ? '+' : '') + n.toFixed(2)
}

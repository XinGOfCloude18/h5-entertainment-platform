export function formatNumber(value) {
  return (Number(value) || 0).toLocaleString()
}

// Large numbers are shortened to 万 (10k) units, e.g. 25300 -> "2.5万".
export function formatCompact(value) {
  const n = Number(value) || 0
  if (Math.abs(n) < 10000) return formatNumber(n)
  return (n / 10000).toFixed(1) + '万'
}

// Money variant of formatCompact: keeps 2 decimals below the 万 threshold.
export function formatMoney(value) {
  const n = Number(value) || 0
  if (n === 0) return '0'
  if (Math.abs(n) < 10000) return n.toFixed(2)
  return (n / 10000).toFixed(1) + '万'
}

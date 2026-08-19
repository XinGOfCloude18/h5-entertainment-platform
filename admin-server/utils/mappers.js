// Shared snake_case DB row -> camelCase API payload mappers.

export function mapMember(row) {
  if (!row) return row
  return {
    ...row,
    tags: JSON.parse(row.tags || '[]'),
    totalDeposit: row.total_deposit,
    totalWithdraw: row.total_withdraw,
    lastLogin: row.last_login
  }
}

export function mapAgent(row) {
  if (!row) return row
  return {
    ...row,
    created: row.created_at,
    monthRevenue: row.month_revenue,
    shareMode: row.share_mode,
    shareRate: row.share_rate
  }
}

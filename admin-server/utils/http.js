// Shared HTTP helpers used by the admin and H5 route modules.

export function clientIp(req) {
  return req.ip || req.connection?.remoteAddress || '0.0.0.0'
}

export function parsePagination(query = {}, defaultPageSize = 20) {
  const page = Math.max(1, parseInt(query.page) || 1)
  const pageSize = Math.max(1, parseInt(query.pageSize) || defaultPageSize)
  return { page, pageSize, offset: (page - 1) * pageSize }
}

// Same as parsePagination but with a server-fixed page size (client cannot override).
export function parsePage(query = {}, pageSize) {
  const page = Math.max(1, parseInt(query.page) || 1)
  return { page, pageSize, offset: (page - 1) * pageSize }
}

export function csvCell(value) {
  return '"' + String(value ?? '').replace(/"/g, '""') + '"'
}

export function sendCsv(res, filename, headers, rows) {
  const lines = [headers.join(','), ...rows.map(row => row.map(csvCell).join(','))]
  res.setHeader('Content-Type', 'text/csv; charset=utf-8')
  res.setHeader('Content-Disposition', `attachment; filename=${filename}`)
  res.send('\uFEFF' + lines.join('\n'))
}

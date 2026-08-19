import { ElMessage } from 'element-plus'

export function downloadCsv(data, filename) {
  const blob = new Blob([data], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

// Fetches a CSV payload from the API, triggers the browser download and reports the result.
export async function exportCsv(fetchCsv, filename) {
  try {
    const data = await fetchCsv()
    downloadCsv(data, filename)
    ElMessage.success('导出成功')
  } catch (e) {
    ElMessage.error('导出失败')
  }
}

import { ElMessage } from 'element-plus'

export async function copyToClipboard(text, { successMessage = '已复制', failureMessage = '复制失败' } = {}) {
  if (!navigator.clipboard) {
    ElMessage.warning(failureMessage)
    return false
  }
  try {
    await navigator.clipboard.writeText(text)
    ElMessage.success(successMessage)
    return true
  } catch (e) {
    ElMessage.warning(failureMessage)
    return false
  }
}

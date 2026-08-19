import { showToast } from 'vant'

// Copies text to the clipboard and reports the outcome with a Vant toast.
export async function copyToClipboard(text, { message = 'Copied', failureMessage = 'Copy failed', ...toastOptions } = {}) {
  try {
    if (!navigator.clipboard) throw new Error('Clipboard unavailable')
    await navigator.clipboard.writeText(text)
    showToast({ message, ...toastOptions })
    return true
  } catch {
    showToast({ message: failureMessage, type: 'fail', position: toastOptions.position })
    return false
  }
}

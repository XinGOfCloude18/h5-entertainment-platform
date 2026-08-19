const NODE_ENV = process.env.NODE_ENV || 'development'

function format(level, context, message) {
  return '[' + new Date().toISOString() + '] [' + level + '] ' + context + ': ' + message
}

export function logError(context, err) {
  const message = err && err.message ? err.message : String(err)
  console.error(format('ERROR', context, message))
  if (NODE_ENV !== 'production' && err && err.stack) {
    console.error(err.stack)
  }
}

export function logWarn(context, err) {
  const message = err && err.message ? err.message : String(err)
  console.warn(format('WARN', context, message))
}

export default { logError, logWarn }

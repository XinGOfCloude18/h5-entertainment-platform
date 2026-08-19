import crypto from 'crypto'
import { Router } from 'express'
import { processCallback } from './callbackHandler.js'
import { generateSign } from './sign.js'
import config from './config.js'

const router = Router()

// The wallet callback moves player balances, so an unsigned or wrongly signed
// request must never reach the handler.
function verifySign(body) {
  const { sign, ...rest } = body
  if (!sign || typeof sign !== 'string') return false
  let expected
  try {
    expected = generateSign(rest, config.md5Key)
  } catch (err) {
    console.error('[SK7755 Callback] Cannot verify sign:', err.message)
    return false
  }
  const provided = Buffer.from(sign.toLowerCase())
  const target = Buffer.from(expected)
  if (provided.length !== target.length) return false
  return crypto.timingSafeEqual(provided, target)
}

router.post('/wallet', (req, res) => {
  try {
    const body = req.body

    if (!body || !body.action) {
      return res.json({ code: '9999', message: 'Missing action field' })
    }

    if (!verifySign(body)) {
      console.warn(`[SK7755 Callback] Rejected unsigned/invalid callback action=${body.action} ip=${req.ip}`)
      return res.json({ code: '9998', message: 'Invalid sign' })
    }

    const result = processCallback(body)

    return res.json(result)
  } catch (err) {
    console.error('[SK7755 Callback] Error:', err.message)
    return res.json({ code: '9999', message: 'Internal Error' })
  }
})

export default router

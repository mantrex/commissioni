import crypto from 'crypto'

/**
 * Genera un token di sessione firmato con HMAC
 * @param {string} adminId - ID dell'admin
 * @returns {string} Token di sessione codificato in base64
 */
export function createSessionToken(adminId) {
  const sessionSecret = process.env.SESSION_SECRET || 'fallback-secret-key'
  const sessionData = `${adminId}:${Date.now()}`

  const signature = crypto
    .createHmac('sha256', sessionSecret)
    .update(sessionData)
    .digest('hex')

  return Buffer.from(`${sessionData}:${signature}`).toString('base64')
}

/**
 * Verifica e decodifica un token di sessione
 * @param {string} token - Token di sessione da verificare
 * @returns {Object|null} { adminId, timestamp } se valido, null se non valido
 */
export function verifySessionToken(token) {
  if (!token) return null

  try {
    const decoded = Buffer.from(token, 'base64').toString()
    const [adminId, timestamp, signature] = decoded.split(':')

    if (!adminId || !timestamp || !signature) {
      return null
    }

    // Verifica la firma HMAC
    const sessionSecret = process.env.SESSION_SECRET || 'fallback-secret-key'
    const expectedSignature = crypto
      .createHmac('sha256', sessionSecret)
      .update(`${adminId}:${timestamp}`)
      .digest('hex')

    if (signature !== expectedSignature) {
      return null
    }

    // Verifica scadenza (7 giorni)
    const tokenAge = Date.now() - parseInt(timestamp)
    const maxAge = 60 * 60 * 24 * 7 * 1000 // 7 giorni in ms

    if (tokenAge > maxAge) {
      return null
    }

    return { adminId, timestamp: parseInt(timestamp) }

  } catch (error) {
    return null
  }
}

/**
 * Imposta il cookie di sessione nella response
 * @param {H3Event} event - Evento H3
 * @param {string} adminId - ID dell'admin
 */
export function setSessionCookie(event, adminId) {
  const sessionToken = createSessionToken(adminId)

  setCookie(event, 'admin_session', sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 giorni
    path: '/'
  })

  return sessionToken
}

/**
 * Ottiene e verifica il cookie di sessione dalla request
 * @param {H3Event} event - Evento H3
 * @returns {Object|null} { adminId, timestamp } se valido, null se non valido
 */
export function getSessionFromCookie(event) {
  const sessionToken = getCookie(event, 'admin_session')
  return verifySessionToken(sessionToken)
}

/**
 * Rimuove il cookie di sessione
 * @param {H3Event} event - Evento H3
 */
export function clearSessionCookie(event) {
  deleteCookie(event, 'admin_session', {
    path: '/'
  })
}
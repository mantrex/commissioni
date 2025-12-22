import { connectDB } from '~/server/utils/db'
import Admin from '~/server/models/Admin'

export default defineEventHandler(async (event) => {
  await connectDB()

  // Ottiene e verifica la sessione (auto-importato!)
  const session = getSessionFromCookie(event)

  if (!session) {
    throw createError({
      statusCode: 401,
      message: 'Non autenticato'
    })
  }

  try {
    const admin = await Admin.findById(session.adminId).select('-password')

    if (!admin) {
      throw createError({
        statusCode: 401,
        message: 'Utente non trovato'
      })
    }

    return {
      user: {
        id: admin._id,
        username: admin.username,
        lastLogin: admin.lastLogin
      }
    }

  } catch (error) {
    if (error.statusCode) throw error

    throw createError({
      statusCode: 401,
      message: 'Sessione non valida'
    })
  }
})
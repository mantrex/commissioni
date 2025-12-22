import bcrypt from 'bcryptjs'
import { connectDB } from '~/server/utils/db'
import Admin from '~/server/models/Admin'

export default defineEventHandler(async (event) => {
  await connectDB()

  const { username, password } = await readBody(event)

  if (!username || !password) {
    throw createError({
      statusCode: 400,
      message: 'Username e password richiesti'
    })
  }

  try {
    const admin = await Admin.findOne({ username })

    if (!admin) {
      throw createError({
        statusCode: 401,
        message: 'Credenziali non valide'
      })
    }

    const isValidPassword = await bcrypt.compare(password, admin.password)

    if (!isValidPassword) {
      throw createError({
        statusCode: 401,
        message: 'Credenziali non valide'
      })
    }

    // Aggiorna ultimo login
    admin.lastLogin = new Date()
    await admin.save()

    // Imposta cookie di sessione (auto-importato!)
    setSessionCookie(event, admin._id.toString())

    return {
      success: true,
      user: {
        id: admin._id,
        username: admin.username,
        lastLogin: admin.lastLogin
      }
    }

  } catch (error) {
    if (error.statusCode) throw error

    throw createError({
      statusCode: 500,
      message: 'Errore durante il login'
    })
  }
})
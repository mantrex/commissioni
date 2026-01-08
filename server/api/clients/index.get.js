import Client from '~~/server/models/Client'

export default defineEventHandler(async (event) => {
  try {
    const clients = await Client.find()
      .select('firstname lastname company city state vip address cap region tel fax email piva')
      .sort({ lastname: 1, firstname: 1 })
      .lean()

    return {
      success: true,
      clients
    }

  } catch (error) {
    console.error('Errore API clients:', error)
    throw createError({
      statusCode: 500,
      message: 'Errore nel recupero dei clienti',
      data: error.message
    })
  }
})



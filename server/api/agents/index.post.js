import Agent from '~~/server/models/Agent'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)

    // Validazioni
    if (!body.lastname && !body.firstname) {
      throw createError({
        statusCode: 400,
        message: 'Cognome o Nome obbligatori'
      })
    }

    const agentData = {
      firstname: body.firstname || '',
      lastname: body.lastname || ''
    }

    const agent = await Agent.create(agentData)

    return {
      success: true,
      agent,
      message: 'Agente creato con successo'
    }

  } catch (error) {
    console.error('Errore API create agent:', error)

    if (error.statusCode) throw error

    throw createError({
      statusCode: 500,
      message: 'Errore nella creazione dell\'agente',
      data: error.message
    })
  }
})
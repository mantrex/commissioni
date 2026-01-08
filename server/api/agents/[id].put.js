import Agent from '~~/server/models/Agent'

export default defineEventHandler(async (event) => {
  const agentId = getRouterParam(event, 'id')

  try {
    const body = await readBody(event)

    const agent = await Agent.findById(agentId)

    if (!agent) {
      throw createError({
        statusCode: 404,
        message: 'Agente non trovato'
      })
    }

    // Aggiorna campi
    agent.firstname = body.firstname || ''
    agent.lastname = body.lastname || ''

    await agent.save()

    return {
      success: true,
      agent,
      message: 'Agente aggiornato con successo'
    }

  } catch (error) {
    console.error('Errore API update agent:', error)

    if (error.statusCode) throw error

    throw createError({
      statusCode: 500,
      message: 'Errore nell\'aggiornamento dell\'agente',
      data: error.message
    })
  }
})
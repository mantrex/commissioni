import Agent from '~~/server/models/Agent'

export default defineEventHandler(async (event) => {
  try {
    const agents = await Agent.find()
      .select('firstname lastname')
      .sort({ lastname: 1, firstname: 1 })
      .lean()

    const formatted = agents.map(agent => ({
      value: agent._id.toString(),
      label: `${agent.lastname || ''} ${agent.firstname || ''}`.trim() || 'N/A'
    }))

    return {
      success: true,
      agents: formatted
    }

  } catch (error) {
    console.error('Errore API agents:', error)
    throw createError({
      statusCode: 500,
      message: 'Errore nel recupero degli agenti',
      data: error.message
    })
  }
})
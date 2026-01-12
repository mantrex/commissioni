// server/api/lists/statuses.get.js
import Status from '~~/server/models/Status'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const onlySelectable = query.selectable !== 'false' // default true

    const filter = onlySelectable ? { selectable: true } : {}

    const statuses = await Status.find(filter)
      .select('code label selectable')
      .sort({ label: 1 })
      .lean()

    // Formato per select/dropdown
    const formatted = statuses.map(s => ({
      label: s.label,
      value: s.code,
      code: s.code,
      selectable: s.selectable
    }))

    return {
      success: true,
      statuses: formatted
    }

  } catch (error) {
    console.error('Errore API statuses:', error)
    throw createError({
      statusCode: 500,
      message: 'Errore nel recupero degli stati',
      data: error.message
    })
  }
})
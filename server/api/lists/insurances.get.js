// server/api/lists/insurances.get.js
import Insurance from '~~/server/models/Insurance'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const onlySelectable = query.selectable !== 'false'

    const filter = onlySelectable ? { selectable: true } : {}

    const insurances = await Insurance.find(filter)
      .select('code label selectable')
      .sort({ label: 1 })
      .lean()

    const formatted = insurances.map(i => ({
      label: i.label,
      value: i.code,
      code: i.code,
      selectable: i.selectable
    }))

    return {
      success: true,
      insurances: formatted
    }
  } catch (error) {
    console.error('Errore API insurances:', error)
    throw createError({
      statusCode: 500,
      message: 'Errore nel recupero delle assicurazioni'
    })
  }
})
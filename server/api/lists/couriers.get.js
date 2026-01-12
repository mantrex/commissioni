// server/api/lists/couriers.get.js
import Courier from '~~/server/models/Courier'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const onlySelectable = query.selectable !== 'false' // default true

    const filter = onlySelectable ? { selectable: true } : {}

    const couriers = await Courier.find(filter)
      .select('code label selectable')
      .sort({ label: 1 })
      .lean()

    // Formato per select/dropdown
    const formatted = couriers.map(c => ({
      label: c.label,
      value: c.code,
      code: c.code,
      selectable: c.selectable
    }))

    return {
      success: true,
      couriers: formatted
    }

  } catch (error) {
    console.error('Errore API couriers:', error)
    throw createError({
      statusCode: 500,
      message: 'Errore nel recupero dei corrieri',
      data: error.message
    })
  }
})
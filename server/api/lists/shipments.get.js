// server/api/lists/shipments.get.js
import Shipment from '~~/server/models/Shipment'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const onlySelectable = query.selectable !== 'false'

    const filter = onlySelectable ? { selectable: true } : {}

    const shipments = await Shipment.find(filter)
      .select('code label selectable')
      .sort({ label: 1 })
      .lean()

    const formatted = shipments.map(s => ({
      label: s.label,
      value: s.code,
      code: s.code,
      selectable: s.selectable
    }))

    return {
      success: true,
      shipments: formatted
    }
  } catch (error) {
    console.error('Errore API shipments:', error)
    throw createError({
      statusCode: 500,
      message: 'Errore nel recupero delle spedizioni'
    })
  }
})
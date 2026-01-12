// server/api/lists/payments.get.js
import Payment from '~~/server/models/Payment'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const onlySelectable = query.selectable !== 'false'

    const filter = onlySelectable ? { selectable: true } : {}

    const payments = await Payment.find(filter)
      .select('code label selectable')
      .sort({ label: 1 })
      .lean()

    const formatted = payments.map(p => ({
      label: p.label,
      value: p.code,
      code: p.code,
      selectable: p.selectable
    }))

    return {
      success: true,
      payments: formatted
    }
  } catch (error) {
    console.error('Errore API payments:', error)
    throw createError({
      statusCode: 500,
      message: 'Errore nel recupero dei pagamenti'
    })
  }
})
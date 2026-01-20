import Invoice from '~~/server/models/Invoice'
import '~~/server/models/Client'
import '~~/server/models/Product'
import '~~/server/models/Order'

export default defineEventHandler(async (event) => {
  const invoiceId = getRouterParam(event, 'id')

  try {
    const invoice = await Invoice.findById(invoiceId)
      .populate('orderId', 'commNum')
      .populate('items.productId', 'code name details')
      .lean()

    if (!invoice) {
      throw createError({
        statusCode: 404,
        message: 'Fattura non trovata'
      })
    }

    return {
      success: true,
      invoice
    }

  } catch (error) {
    console.error('Errore API get invoice:', error)

    if (error.statusCode) throw error

    throw createError({
      statusCode: 500,
      message: 'Errore nel recupero della fattura',
      data: error.message
    })
  }
})
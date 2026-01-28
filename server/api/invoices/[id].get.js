import Invoice from '~~/server/models/Invoice'
import '~~/server/models/Order'
import '~~/server/models/Client'
import '~~/server/models/Product'

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id')

    if (!id) {
      throw createError({
        statusCode: 400,
        message: 'ID fattura obbligatorio'
      })
    }

    console.log('📄 Caricamento fattura:', id)

    const invoice = await Invoice.findById(id)
      .populate('orderId', 'commNum')
      .populate('items.productId', 'code name details')
      .lean()

    if (!invoice) {
      throw createError({
        statusCode: 404,
        message: 'Fattura non trovata'
      })
    }

    console.log('✅ Fattura caricata:', invoice.invoiceId)

    return {
      success: true,
      invoice
    }

  } catch (error) {
    console.error('❌ Errore API get invoice:', error)

    if (error.statusCode) throw error

    throw createError({
      statusCode: 500,
      message: 'Errore nel caricamento della fattura',
      data: error.message
    })
  }
})
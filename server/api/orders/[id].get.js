import Order from '~~/server/models/Order'
import '~~/server/models/Client'
import '~~/server/models/Agent'
import '~~/server/models/Product'

export default defineEventHandler(async (event) => {
  const orderId = getRouterParam(event, 'id')

  try {
    const order = await Order.findById(orderId)
      .populate('clientId', 'firstname lastname company address cap city region state tel fax email piva vip')
      .populate('agentId', 'firstname lastname')
      .populate('items.productId', 'code name details')
      .lean()

    if (!order) {
      throw createError({
        statusCode: 404,
        message: 'Ordine non trovato'
      })
    }

    return {
      success: true,
      order
    }

  } catch (error) {
    console.error('Errore API get order:', error)

    if (error.statusCode) throw error

    throw createError({
      statusCode: 500,
      message: 'Errore nel recupero dell\'ordine',
      data: error.message
    })
  }
})
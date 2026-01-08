import Order from '~~/server/models/Order'

export default defineEventHandler(async (event) => {
  const orderId = getRouterParam(event, 'id')

  try {
    const body = await readBody(event)

    const order = await Order.findById(orderId)

    if (!order) {
      throw createError({
        statusCode: 404,
        message: 'Ordine non trovato'
      })
    }

    // Aggiorna campi dati ordine
    if (body.orderData) {
      order.date = body.orderData.date || order.date
      order.dueDate = body.orderData.dueDate
      order.agentId = body.orderData.agentId
      order.status = body.orderData.status || order.status
    }

    // Aggiorna cliente
    if (body.client && body.client._id) {
      order.clientId = body.client._id
    }

    // Aggiorna spedizioni (filtra righe vuote)
    if (body.shipments) {
      order.shipments = body.shipments.filter(s => s.date || s.courier)
    }

    // Aggiorna note (filtra righe vuote)
    if (body.notes) {
      order.notes = body.notes.filter(n => n.text)
    }

    // Aggiorna articoli
    if (body.items) {
      order.items = body.items.map(item => ({
        productId: item.productId || null,
        quantity: item.quantity || 0,
        ready: item.ready || false,
        invoiced: item.invoiced || 0,
        ordered: item.ordered || false
      }))
    }

    // Aggiorna dati finanziari
    if (body.financial) {
      order.ca = body.financial.ca || 0
      order.rd = body.financial.rd || 0
      order.ric = body.financial.ric || 0
      order.balance = body.financial.balance || 0
      order.pay = body.financial.pay || 0
    }

    await order.save()

    return {
      success: true,
      order,
      message: 'Ordine aggiornato con successo'
    }

  } catch (error) {
    console.error('Errore API update order:', error)

    if (error.statusCode) throw error

    throw createError({
      statusCode: 500,
      message: 'Errore nell\'aggiornamento dell\'ordine',
      data: error.message
    })
  }
})
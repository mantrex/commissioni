// server/api/orders/[id].put.js
import Order from '~~/server/models/Order'

export default defineEventHandler(async (event) => {
  const orderId = getRouterParam(event, 'id')

  console.log('🔵 ========== API PUT /api/orders/' + orderId + ' ==========')

  try {
    const body = await readBody(event)

    console.log('📥 Body ricevuto:', JSON.stringify(body, null, 2))
    console.log('📦 body.items:', body.items)
    console.log('📊 body.items.length:', body.items?.length)

    const order = await Order.findById(orderId)

    if (!order) {
      throw createError({
        statusCode: 404,
        message: 'Ordine non trovato'
      })
    }

    console.log('📋 Ordine PRIMA delle modifiche:')
    console.log('  - items.length:', order.items.length)
    if (order.items.length > 0) {
      console.log('  - items[0]:', JSON.stringify(order.items[0], null, 2))
    }

    // Aggiorna campi dati ordine
    if (body.orderData) {
      console.log('✏️ Aggiorno orderData')
      order.date = body.orderData.date || order.date
      order.dueDate = body.orderData.dueDate
      order.agentId = body.orderData.agentId
      order.status = body.orderData.status || order.status
    }

    // Aggiorna cliente
    if (body.client && body.client._id) {
      console.log('✏️ Aggiorno cliente:', body.client._id)
      order.clientId = body.client._id
    }

    // Aggiorna spedizioni (filtra righe vuote)
    if (body.shipments) {
      console.log('✏️ Aggiorno shipments:', body.shipments.length, 'totali')
      order.shipments = body.shipments.filter(s => s.date || s.courier)
      console.log('   Salvate:', order.shipments.length)
    }

    // Aggiorna note (filtra righe vuote)
    if (body.notes) {
      console.log('✏️ Aggiorno notes:', body.notes.length, 'totali')
      order.notes = body.notes.filter(n => n.text)
      console.log('   Salvate:', order.notes.length)
    }

    // ✅ Aggiorna articoli
    if (body.items) {
      console.log('✏️ Aggiorno items:', body.items.length, 'totali')
      order.items = body.items.map((item, idx) => {
        const mapped = {
          productId: item.productId || null,
          code: item.code || '',
          description: item.description || '',
          quantity: item.quantity || 0,
          ready: item.ready || false,
          invoiced: item.invoiced || 0,
          ordered: item.ordered || false,
          note: item.note || ''
        }
        console.log(`   Item[${idx}]:`, JSON.stringify(mapped, null, 2))
        return mapped
      })
    }

    // Aggiorna dati finanziari
    if (body.financial) {
      console.log('✏️ Aggiorno financial')
      order.ca = body.financial.ca || 0
      order.rd = body.financial.rd || 0
      order.ric = body.financial.ric || 0
      order.balance = body.financial.balance || 0
      order.pay = body.financial.pay || 0
    }

    console.log('💾 Salvo ordine nel database...')
    await order.save()
    console.log('✅ Ordine salvato con successo')

    console.log('📋 Ordine DOPO il salvataggio:')
    console.log('  - items.length:', order.items.length)
    if (order.items.length > 0) {
      console.log('  - items[0]:', JSON.stringify(order.items[0], null, 2))
    }

    console.log('🔵 ========== FINE API PUT ==========')

    return {
      success: true,
      order,
      message: 'Ordine aggiornato con successo'
    }

  } catch (error) {
    console.error('❌ ERRORE API update order:', error)
    console.error('Stack:', error.stack)

    if (error.statusCode) throw error

    throw createError({
      statusCode: 500,
      message: 'Errore nell\'aggiornamento dell\'ordine',
      data: error.message
    })
  }
})
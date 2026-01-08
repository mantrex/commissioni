import Order from '~~/server/models/Order'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)

    // Validazioni base
    if (!body.client || !body.client._id) {
      throw createError({
        statusCode: 400,
        message: 'Cliente obbligatorio'
      })
    }

    // Genera numero commissione se non presente
    let commNum = body.commNum
    if (!commNum) {
      commNum = await generateCommNum()
    }

    // Prepara dati ordine
    const orderData = {
      commNum,
      date: body.orderData?.date || new Date(),
      dueDate: body.orderData?.dueDate || null,
      clientId: body.client._id,
      agentId: body.orderData?.agentId || null,
      status: body.orderData?.status || 'APERTA',
      shipments: (body.shipments || []).filter(s => s.date || s.courier),
      notes: (body.notes || []).filter(n => n.text),
      items: (body.items || []).map(item => ({
        productId: item.productId || null,
        quantity: item.quantity || 0,
        ready: item.ready || false,
        invoiced: item.invoiced || 0,
        ordered: item.ordered || false
      })),
      ca: body.financial?.ca || 0,
      rd: body.financial?.rd || 0,
      ric: body.financial?.ric || 0,
      balance: body.financial?.balance || 0,
      pay: body.financial?.pay || 0
    }

    const order = await Order.create(orderData)

    return {
      success: true,
      order,
      message: 'Ordine creato con successo'
    }

  } catch (error) {
    console.error('Errore API create order:', error)

    if (error.statusCode) throw error

    throw createError({
      statusCode: 500,
      message: 'Errore nella creazione dell\'ordine',
      data: error.message
    })
  }
})

// Genera numero commissione progressivo
async function generateCommNum() {
  const lastOrder = await Order.findOne().sort({ commNum: -1 }).lean()

  if (!lastOrder || !lastOrder.commNum) {
    return '00001'
  }

  const lastNum = parseInt(lastOrder.commNum)
  const newNum = lastNum + 1

  return String(newNum).padStart(5, '0')
}
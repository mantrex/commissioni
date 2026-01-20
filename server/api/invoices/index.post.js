import Invoice from '~~/server/models/Invoice'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)

    // Validazioni
    if (!body.client || (!body.client.lastname && !body.client.company)) {
      throw createError({
        statusCode: 400,
        message: 'Dati cliente obbligatori'
      })
    }

    if (!body.items || body.items.length === 0) {
      throw createError({
        statusCode: 400,
        message: 'Almeno un articolo è obbligatorio'
      })
    }

    // Genera ID fattura se non presente
    let invoiceId = body.invoiceId
    if (!invoiceId) {
      invoiceId = await generateInvoiceId()
    }

    // Prepara dati fattura
    const invoiceData = {
      invoiceId,
      invoiceDate: body.invoiceData?.invoiceDate || new Date(),
      orderId: body.invoiceData?.orderId || null,
      commNum: body.invoiceData?.commNum || null,
      client: {
        clientId: body.client.clientId || null,
        firstname: body.client.firstname || '',
        lastname: body.client.lastname || '',
        title: body.client.title || '',
        company: body.client.company || '',
        address: body.client.address || '',
        cap: body.client.cap || '',
        city: body.client.city || '',
        region: body.client.region || '',
        state: body.client.state || '',
        tel: body.client.tel || '',
        piva: body.client.piva || ''
      },
      receipts: (body.receipts || []).filter(r => r.number),
      items: (body.items || []).map(item => ({
        productId: item.productId || null,
        orderItemId: item.orderItemId || null,
        code: item.code || '',
        description: item.description || '',
        quantity: item.quantity || 0,
        unitPrice: item.unitPrice || 0
      })),
      taxable: body.financial?.taxable || 0,
      hasVat: body.financial?.hasVat ?? true,
      vatRate: body.financial?.vatRate || 22,
      vatAmount: body.financial?.vatAmount || 0,
      total: body.financial?.total || 0,
      deposit: body.financial?.deposit || 0,
      cod: body.financial?.cod || 0,
      payment: body.invoiceData?.payment || '',
      shipping: body.invoiceData?.shipping || '',
      insurance: body.invoiceData?.insurance || '',
      notes: body.invoiceData?.notes || '',
      issued: body.invoiceData?.issued || false,
      packing: body.packing || {},
      packages: body.packages || [],
      shippingLabel: body.shippingLabel || {}
    }

    const invoice = await Invoice.create(invoiceData)

    const populatedInvoice = await Invoice.findById(invoice._id)
      .populate('orderId', 'commNum')
      .populate('items.productId', 'code name details')
      .lean()

    return {
      success: true,
      invoice: populatedInvoice,
      message: 'Fattura creata con successo'
    }

  } catch (error) {
    console.error('Errore API create invoice:', error)

    if (error.statusCode) throw error

    throw createError({
      statusCode: 500,
      message: 'Errore nella creazione della fattura',
      data: error.message
    })
  }
})

// Genera ID fattura progressivo
async function generateInvoiceId() {
  const lastInvoice = await Invoice.findOne().sort({ invoiceId: -1 }).lean()

  if (!lastInvoice || !lastInvoice.invoiceId) {
    return '00001'
  }

  const lastNum = parseInt(lastInvoice.invoiceId)
  const newNum = lastNum + 1

  return String(newNum).padStart(5, '0')
}
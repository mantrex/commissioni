import Invoice from '~~/server/models/Invoice'

export default defineEventHandler(async (event) => {
  const invoiceId = getRouterParam(event, 'id')

  try {
    const body = await readBody(event)

    const invoice = await Invoice.findById(invoiceId)

    if (!invoice) {
      throw createError({
        statusCode: 404,
        message: 'Fattura non trovata'
      })
    }

    // Aggiorna dati fattura
    if (body.invoiceData) {
      invoice.invoiceDate = body.invoiceData.invoiceDate || invoice.invoiceDate
      invoice.orderId = body.invoiceData.orderId
      invoice.commNum = body.invoiceData.commNum
      invoice.payment = body.invoiceData.payment || ''
      invoice.shipping = body.invoiceData.shipping || ''
      invoice.insurance = body.invoiceData.insurance || ''
      invoice.notes = body.invoiceData.notes || ''
      invoice.issued = body.invoiceData.issued || false
    }

    // Aggiorna cliente
    if (body.client) {
      invoice.client = {
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
      }
    }

    // Aggiorna scontrini
    if (body.receipts) {
      invoice.receipts = body.receipts.filter(r => r.number)
    }

    // Aggiorna articoli
    if (body.items) {
      invoice.items = body.items.map(item => ({
        productId: item.productId || null,
        orderItemId: item.orderItemId || null,
        code: item.code || '',
        description: item.description || '',
        quantity: item.quantity || 0,
        unitPrice: item.unitPrice || 0
      }))
    }

    // Aggiorna dati finanziari
    if (body.financial) {
      invoice.taxable = body.financial.taxable || 0
      invoice.hasVat = body.financial.hasVat ?? true
      invoice.vatRate = body.financial.vatRate || 22
      invoice.vatAmount = body.financial.vatAmount || 0
      invoice.total = body.financial.total || 0
      invoice.deposit = body.financial.deposit || 0
      invoice.cod = body.financial.cod || 0
    }

    // Aggiorna imballo e pacchi
    if (body.packing) {
      invoice.packing = body.packing
    }

    if (body.packages) {
      invoice.packages = body.packages
    }

    // Aggiorna etichetta spedizione
    if (body.shippingLabel) {
      invoice.shippingLabel = body.shippingLabel
    }

    await invoice.save()

    const populatedInvoice = await Invoice.findById(invoiceId)
      .populate('orderId', 'commNum')
      .populate('items.productId', 'code name details')
      .lean()

    return {
      success: true,
      invoice: populatedInvoice,
      message: 'Fattura aggiornata con successo'
    }

  } catch (error) {
    console.error('Errore API update invoice:', error)

    if (error.statusCode) throw error

    throw createError({
      statusCode: 500,
      message: 'Errore nell\'aggiornamento della fattura',
      data: error.message
    })
  }
})
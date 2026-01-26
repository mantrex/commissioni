// =============================================================
// NUOVO FILE: server/api/invoices/check-existing.get.js
// Verifica se esiste già una fattura per un numero commissione
// =============================================================

import Invoice from '~~/server/models/Invoice'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const { commNum } = query

    if (!commNum) {
      throw createError({
        statusCode: 400,
        message: 'commNum è obbligatorio'
      })
    }

    // Cerca fattura esistente con questo commNum
    const existingInvoice = await Invoice.findOne({ commNum })
      .select('_id invoiceId commNum invoiceDate')
      .lean()

    return {
      success: true,
      exists: !!existingInvoice,
      invoice: existingInvoice || null
    }

  } catch (error) {
    console.error('Errore check existing invoice:', error)

    if (error.statusCode) throw error

    throw createError({
      statusCode: 500,
      message: 'Errore nella verifica fattura',
      data: error.message
    })
  }
})
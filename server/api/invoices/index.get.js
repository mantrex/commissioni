import Invoice from '~~/server/models/Invoice'
import '~~/server/models/Order'
import '~~/server/models/Client'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)

    // Parametri paginazione
    const page = parseInt(query.page) || 1
    const limit = parseInt(query.limit) || 25
    const skip = (page - 1) * limit

    // Sorting
    const sortBy = query.sortBy || 'invoiceDate'
    const sortDesc = query.sortDesc === 'true'
    const sort = { [sortBy]: sortDesc ? -1 : 1 }

    // Costruisci filtri
    const filters = {}

    // Filtro per ID fattura
    if (query.invoiceId) {
      filters.invoiceId = { $regex: query.invoiceId, $options: 'i' }
    }

    // Filtro per cognome/nome intestatario
    if (query.clientName) {
      const nameRegex = { $regex: query.clientName, $options: 'i' }
      filters.$or = [
        { 'client.lastname': nameRegex },
        { 'client.firstname': nameRegex },
        { 'client.company': nameRegex }
      ]
    }

    // Filtro per numero commissione
    if (query.commNum) {
      filters.commNum = { $regex: query.commNum, $options: 'i' }
    }

    // Filtro per fatture emesse/non emesse
    if (query.issued !== undefined) {
      filters.issued = query.issued === 'true'
    }

    // Filtri date fattura
    if (query.dateFrom || query.dateTo) {
      filters.invoiceDate = {}
      if (query.dateFrom) filters.invoiceDate.$gte = new Date(query.dateFrom)
      if (query.dateTo) filters.invoiceDate.$lte = new Date(query.dateTo)
    }

    console.log('📄 Filtri fatture:', filters)

    // Query database
    const [invoices, total] = await Promise.all([
      Invoice.find(filters)
        .select('invoiceId invoiceDate commNum client.lastname client.firstname client.company total shipping issued')
        .populate('orderId', 'commNum')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Invoice.countDocuments(filters)
    ])

    console.log(`✅ Trovate ${total} fatture, pagina ${page}/${Math.ceil(total / limit)}`)

    return {
      success: true,
      invoices,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }

  } catch (error) {
    console.error('❌ Errore API list invoices:', error)

    throw createError({
      statusCode: 500,
      message: 'Errore nel caricamento delle fatture',
      data: error.message
    })
  }
})
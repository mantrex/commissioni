// server/api/orders/index.get.js
import Order from '~~/server/models/Order'
import '~~/server/models/Client'
import '~~/server/models/Agent'

export default defineEventHandler(async (event) => {
  try {
    // ✅ Forza la registrazione dei modelli importandoli
    // Basta importarli sopra, ma assicuriamoci che Mongoose li conosca

    const query = getQuery(event)

    // Parametri paginazione
    const page = parseInt(query.page) || 1
    const limit = parseInt(query.limit) || 25
    const skip = (page - 1) * limit

    // Sorting
    const sortBy = query.sortBy || 'dueDate'
    const sortDesc = query.sortDesc === 'true'
    const sort = { [sortBy]: sortDesc ? -1 : 1 }

    // Costruisci filtri
    const filters = {}

    // Filtro per numero commissione
    if (query.commNum) {
      filters.commNum = { $regex: query.commNum, $options: 'i' }
    }

    // Filtro scadenza
    if (query.expiredDays) {
      const daysAgo = parseInt(query.expiredDays)
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - daysAgo)

      filters.dueDate = { $lte: cutoffDate }
    } else if (query.notExpired === 'true') {
      filters.dueDate = { $gt: new Date() }
    }

    // Esegui query CON populate
    const [orders, total] = await Promise.all([
      Order.find(filters)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('clientId', 'firstname lastname company')
        .populate('agentId', 'firstname lastname')
        .lean(),
      Order.countDocuments(filters)
    ])

    return {
      success: true,
      orders,
      total,
      page,
      pages: Math.ceil(total / limit)
    }

  } catch (error) {
    console.error('Errore API orders:', error)
    throw createError({
      statusCode: 500,
      message: 'Errore nel recupero degli ordini',
      data: error.message
    })
  }
})
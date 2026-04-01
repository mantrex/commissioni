// server/api/clients/[id].put.js
import Client from '~~/server/models/Client'

export default defineEventHandler(async (event) => {
  const clientId = getRouterParam(event, 'id')

  try {
    const body = await readBody(event)

    const client = await Client.findById(clientId)

    if (!client) {
      throw createError({
        statusCode: 404,
        message: 'Cliente non trovato'
      })
    }

    client.firstname = body.firstname || ''
    client.lastname = body.lastname || ''
    client.company = body.company || ''
    client.address = body.address || ''
    client.cap = body.cap || ''
    client.city = body.city || ''
    client.region = body.region || ''
    client.state = body.state || ''
    client.tel = body.tel || ''
    client.fax = body.fax || ''
    client.email = body.email || ''
    client.tels = (body.tels || []).filter(Boolean)
    client.faxes = (body.faxes || []).filter(Boolean)
    client.emails = (body.emails || []).filter(v => v && v.trim())
    client.piva = body.piva || ''
    client.vip = body.vip || false

    await client.save()

    return {
      success: true,
      client,
      message: 'Cliente aggiornato con successo'
    }

  } catch (error) {
    console.error('Errore API update client:', error)
    if (error.statusCode) throw error
    throw createError({
      statusCode: 500,
      message: 'Errore nell\'aggiornamento del cliente',
      data: error.message
    })
  }
})
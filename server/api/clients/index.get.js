// server/api/clients/index.post.js
import Client from '~~/server/models/Client'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)

    const hasLastname = body.lastname && body.lastname.trim()
    const hasCompany = body.company && body.company.trim()

    if (!hasLastname && !hasCompany) {
      throw createError({
        statusCode: 400,
        message: 'Cognome o Ditta obbligatori'
      })
    }

    const clientData = {
      firstname: body.firstname || '',
      lastname: body.lastname || '',
      company: body.company || '',
      address: body.address || '',
      cap: body.cap || '',
      city: body.city || '',
      region: body.region || '',
      state: body.state || '',
      tel: body.tel || '',
      fax: body.fax || '',
      email: body.email || '',
      tels: (body.tels || []).filter(Boolean),
      faxes: (body.faxes || []).filter(Boolean),
      emails: (body.emails || []).filter(v => v && v.trim()),
      piva: body.piva || '',
      vip: body.vip || false
    }

    const client = await Client.create(clientData)

    return {
      success: true,
      client,
      message: 'Cliente creato con successo'
    }

  } catch (error) {
    console.error('Errore API create client:', error)
    if (error.statusCode) throw error
    throw createError({
      statusCode: 500,
      message: 'Errore nella creazione del cliente',
      data: error.message
    })
  }
})
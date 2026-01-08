import Product from '~~/server/models/Product'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)

    // Validazioni
    if (!body.name && !body.code) {
      throw createError({
        statusCode: 400,
        message: 'Nome o Codice obbligatori'
      })
    }

    const productData = {
      code: body.code || '',
      name: body.name || '',
      details: body.details || ''
    }

    const product = await Product.create(productData)

    return {
      success: true,
      product,
      message: 'Prodotto creato con successo'
    }

  } catch (error) {
    console.error('Errore API create product:', error)

    if (error.statusCode) throw error

    throw createError({
      statusCode: 500,
      message: 'Errore nella creazione del prodotto',
      data: error.message
    })
  }
})
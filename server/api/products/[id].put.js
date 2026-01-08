import Product from '~~/server/models/Product'

export default defineEventHandler(async (event) => {
  const productId = getRouterParam(event, 'id')

  try {
    const body = await readBody(event)

    const product = await Product.findById(productId)

    if (!product) {
      throw createError({
        statusCode: 404,
        message: 'Prodotto non trovato'
      })
    }

    // Aggiorna campi
    product.code = body.code || ''
    product.name = body.name || ''
    product.details = body.details || ''

    await product.save()

    return {
      success: true,
      product,
      message: 'Prodotto aggiornato con successo'
    }

  } catch (error) {
    console.error('Errore API update product:', error)

    if (error.statusCode) throw error

    throw createError({
      statusCode: 500,
      message: 'Errore nell\'aggiornamento del prodotto',
      data: error.message
    })
  }
})
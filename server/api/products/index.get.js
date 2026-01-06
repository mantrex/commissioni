import Product from '~~/server/models/Product'

export default defineEventHandler(async (event) => {
  try {
    const products = await Product.find()
      .select('code name details')
      .sort({ code: 1, name: 1 })
      .lean()

    return {
      success: true,
      products
    }

  } catch (error) {
    console.error('Errore API products:', error)
    throw createError({
      statusCode: 500,
      message: 'Errore nel recupero dei prodotti',
      data: error.message
    })
  }
})
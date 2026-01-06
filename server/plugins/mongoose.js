import mongoose from 'mongoose'

export default defineNitroPlugin(async () => {
  const { mongodbUri } = useRuntimeConfig()

  if (!mongodbUri) {
    console.error('❌ mongodbUri non configurato in runtimeConfig!')
    return
  }

  if (mongoose.connection.readyState === 1) return // già connesso


  try {
    await mongoose.connect(mongodbUri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    })

    //registra i modelli
    await import('~~/server/models/Client')
    await import('~~/server/models/Agent')
    await import('~~/server/models/Product')
    await import('~~/server/models/Order')

    console.log('✅ MongoDB connesso')
  } catch (err) {
    console.error('❌ Errore connessione MongoDB:', err.message)
  }
})

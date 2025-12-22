import mongoose from 'mongoose'

let isConnected = false

export const connectDB = async () => {
  if (isConnected) {
    return
  }

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/commissioni', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })

    isConnected = true
    console.log(`MongoDB connesso: ${conn.connection.host}`)
  } catch (error) {
    console.error('Errore connessione MongoDB:', error)
    process.exit(1)
  }
}
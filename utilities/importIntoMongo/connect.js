// /var/www/develop/commissioni/utilities/importIntoMongo/connect.js
import mysql from 'mysql2/promise'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

// Carica .env dalla root del progetto
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = resolve(__dirname, '../../')
dotenv.config({ path: resolve(projectRoot, '.env') })

export const MYSQL_CONFIG = {
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  multipleStatements: true
}

export const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/commissioni'

export async function connectMySQL() {
  const connection = await mysql.createConnection(MYSQL_CONFIG)
  return connection
}

export async function connectMongoDB() {
  await mongoose.connect(MONGO_URI, {
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 45000,
  })

  // Verifica connessione
  await mongoose.connection.db.admin().ping()

  return mongoose.connection
}

export async function loadModels() {
  const modelsPath = resolve(projectRoot, 'server/models')

  const Agent = (await import(`${modelsPath}/Agent.js`)).default
  const Client = (await import(`${modelsPath}/Client.js`)).default
  const Product = (await import(`${modelsPath}/Product.js`)).default
  const Order = (await import(`${modelsPath}/Order.js`)).default
  const Invoice = (await import(`${modelsPath}/Invoice.js`)).default

  return { Agent, Client, Product, Order, Invoice }
}

export async function disconnectAll(mysqlConn) {
  if (mysqlConn) {
    await mysqlConn.end()
  }
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect()
  }
}
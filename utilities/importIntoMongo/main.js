// /var/www/develop/commissioni/utilities/importIntoMongo/main.js
import mongoose from 'mongoose'
import { connectMySQL, connectMongoDB, loadModels, disconnectAll } from './connect.js'
import { migrateAgents, migrateClients, migrateProducts, migrateOrders, migrateInvoices } from './migrate.js'
import { log, createStats, printStats } from './helpers.js'

async function main() {
  let mysqlConn
  const stats = createStats()

  try {
    log.info('Starting MySQL to MongoDB migration...')
    log.info('=========================================')

    // Connect to MySQL
    log.info('Connecting to MySQL...')
    mysqlConn = await connectMySQL()
    log.success('MySQL connected')

    // Connect to MongoDB
    log.info('Connecting to MongoDB...')
    await connectMongoDB()
    log.success('MongoDB connected and verified')

    // Load models AFTER connection
    log.info('Loading Mongoose models...')
    const { Agent, Client, Product, Order, Invoice } = await loadModels()
    log.success('Models loaded')

    // Clear existing data
    log.info('Clearing existing MongoDB data...')
    try {
      await mongoose.connection.db.dropDatabase()
      log.success('Database dropped')
    } catch (err) {
      log.info('Database does not exist yet (first run)')
    }

    // Run migrations
    log.info('=========================================')
    const agentsMap = await migrateAgents(mysqlConn, Agent, stats)
    const clientsMap = await migrateClients(mysqlConn, Client, stats)
    const productsMap = await migrateProducts(mysqlConn, Product, stats)
    const ordersMap = await migrateOrders(mysqlConn, clientsMap, agentsMap, productsMap, Order, stats)
    await migrateInvoices(mysqlConn, clientsMap, ordersMap, productsMap, Product, Invoice, stats)

    // Print statistics
    printStats(stats)
    log.success('Migration completed successfully!')

  } catch (err) {
    log.error(`Migration failed: ${err.message}`)
    console.error(err)
    process.exit(1)
  } finally {
    await disconnectAll(mysqlConn)
    log.info('All connections closed')
  }
}

main()
import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/commissioni'

async function checkOrders() {
  try {
    await mongoose.connect(MONGO_URI)
    console.log('✓ MongoDB connesso\n')

    // Prendi primo ordine
    const order = await mongoose.connection.db.collection('orders').findOne(
      {},
      { projection: { commNum: 1, items: 1, _id: 1 } }
    )

    if (!order) {
      console.log('❌ Nessun ordine trovato nel database')
      process.exit(0)
    }

    console.log('📋 Ordine trovato:')
    console.log(`   ID: ${order._id}`)
    console.log(`   Num Commissione: ${order.commNum}`)
    console.log(`   Items count: ${order.items?.length || 0}`)
    
    if (order.items && order.items.length > 0) {
      console.log('\n✅ L\'ordine HA items:')
      console.log(JSON.stringify(order.items[0], null, 2))
    } else {
      console.log('\n❌ L\'ordine NON ha items')
    }

    // Conta quanti ordini hanno items
    const totalOrders = await mongoose.connection.db.collection('orders').countDocuments()
    const ordersWithItems = await mongoose.connection.db.collection('orders').countDocuments({
      'items.0': { $exists: true }
    })

    console.log(`\n📊 Statistiche:`)
    console.log(`   Ordini totali: ${totalOrders}`)
    console.log(`   Ordini con items: ${ordersWithItems}`)
    console.log(`   Ordini senza items: ${totalOrders - ordersWithItems}`)

  } catch (err) {
    console.error('❌ Errore:', err.message)
  } finally {
    await mongoose.disconnect()
    process.exit(0)
  }
}

checkOrders()

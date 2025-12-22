import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import readline from 'readline'

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const question = (query) => new Promise((resolve) => rl.question(query, resolve))

async function createAdmin() {
  try {
    // Connetti al database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/commissioni')
    console.log('✓ Connesso al database')

    // Importa il model
    const Admin = mongoose.model('Admin', new mongoose.Schema({
      username: { type: String, required: true, unique: true },
      password: { type: String, required: true },
      createdAt: { type: Date, default: Date.now }
    }))

    // Chiedi username e password
    const username = await question('Username admin (default: admin): ') || 'admin'
    const password = await question('Password: ')

    if (!password || password.length < 6) {
      console.error('✗ La password deve essere di almeno 6 caratteri')
      process.exit(1)
    }

    // Hash della password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Cancella eventuale admin esistente
    await Admin.deleteMany({})

    // Crea nuovo admin
    const admin = new Admin({
      username,
      password: hashedPassword
    })

    await admin.save()
    console.log(`✓ Admin "${username}" creato con successo!`)

  } catch (error) {
    console.error('✗ Errore:', error.message)
  } finally {
    rl.close()
    await mongoose.connection.close()
    process.exit(0)
  }
}

createAdmin()
// utilities/sync-helpers/payments.js
import { log } from '../../helpers.js'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = resolve(__dirname, '../../../../')

export async function syncPayments(mysqlConn) {
  log.info('💳 Sincronizzazione PAGAMENTI...')

  try {
    // Importa model
    const modelsPath = resolve(projectRoot, 'server/models')
    const Payment = (await import(`${modelsPath}/Payment.js`)).default

    // Query per ottenere tutti i pagamenti da MySQL
    const [rows] = await mysqlConn.query(`
      SELECT DISTINCT Pagamento as payment 
      FROM commissioni_fatture.tDatiFattura 
      WHERE Pagamento IS NOT NULL AND Pagamento != ''
      ORDER BY Pagamento
    `)

    log.info(`   Trovati ${rows.length} pagamenti unici in MySQL`)

    let added = 0
    let updated = 0
    let skipped = 0

    for (const row of rows) {
      const paymentName = row.payment.trim()
      
      if (!paymentName) {
        skipped++
        continue
      }

      // Genera code dal nome
      const code = paymentName.toUpperCase().replace(/[\s\/\-\.]+/g, '_')

      try {
        const existing = await Payment.findOne({ code })

        if (existing) {
          if (existing.label !== paymentName) {
            existing.label = paymentName
            await existing.save()
            updated++
            log.info(`   ↻ Aggiornato: ${code} → ${paymentName}`)
          } else {
            skipped++
          }
        } else {
          await Payment.create({
            code,
            label: paymentName,
            selectable: true
          })
          added++
          log.success(`   ✓ Aggiunto: ${code} → ${paymentName}`)
        }
      } catch (err) {
        log.error(`   ✗ Errore con ${paymentName}: ${err.message}`)
      }
    }

    log.info('')
    log.success(`   📊 Pagamenti: ${added} aggiunti, ${updated} aggiornati, ${skipped} saltati`)
    log.info('')

  } catch (err) {
    log.error(`Errore sync pagamenti: ${err.message}`)
    throw err
  }
}

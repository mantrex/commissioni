// utilities/sync-helpers/couriers.js
import { log } from '../../helpers.js'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = resolve(__dirname, '../../../../')

export async function syncCouriers(mysqlConn) {
  log.info('🚚 Sincronizzazione CORRIERI...')

  try {
    // Importa model
    const modelsPath = resolve(projectRoot, 'server/models')
    const Courier = (await import(`${modelsPath}/Courier.js`)).default

    // Query per ottenere tutti i corrieri da MySQL
    const [rows] = await mysqlConn.query(`
      SELECT DISTINCT Corr1 as courier FROM commissioni.tCommissioni WHERE Corr1 IS NOT NULL AND Corr1 != ''
      UNION
      SELECT DISTINCT Corr2 as courier FROM commissioni.tCommissioni WHERE Corr2 IS NOT NULL AND Corr2 != ''
      UNION
      SELECT DISTINCT Corr3 as courier FROM commissioni.tCommissioni WHERE Corr3 IS NOT NULL AND Corr3 != ''
      ORDER BY courier
    `)

    log.info(`   Trovati ${rows.length} corrieri unici in MySQL`)

    let added = 0
    let updated = 0
    let skipped = 0

    for (const row of rows) {
      const courierName = row.courier.trim()
      
      if (!courierName) {
        skipped++
        continue
      }

      // Genera code dal nome (uppercase, replace spaces con underscore)
      const code = courierName.toUpperCase().replace(/[\s\/\-\.]+/g, '_')

      try {
        // Cerca se esiste già
        const existing = await Courier.findOne({ code })

        if (existing) {
          // Aggiorna solo se la label è diversa
          if (existing.label !== courierName) {
            existing.label = courierName
            await existing.save()
            updated++
            log.info(`   ↻ Aggiornato: ${code} → ${courierName}`)
          } else {
            skipped++
          }
        } else {
          // Crea nuovo
          await Courier.create({
            code,
            label: courierName,
            selectable: true
          })
          added++
          log.success(`   ✓ Aggiunto: ${code} → ${courierName}`)
        }
      } catch (err) {
        log.error(`   ✗ Errore con ${courierName}: ${err.message}`)
      }
    }

    log.info('')
    log.success(`   📊 Corrieri: ${added} aggiunti, ${updated} aggiornati, ${skipped} saltati`)
    log.info('')

  } catch (err) {
    log.error(`Errore sync corrieri: ${err.message}`)
    throw err
  }
}

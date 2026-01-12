// utilities/sync-helpers/shipments.js
import { log } from '../../helpers.js'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = resolve(__dirname, '../../../../')

export async function syncShipments(mysqlConn) {
  log.info('📦 Sincronizzazione SPEDIZIONI...')

  try {
    // Importa model
    const modelsPath = resolve(projectRoot, 'server/models')
    const Shipment = (await import(`${modelsPath}/Shipment.js`)).default

    // Query per ottenere tutte le spedizioni da MySQL
    const [rows] = await mysqlConn.query(`
      SELECT DISTINCT Spedizione as shipment 
      FROM commissioni_fatture.tDatiFattura 
      WHERE Spedizione IS NOT NULL AND Spedizione != ''
      ORDER BY Spedizione
    `)

    log.info(`   Trovate ${rows.length} spedizioni uniche in MySQL`)

    let added = 0
    let updated = 0
    let skipped = 0

    for (const row of rows) {
      const shipmentName = row.shipment.trim()
      
      if (!shipmentName) {
        skipped++
        continue
      }

      // Genera code dal nome
      const code = shipmentName.toUpperCase().replace(/[\s\/\-\.]+/g, '_')

      try {
        const existing = await Shipment.findOne({ code })

        if (existing) {
          if (existing.label !== shipmentName) {
            existing.label = shipmentName
            await existing.save()
            updated++
            log.info(`   ↻ Aggiornato: ${code} → ${shipmentName}`)
          } else {
            skipped++
          }
        } else {
          await Shipment.create({
            code,
            label: shipmentName,
            selectable: true
          })
          added++
          log.success(`   ✓ Aggiunto: ${code} → ${shipmentName}`)
        }
      } catch (err) {
        log.error(`   ✗ Errore con ${shipmentName}: ${err.message}`)
      }
    }

    log.info('')
    log.success(`   📊 Spedizioni: ${added} aggiunte, ${updated} aggiornate, ${skipped} saltate`)
    log.info('')

  } catch (err) {
    log.error(`Errore sync spedizioni: ${err.message}`)
    throw err
  }
}

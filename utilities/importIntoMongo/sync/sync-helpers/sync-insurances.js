// utilities/sync-helpers/insurances.js
import { log } from '../../helpers.js'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = resolve(__dirname, '../../../../')

export async function syncInsurances(mysqlConn) {
  log.info('🛡️  Sincronizzazione ASSICURAZIONI...')

  try {
    // Importa model
    const modelsPath = resolve(projectRoot, 'server/models')
    const Insurance = (await import(`${modelsPath}/Insurance.js`)).default

    // Query per ottenere tutte le assicurazioni da MySQL
    const [rows] = await mysqlConn.query(`
      SELECT DISTINCT Assicura as insurance 
      FROM commissioni_fatture.tDatiFattura 
      WHERE Assicura IS NOT NULL AND Assicura != ''
      ORDER BY Assicura
    `)

    log.info(`   Trovate ${rows.length} assicurazioni uniche in MySQL`)

    let added = 0
    let updated = 0
    let skipped = 0

    for (const row of rows) {
      const insuranceName = row.insurance.trim()
      
      if (!insuranceName) {
        skipped++
        continue
      }

      // Genera code dal nome
      const code = insuranceName.toUpperCase().replace(/[\s\/\-\.]+/g, '_')

      try {
        const existing = await Insurance.findOne({ code })

        if (existing) {
          if (existing.label !== insuranceName) {
            existing.label = insuranceName
            await existing.save()
            updated++
            log.info(`   ↻ Aggiornato: ${code} → ${insuranceName}`)
          } else {
            skipped++
          }
        } else {
          await Insurance.create({
            code,
            label: insuranceName,
            selectable: true
          })
          added++
          log.success(`   ✓ Aggiunto: ${code} → ${insuranceName}`)
        }
      } catch (err) {
        log.error(`   ✗ Errore con ${insuranceName}: ${err.message}`)
      }
    }

    log.info('')
    log.success(`   📊 Assicurazioni: ${added} aggiunte, ${updated} aggiornate, ${skipped} saltate`)
    log.info('')

  } catch (err) {
    log.error(`Errore sync assicurazioni: ${err.message}`)
    throw err
  }
}

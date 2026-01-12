// utilities/sync-helpers/statuses.js
import { log } from '../../helpers.js'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = resolve(__dirname, '../../../../')

export async function syncStatuses(mysqlConn) {
  log.info('🏷️  Sincronizzazione STATI...')

  try {
    // Importa model
    const modelsPath = resolve(projectRoot, 'server/models')
    const Status = (await import(`${modelsPath}/Status.js`)).default

    // Query per ottenere tutti gli stati da MySQL
    const [rows] = await mysqlConn.query(`
      SELECT DISTINCT PosPratica as status 
      FROM commissioni.tCommissioni 
      WHERE PosPratica IS NOT NULL AND PosPratica != ''
      ORDER BY PosPratica
    `)

    log.info(`   Trovati ${rows.length} stati unici in MySQL`)

    let added = 0
    let updated = 0
    let skipped = 0

    for (const row of rows) {
      const statusName = row.status.trim()
      
      if (!statusName) {
        skipped++
        continue
      }

      // Genera code dal nome (uppercase, replace spaces con underscore)
      const code = statusName.toUpperCase().replace(/[\s\/\-\.]+/g, '_')

      try {
        // Cerca se esiste già
        const existing = await Status.findOne({ code })

        if (existing) {
          // Aggiorna solo se la label è diversa
          if (existing.label !== statusName) {
            existing.label = statusName
            await existing.save()
            updated++
            log.info(`   ↻ Aggiornato: ${code} → ${statusName}`)
          } else {
            skipped++
          }
        } else {
          // Crea nuovo
          await Status.create({
            code,
            label: statusName,
            selectable: true
          })
          added++
          log.success(`   ✓ Aggiunto: ${code} → ${statusName}`)
        }
      } catch (err) {
        log.error(`   ✗ Errore con ${statusName}: ${err.message}`)
      }
    }

    log.info('')
    log.success(`   📊 Stati: ${added} aggiunti, ${updated} aggiornati, ${skipped} saltati`)
    log.info('')

  } catch (err) {
    log.error(`Errore sync stati: ${err.message}`)
    throw err
  }
}

#!/usr/bin/env node
// utilities/sync-lists.mjs

import { connectMySQL, connectMongoDB, disconnectAll, MYSQL_CONFIG } from '../connect.js'
import { syncCouriers } from './sync-helpers/sync-couriers.js'
import { syncStatuses } from './sync-helpers/sync-statuses.js'
import { syncShipments } from './sync-helpers/sync-shipments.js'
import { syncPayments } from './sync-helpers/sync-payments.js'
import { syncInsurances } from './sync-helpers/sync-insurances.js'
import { log } from '../helpers.js'

const VALID_TYPES = ['couriers', 'statuses', 'shipments', 'payments', 'insurances', 'full']

async function main() {
  const args = process.argv.slice(2)
  
  if (args.length === 0) {
    console.log(`
╔════════════════════════════════════════════════════════════╗
║          SYNC LISTS - Sistema Commissioni                 ║
╚════════════════════════════════════════════════════════════╝

Sincronizza le liste da MySQL a MongoDB.

UTILIZZO:
  node utilities/sync-lists.mjs [TYPE]

TYPES:
  couriers    - Sincronizza corrieri (da tCommissioni.Corr1,Corr2,Corr3)
  statuses    - Sincronizza stati (da tCommissioni.PosPratica)
  shipments   - Sincronizza spedizioni (da tDatiFattura.Spedizione)
  payments    - Sincronizza pagamenti (da tDatiFattura.Pagamento)
  insurances  - Sincronizza assicurazioni (da tDatiFattura.Assicura)
  full        - Sincronizza tutto

ESEMPI:
  node utilities/sync-lists.mjs full
  node utilities/sync-lists.mjs couriers
  node utilities/sync-lists.mjs payments
    `)
    process.exit(0)
  }

  const type = args[0].toLowerCase()

  if (!VALID_TYPES.includes(type)) {
    log.error(`Tipo non valido: ${type}`)
    log.info(`Tipi validi: ${VALID_TYPES.join(', ')}`)
    process.exit(1)
  }

  let mysqlConn

  try {
    log.info('╔════════════════════════════════════════════════════════════╗')
    log.info('║          SYNC LISTS - Inizio Sincronizzazione             ║')
    log.info('╚════════════════════════════════════════════════════════════╝')
    log.info('')

    // Connessioni
    log.info('Connessione a MySQL...')
    mysqlConn = await connectMySQL()
    log.success('MySQL connesso')

    log.info('Connessione a MongoDB...')
    await connectMongoDB()
    log.success('MongoDB connesso')

    log.info('')
    log.info('═══════════════════════════════════════════════════════════')
    log.info('')

    // Esegui sync
    if (type === 'full' || type === 'couriers') {
      await syncCouriers(mysqlConn)
    }

    if (type === 'full' || type === 'statuses') {
      await syncStatuses(mysqlConn)
    }

    if (type === 'full' || type === 'shipments') {
      await syncShipments(mysqlConn)
    }

    if (type === 'full' || type === 'payments') {
      await syncPayments(mysqlConn)
    }

    if (type === 'full' || type === 'insurances') {
      await syncInsurances(mysqlConn)
    }

    log.info('')
    log.info('═══════════════════════════════════════════════════════════')
    log.success('✅ Sincronizzazione completata con successo!')

  } catch (err) {
    log.error(`Errore durante la sincronizzazione: ${err.message}`)
    console.error(err)
    process.exit(1)
  } finally {
    await disconnectAll(mysqlConn)
    log.info('Connessioni chiuse')
    process.exit(0)
  }
}

main()

// /var/www/develop/commissioni/utilities/importIntoMongo/migrate.js
import { log, parseAgentName } from './helpers.js'

export async function migrateAgents(mysqlConn, Agent, stats) {
  log.info('Migrating agents...')

  try {
    const [rows] = await mysqlConn.query(`
      SELECT DISTINCT Agente 
      FROM commissioni.tCommissioni 
      WHERE Agente IS NOT NULL AND Agente != ''
    `)

    stats.agents.total = rows.length
    const agentsMap = new Map()

    for (const row of rows) {
      try {
        const { firstname, lastname } = parseAgentName(row.Agente)


        const agent = await Agent.create({ firstname, lastname })
        agentsMap.set(row.Agente, agent._id)
        stats.agents.imported++
      } catch (err) {
        log.error(`Failed to import agent ${row.Agente}: ${err.message}`)
        stats.agents.failed++
      }
    }

    log.success(`Agents: ${stats.agents.imported}/${stats.agents.total} imported`)
    return agentsMap
  } catch (err) {
    log.error(`Agent migration failed: ${err.message}`)
    throw err
  }
}

export async function migrateClients(mysqlConn, Client, stats) {
  log.info('Migrating clients...')

  try {
    const [rows] = await mysqlConn.query(`
      SELECT * FROM commissioni.tClienti
    `)

    stats.clients.total = rows.length
    const clientsMap = new Map()

    for (const row of rows) {
      try {
        const client = await Client.create({
          firstname: row.NomeCliente || '',
          lastname: row.CognomeCliente || '',
          company: row.DittaCliente || '',
          address: row.IndirizzoCliente || '',
          cap: row.CAP || '',
          city: row.Città || '',
          region: row.Prov || '',
          state: row.Paese || '',
          tel: row.TelCliente || '',
          fax: row.FaxCliente || '',
          email: row.EmailCliente || '',
          piva: row.Piva || '',
          vip: row.VIP === 1
        })

        clientsMap.set(row.IDCliente, client._id)
        stats.clients.imported++
      } catch (err) {
        log.error(`Failed to import client ${row.IDCliente}: ${err.message}`)
        stats.clients.failed++
      }
    }

    log.success(`Clients: ${stats.clients.imported}/${stats.clients.total} imported`)
    return clientsMap
  } catch (err) {
    log.error(`Client migration failed: ${err.message}`)
    throw err
  }
}



export async function migrateProducts(mysqlConn, Product, stats) {
  log.info('Migrating products...')

  try {
    const [rows] = await mysqlConn.query(`
      SELECT * FROM commissioni.tMerceVend
    `)

    stats.products.total = rows.length
    const productsMap = new Map()

    for (const row of rows) {
      try {
        // Salta prodotti completamente vuoti
        if (!row.CodArticolo && !row.DescrArt) {
          log.warn(`Skipping empty product ${row.IDMerceVend}`)
          stats.products.failed++
          continue
        }

        const product = await Product.create({
          code: row.CodArticolo || '',
          name: row.DescrArt || '',
          details: row.NoteArt || ''
        })

        productsMap.set(row.IDMerceVend, product._id)
        stats.products.imported++
      } catch (err) {
        log.error(`Failed to import product ${row.IDMerceVend}: ${err.message}`)
        stats.products.failed++
      }
    }

    log.success(`Products: ${stats.products.imported}/${stats.products.total} imported`)
    return productsMap
  } catch (err) {
    log.error(`Product migration failed: ${err.message}`)
    throw err
  }
}

export async function migrateOrders(mysqlConn, clientsMap, agentsMap, productsMap, Order, stats) {
  log.info('Migrating orders...')

  try {
    const [rows] = await mysqlConn.query(`
      SELECT * FROM commissioni.tCommissioni
    `)

    stats.orders.total = rows.length
    const ordersMap = new Map()

    for (const row of rows) {
      try {
        const clientId = clientsMap.get(row.IDCliente)
        if (!clientId) {
          log.warn(`Client not found for order ${row.IDComm}, skipping`)
          stats.orders.failed++
          continue
        }

        const agentId = row.Agente ? agentsMap.get(row.Agente) : null

        // Spedizioni
        const shipments = []
        if (row.Sped1data || row.Corr1) {
          shipments.push({ date: row.Sped1data || null, courier: row.Corr1 || '' })
        }
        if (row.Sped2data || row.Corr2) {
          shipments.push({ date: row.Sped2data || null, courier: row.Corr2 || '' })
        }
        if (row.Sped3data || row.Corr3) {
          shipments.push({ date: row.Sped3data || null, courier: row.Corr3 || '' })
        }

        // Note
        const notes = []
        if (row.Nota1) notes.push({ text: row.Nota1 })
        if (row.Nota2) notes.push({ text: row.Nota2 })
        if (row.Nota3) notes.push({ text: row.Nota3 })
        if (row.Nota4) notes.push({ text: row.Nota4 })
        if (row.Nota5) notes.push({ text: row.Nota5 })

        // Items
        const [itemRows] = await mysqlConn.query(`
          SELECT dm.*, mv.*
          FROM commissioni.trDettagliMerceVend dm
          JOIN commissioni.tMerceVend mv ON dm.IDMerceVend = mv.IDMerceVend
          WHERE dm.IDComm = ?
        `, [row.IDComm])

        const items = []
        for (const itemRow of itemRows) {
          const productId = productsMap.get(itemRow.IDMerceVend)
          if (productId) {
            // ✅ Gestisci valori negativi e NULL
            let invoiced = itemRow.Fatturato || 0
            if (invoiced < 0) invoiced = 0  // Converte -1 in 0
            if (invoiced > 3) invoiced = 3  // Limita a 3 max

            items.push({
              productId,
              quantity: itemRow.QuantitàVend || 0,
              ready: itemRow.Pronto === 1,
              invoiced,
              ordered: itemRow.Ordinato === 1
            })
          }
        }

        const order = await Order.create({
          commNum: row.IDComm,
          date: row.DataComm || new Date(),
          dueDate: row.DataScad || null,
          clientId,
          agentId,
          status: row.PosPratica || '',
          shipments,
          notes,
          items,
          ca: row.CA || 0,
          rd: row.RD || 0,
          ric: row.RIC || 0,
          balance: row.Saldo || 0,
          pay: row.Pag || 0,
          print: row.Stampa === 1,
          blacklist: row.BL === 1,
          shipped: row.SP === 1,
          photoLink: row.FotoLink || ''
        })

        ordersMap.set(row.IDComm, order._id)
        stats.orders.imported++
      } catch (err) {
        log.error(`Failed to import order ${row.IDComm}: ${err.message}`)
        stats.orders.failed++
      }
    }

    log.success(`Orders: ${stats.orders.imported}/${stats.orders.total} imported`)
    return ordersMap
  } catch (err) {
    log.error(`Order migration failed: ${err.message}`)
    throw err
  }
}




// utilities/importIntoMongo/migrate.js

export async function migrateInvoices(mysqlConn, clientsMap, ordersMap, productsMap, Product, Invoice, stats) {
  log.info('Migrating invoices...')

  try {
    const [rows] = await mysqlConn.query(`
      SELECT * FROM commissioni_fatture.tDatiFattura
    `)

    stats.invoices.total = rows.length

    for (const row of rows) {
      try {
        const clientId = clientsMap.get(row.IDCliente) || null
        const client = {
          clientId,
          firstname: row.NomeCliente || '',
          lastname: row.CognomeCliente || '',
          title: row.Titolo || '',
          company: row.Ditta || '',
          address: row.IndirizzoCliente || '',
          cap: row.CAP || '',
          city: row.Città || '',
          region: row.Prov || '',
          state: row.Paese || '',
          tel: row.TelCliente || '',
          piva: row.PIVA || ''
        }

        const orderId = row.IDComm ? ordersMap.get(row.IDComm) : null

        // ✅ Gestisci data invalida
        let invoiceDate = row.DataFatt
        if (!invoiceDate || isNaN(new Date(invoiceDate).getTime())) {
          invoiceDate = new Date()  // Default a oggi se invalida
        }

        // Receipts - ✅ Filtra date invalide
        const receipts = []
        if (row.NumScontrino) {
          const receiptDate = row.DataScontrino
          if (receiptDate && !isNaN(new Date(receiptDate).getTime())) {
            receipts.push({ number: row.NumScontrino, date: receiptDate })
          } else {
            receipts.push({ number: row.NumScontrino, date: null })
          }
        }
        if (row.NumScontrino2) {
          const receiptDate = row.DataScontrino2
          if (receiptDate && !isNaN(new Date(receiptDate).getTime())) {
            receipts.push({ number: row.NumScontrino2, date: receiptDate })
          } else {
            receipts.push({ number: row.NumScontrino2, date: null })
          }
        }
        if (row.NumScontrino3) {
          const receiptDate = row.DataScontrino3
          if (receiptDate && !isNaN(new Date(receiptDate).getTime())) {
            receipts.push({ number: row.NumScontrino3, date: receiptDate })
          } else {
            receipts.push({ number: row.NumScontrino3, date: null })
          }
        }

        // Items
        const [itemRows] = await mysqlConn.query(`
          SELECT * FROM commissioni_fatture.tVociFattura
          WHERE IDFattura = ?
        `, [row.IDFattura])

        const items = []
        for (const itemRow of itemRows) {
          // ✅ Salta items completamente vuoti
          if (!itemRow.CodArticolo && !itemRow.DescrArt) {
            log.warn(`Skipping empty item in invoice ${row.IDFattura}`)
            continue
          }

          let productId = null
          if (itemRow.CodArticolo) {
            const product = await Product.findOne({ code: itemRow.CodArticolo })
            if (product) {
              productId = product._id
            }
          }

          items.push({
            productId,
            orderItemId: null,
            code: itemRow.CodArticolo || '',
            description: itemRow.DescrArt || '',
            quantity: itemRow.QuantitàVend || 0,
            unitPrice: itemRow.PrezzoUn || 0
          })
        }

        // Packing
        const packing = {
          made: row.Made || '',
          whoMakes: row.ChiFa || '',
          numPackages: row.NumPacchi || 0,
          packageSize: row.MisPacchi || '',
          grossWeight: row.PesoLordo || 0,
          netWeight: row.PesoNetto || 0,
          conai: row.Conai || ''
        }

        // Packages
        const [packageRows] = await mysqlConn.query(`
          SELECT * FROM commissioni_fatture.tPacchi
          WHERE IDFattura = ?
        `, [row.IDFattura])

        const packages = packageRows.map(pkg => ({
          size1: pkg.Mis1Pacco || 0,
          size2: pkg.Mis2Pacco || 0,
          size3: pkg.Mis3Pacco || 0,
          grossWeight: pkg.PesoLordo || 0,
          netWeight: pkg.PesoNetto || 0
        }))

        // Shipping label
        const [labelRows] = await mysqlConn.query(`
          SELECT * FROM commissioni_fatture.tEtichetteSped
          WHERE IDFattura = ?
        `, [row.IDFattura])

        const shippingLabel = labelRows.length > 0 ? {
          line1: labelRows[0].R1 || '',
          line2: labelRows[0].R2 || '',
          line3: labelRows[0].R3 || '',
          line4: labelRows[0].R4 || '',
          tel: labelRows[0].TelCliente || '',
          content: labelRows[0].Contenuto || '',
          netWeight: labelRows[0].PesoN || '',
          grossWeight: labelRows[0].PesoL || ''
        } : {}

        await Invoice.create({
          invoiceId: row.IDFattura,
          invoiceDate,
          orderId,
          commNum: row.IDComm || null,
          client,
          receipts,
          items,
          taxable: row.Imponibile || 0,
          hasVat: row['IVAsi-no'] === 1,
          vatRate: row.IVA || 0,
          vatAmount: row.ImportoIVA || 0,
          total: row.TotFattura || 0,
          deposit: row.Deposito || 0,
          cod: row.Cod || 0,
          payment: row.Pagamento || '',
          shipping: row.Spedizione || '',
          insurance: row.Assicura || '',
          notes: row.Note || '',
          issued: row.Emessa === 1,
          packing,
          packages,
          shippingLabel
        })

        stats.invoices.imported++
      } catch (err) {
        log.error(`Failed to import invoice ${row.IDFattura}: ${err.message}`)
        stats.invoices.failed++
      }
    }

    log.success(`Invoices: ${stats.invoices.imported}/${stats.invoices.total} imported`)
  } catch (err) {
    log.error(`Invoice migration failed: ${err.message}`)
    throw err
  }
}
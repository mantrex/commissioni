// /var/www/develop/commissioni/utilities/importIntoMongo/helpers.js

export const log = {
  info: (msg) => console.log(`ℹ️  ${msg}`),
  success: (msg) => console.log(`✅ ${msg}`),
  error: (msg) => console.error(`❌ ${msg}`),
  warn: (msg) => console.warn(`⚠️  ${msg}`)
}

// utilities/importIntoMongo/helpers.js

export function parseAgentName(fullName) {
  if (!fullName || typeof fullName !== 'string') {
    return { firstname: 'Unknown', lastname: '' }
  }

  // Pulisci e normalizza
  const cleaned = fullName.trim()

  if (!cleaned) {
    return { firstname: 'Unknown', lastname: '' }
  }

  // Split per spazi O slash
  const parts = cleaned.split(/[\s\/]+/).filter(p => p.length > 0)

  if (parts.length === 0) {
    return { firstname: 'Unknown', lastname: '' }
  }

  if (parts.length === 1) {
    // Una sola parola = metti in firstname (non lastname!)
    return { firstname: parts[0], lastname: '' }
  }

  // Due o più parole: primo = firstname, ultimo = lastname
  // Esempio: "VALERIO MARINO" → firstname: "VALERIO", lastname: "MARINO"
  // Esempio: "WALTER/ANDREA" → firstname: "WALTER", lastname: "ANDREA"
  const firstname = parts.slice(0, -1).join(' ')
  const lastname = parts[parts.length - 1]

  return { firstname, lastname }
}


export function createStats() {
  return {
    agents: { total: 0, imported: 0, failed: 0 },
    clients: { total: 0, imported: 0, failed: 0 },
    products: { total: 0, imported: 0, failed: 0 },
    orders: { total: 0, imported: 0, failed: 0 },
    invoices: { total: 0, imported: 0, failed: 0 }
  }
}

export function printStats(stats) {
  console.log('\n=========================================')
  console.log('Migration Statistics')
  console.log('=========================================\n')
  console.table(stats)
}
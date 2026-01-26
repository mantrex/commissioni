<template>
  <q-page class="print-invoice-page">
    <!-- Bottoni azione (nascosti in stampa) -->
    <div class="print-actions no-print">
      <q-btn flat dense icon="arrow_back" label="Indietro" @click="handleBack" />
      <q-btn unelevated color="primary" icon="print" label="Stampa" @click="handlePrint" />
    </div>

    <!-- Template Fattura -->
    <div class="invoice-template" v-if="invoice">
      <!-- Header con logo e info azienda -->
      <div class="invoice-header">
        <div class="company-info">
          <h1 class="company-name">LA TUA AZIENDA</h1>
          <p>Via Example 123, 12345 Città (VI)</p>
          <p>P.IVA: IT12345678901</p>
          <p>Tel: +39 0123 456789 | Email: info@tuaazienda.it</p>
        </div>
        <div class="invoice-title">
          <h2>FATTURA</h2>
          <p class="invoice-number">N. {{ invoice.invoiceId }}</p>
          <p class="invoice-date">Data: {{ formatDate(invoice.invoiceDate) }}</p>
        </div>
      </div>

      <div class="invoice-divider"></div>

      <!-- Dati Cliente e Ordine -->
      <div class="invoice-info-section">
        <div class="client-box">
          <h3>Intestatario</h3>
          <p class="client-name">
            <strong v-if="invoice.client.company">{{ invoice.client.company }}</strong>
            <strong v-else>{{ invoice.client.lastname }} {{ invoice.client.firstname }}</strong>
          </p>
          <p v-if="invoice.client.address">{{ invoice.client.address }}</p>
          <p v-if="invoice.client.cap || invoice.client.city">
            {{ invoice.client.cap }} {{ invoice.client.city }}
            <span v-if="invoice.client.region">({{ invoice.client.region }})</span>
          </p>
          <p v-if="invoice.client.state">{{ invoice.client.state }}</p>
          <p v-if="invoice.client.tel">Tel: {{ invoice.client.tel }}</p>
          <p v-if="invoice.client.piva"><strong>P.IVA:</strong> {{ invoice.client.piva }}</p>
        </div>

        <div class="order-box">
          <h3>Riferimenti</h3>
          <p v-if="invoice.commNum"><strong>Commissione:</strong> {{ invoice.commNum }}</p>
          <p v-if="invoice.payment"><strong>Pagamento:</strong> {{ invoice.payment }}</p>
          <p v-if="invoice.shipping"><strong>Spedizione:</strong> {{ invoice.shipping }}</p>
          <p v-if="invoice.insurance"><strong>Assicurazione:</strong> {{ invoice.insurance }}</p>

          <!-- Scontrini -->
          <div v-if="receipts.length > 0" class="receipts-info">
            <p><strong>Scontrini:</strong></p>
            <p v-for="(receipt, idx) in receipts" :key="idx" class="receipt-line">
              N. {{ receipt.number }} del {{ formatDate(receipt.date) }}
            </p>
          </div>
        </div>
      </div>

      <!-- Tabella Articoli -->
      <div class="items-table-container">
        <table class="items-table">
          <thead>
            <tr>
              <th class="text-left">Cod. Art.</th>
              <th class="text-left">Descrizione</th>
              <th class="text-center">Q.tà</th>
              <th class="text-right">Prezzo Un.</th>
              <th class="text-right">Totale</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, idx) in invoice.items" :key="idx">
              <td>{{ item.code }}</td>
              <td>{{ item.description }}</td>
              <td class="text-center">{{ item.quantity }}</td>
              <td class="text-right">{{ formatCurrency(item.unitPrice) }}</td>
              <td class="text-right"><strong>{{ formatCurrency(item.quantity * item.unitPrice) }}</strong></td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Totali -->
      <div class="totals-section">
        <div class="totals-box">
          <div class="total-row">
            <span>Imponibile:</span>
            <span><strong>{{ formatCurrency(invoice.taxable) }}</strong></span>
          </div>

          <div class="total-row" v-if="invoice.hasVat">
            <span>IVA {{ invoice.vatRate }}%:</span>
            <span><strong>{{ formatCurrency(invoice.vatAmount) }}</strong></span>
          </div>

          <div class="total-row total-final">
            <span>TOTALE FATTURA:</span>
            <span><strong>{{ formatCurrency(invoice.total) }}</strong></span>
          </div>

          <div class="total-row" v-if="invoice.deposit > 0">
            <span>Acconto:</span>
            <span>{{ formatCurrency(invoice.deposit) }}</span>
          </div>

          <div class="total-row" v-if="invoice.cod > 0">
            <span>Contrassegno:</span>
            <span>{{ formatCurrency(invoice.cod) }}</span>
          </div>
        </div>
      </div>

      <!-- Note -->
      <div class="notes-section" v-if="invoice.notes">
        <h3>Note</h3>
        <p>{{ invoice.notes }}</p>
      </div>

      <!-- Imballo (se presente) -->
      <div class="packing-section" v-if="hasPacking">
        <h3>Imballo e Spedizione</h3>
        <div class="packing-grid">
          <p v-if="invoice.packing?.made"><strong>Made:</strong> {{ invoice.packing.made }}</p>
          <p v-if="invoice.packing?.whoMakes"><strong>Chi fa:</strong> {{ invoice.packing.whoMakes }}</p>
          <p v-if="invoice.packing?.numPackages"><strong>N. Pacchi:</strong> {{ invoice.packing.numPackages }}</p>
          <p v-if="invoice.packing?.packageSize"><strong>Misure:</strong> {{ invoice.packing.packageSize }}</p>
          <p v-if="invoice.packing?.grossWeight"><strong>Peso Lordo:</strong> {{ invoice.packing.grossWeight }} kg</p>
          <p v-if="invoice.packing?.netWeight"><strong>Peso Netto:</strong> {{ invoice.packing.netWeight }} kg</p>
          <p v-if="invoice.packing?.conai"><strong>CONAI:</strong> {{ invoice.packing.conai }}</p>
        </div>
      </div>

      <!-- Pacchi (se presenti) -->
      <div class="packages-section" v-if="invoice.packages && invoice.packages.length > 0">
        <h3>Dettaglio Pacchi</h3>
        <table class="packages-table">
          <thead>
            <tr>
              <th>N.</th>
              <th>Dimensioni (cm)</th>
              <th>Peso Lordo (kg)</th>
              <th>Peso Netto (kg)</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(pkg, idx) in invoice.packages" :key="idx">
              <td>{{ idx + 1 }}</td>
              <td>{{ pkg.size1 }} × {{ pkg.size2 }} × {{ pkg.size3 }}</td>
              <td>{{ pkg.grossWeight }}</td>
              <td>{{ pkg.netWeight }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Etichetta Spedizione (se presente) -->
      <div class="shipping-label-section" v-if="hasShippingLabel">
        <h3>Etichetta Spedizione</h3>
        <div class="shipping-label-box">
          <p v-if="invoice.shippingLabel?.line1">{{ invoice.shippingLabel.line1 }}</p>
          <p v-if="invoice.shippingLabel?.line2">{{ invoice.shippingLabel.line2 }}</p>
          <p v-if="invoice.shippingLabel?.line3">{{ invoice.shippingLabel.line3 }}</p>
          <p v-if="invoice.shippingLabel?.line4">{{ invoice.shippingLabel.line4 }}</p>
          <p v-if="invoice.shippingLabel?.tel"><strong>Tel:</strong> {{ invoice.shippingLabel.tel }}</p>
          <p v-if="invoice.shippingLabel?.content"><strong>Contenuto:</strong> {{ invoice.shippingLabel.content }}</p>
          <div class="shipping-weights" v-if="invoice.shippingLabel?.netWeight || invoice.shippingLabel?.grossWeight">
            <span v-if="invoice.shippingLabel?.netWeight"><strong>P.Netto:</strong> {{ invoice.shippingLabel.netWeight
              }}</span>
            <span v-if="invoice.shippingLabel?.grossWeight"><strong>P.Lordo:</strong> {{
              invoice.shippingLabel.grossWeight }}</span>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="invoice-footer">
        <p class="footer-text">Grazie per la vostra preferenza</p>
        <p class="footer-legal">{{ invoice.issued ? 'Fattura emessa' : 'Bozza fattura' }}</p>
      </div>
    </div>

    <!-- Loading -->
    <div v-else class="loading-container">
      <q-spinner color="primary" size="50px" />
      <p>Caricamento fattura...</p>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useQuasar } from 'quasar'


const router = useRouter()
const route = useRoute()
const $q = useQuasar()

const invoiceId = route.params.id
const invoice = ref(null)

// Computed
const receipts = computed(() => {
  if (!invoice.value?.receipts) return []
  return invoice.value.receipts.filter(r => r.number)
})

const hasPacking = computed(() => {
  if (!invoice.value?.packing) return false
  const p = invoice.value.packing
  return p.made || p.whoMakes || p.numPackages || p.packageSize || p.grossWeight || p.netWeight || p.conai
})

const hasShippingLabel = computed(() => {
  if (!invoice.value?.shippingLabel) return false
  const s = invoice.value.shippingLabel
  return s.line1 || s.line2 || s.line3 || s.line4 || s.tel || s.content || s.netWeight || s.grossWeight
})

// Methods
const loadInvoice = async () => {
  try {
    const response = await $fetch(`/api/invoices/${invoiceId}`)
    invoice.value = response.invoice
  } catch (err) {
    $q.notify({
      type: 'negative',
      message: 'Errore nel caricamento',
      caption: err.message
    })
    router.push(`/invoices/edit?id=${invoiceId}`)
  }
}

const handleBack = () => {
  // Se la pagina è stata aperta in una nuova finestra
  if (window.opener) {
    window.close()  // Chiudi la finestra
  } else {
    // Altrimenti torna alla modifica fattura
    router.push(`/invoices/edit?id=${invoiceId}`)
  }
}

const handlePrint = () => {
  window.print()
}

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

const formatCurrency = (value) => {
  if (value === null || value === undefined) return '€ 0,00'
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR'
  }).format(value)
}

onMounted(() => {
  loadInvoice()
})
</script>

<style scoped lang="scss">
// ✅ RESET COMPLETO PER LA STAMPA
* {
  box-sizing: border-box;
}

.print-invoice-page {
  background: #fff;
  min-height: 100vh;
  width: 100%;
  margin: 0;
  padding: 0;
}

.print-actions {
  position: sticky;
  top: 0;
  z-index: 100;
  background: white;
  padding: 16px;
  border-bottom: 2px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.invoice-template {
  max-width: 210mm;
  margin: 32px auto;
  padding: 20mm;
  background: white;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  font-family: 'Arial', sans-serif;
  color: #333;
}

// Header
.invoice-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 30px;

  .company-info {
    flex: 1;

    .company-name {
      font-size: 24px;
      font-weight: bold;
      color: #1976d2;
      margin: 0 0 8px 0;
    }

    p {
      margin: 4px 0;
      font-size: 12px;
      color: #666;
    }
  }

  .invoice-title {
    text-align: right;

    h2 {
      font-size: 32px;
      font-weight: bold;
      color: #1976d2;
      margin: 0 0 8px 0;
    }

    .invoice-number {
      font-size: 16px;
      font-weight: bold;
      margin: 4px 0;
    }

    .invoice-date {
      font-size: 14px;
      color: #666;
      margin: 4px 0;
    }
  }
}

.invoice-divider {
  height: 3px;
  background: linear-gradient(to right, #1976d2, #64b5f6);
  margin: 20px 0;
}

// Info Section
.invoice-info-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  margin-bottom: 30px;

  .client-box,
  .order-box {
    border: 2px solid #e0e0e0;
    padding: 16px;
    border-radius: 8px;

    h3 {
      font-size: 14px;
      font-weight: bold;
      color: #1976d2;
      margin: 0 0 12px 0;
      text-transform: uppercase;
      border-bottom: 2px solid #e0e0e0;
      padding-bottom: 6px;
    }

    p {
      margin: 6px 0;
      font-size: 13px;
      line-height: 1.4;
    }

    .client-name {
      font-size: 15px;
      margin-bottom: 10px;
    }
  }

  .receipts-info {
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid #e0e0e0;

    .receipt-line {
      font-size: 12px;
      margin: 4px 0;
    }
  }
}

// Items Table
.items-table-container {
  margin: 30px 0;
}

.items-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;

  thead {
    background: #1976d2;
    color: white;

    th {
      padding: 12px 8px;
      font-weight: bold;
      text-align: left;

      &.text-center {
        text-align: center;
      }

      &.text-right {
        text-align: right;
      }
    }
  }

  tbody {
    tr {
      border-bottom: 1px solid #e0e0e0;

      &:hover {
        background: #f5f5f5;
      }

      td {
        padding: 12px 8px;

        &.text-center {
          text-align: center;
        }

        &.text-right {
          text-align: right;
        }
      }
    }
  }
}

// Totals
.totals-section {
  display: flex;
  justify-content: flex-end;
  margin: 30px 0;

  .totals-box {
    min-width: 350px;
    border: 2px solid #1976d2;
    border-radius: 8px;
    padding: 16px;
    background: #f5f9ff;

    .total-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      font-size: 14px;

      &:not(:last-child) {
        border-bottom: 1px solid #e0e0e0;
      }

      &.total-final {
        font-size: 18px;
        padding: 12px 0;
        color: #1976d2;
        border-top: 3px solid #1976d2;
        margin-top: 8px;
      }
    }
  }
}

// Notes
.notes-section {
  margin: 30px 0;
  padding: 16px;
  background: #f9f9f9;
  border-left: 4px solid #1976d2;
  border-radius: 4px;

  h3 {
    font-size: 14px;
    font-weight: bold;
    color: #1976d2;
    margin: 0 0 8px 0;
  }

  p {
    margin: 0;
    font-size: 13px;
    line-height: 1.6;
  }
}

// Packing
.packing-section {
  margin: 30px 0;
  padding: 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;

  h3 {
    font-size: 14px;
    font-weight: bold;
    color: #1976d2;
    margin: 0 0 12px 0;
  }

  .packing-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;

    p {
      margin: 0;
      font-size: 13px;
    }
  }
}

// Packages
.packages-section {
  margin: 30px 0;

  h3 {
    font-size: 14px;
    font-weight: bold;
    color: #1976d2;
    margin: 0 0 12px 0;
  }

  .packages-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 12px;

    thead {
      background: #f5f5f5;

      th {
        padding: 8px;
        text-align: left;
        border-bottom: 2px solid #e0e0e0;
      }
    }

    tbody {
      td {
        padding: 8px;
        border-bottom: 1px solid #e0e0e0;
      }
    }
  }
}

// Shipping Label
.shipping-label-section {
  margin: 30px 0;
  padding: 16px;
  border: 2px dashed #1976d2;
  border-radius: 8px;

  h3 {
    font-size: 14px;
    font-weight: bold;
    color: #1976d2;
    margin: 0 0 12px 0;
  }

  .shipping-label-box {
    p {
      margin: 4px 0;
      font-size: 13px;
    }

    .shipping-weights {
      display: flex;
      gap: 20px;
      margin-top: 8px;
      padding-top: 8px;
      border-top: 1px solid #e0e0e0;
      font-size: 12px;
    }
  }
}

// Footer
.invoice-footer {
  margin-top: 50px;
  padding-top: 20px;
  border-top: 2px solid #e0e0e0;
  text-align: center;

  .footer-text {
    font-size: 14px;
    font-style: italic;
    color: #666;
    margin: 0 0 8px 0;
  }

  .footer-legal {
    font-size: 12px;
    color: #999;
    margin: 0;
  }
}

// Loading
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 16px;

  p {
    font-size: 16px;
    color: #666;
  }
}

// ✅ PRINT STYLES MIGLIORATI
@media print {

  // Nascondi bottoni
  .no-print {
    display: none !important;
  }

  // Reset pagina
  .print-invoice-page {
    background: white !important;
    margin: 0 !important;
    padding: 0 !important;
  }

  // Template
  .invoice-template {
    max-width: 100%;
    margin: 0;
    padding: 10mm;
    box-shadow: none;
  }

  // Evita interruzioni
  .invoice-header,
  .invoice-info-section,
  .items-table-container,
  .totals-section,
  .notes-section,
  .packing-section,
  .packages-section,
  .shipping-label-section,
  .invoice-footer {
    page-break-inside: avoid;
  }

  // Pagina
  @page {
    margin: 10mm;
    size: A4 portrait;
  }

  // ✅ NASCONDI TABELLE HOVER
  .items-table tbody tr:hover {
    background: transparent !important;
  }
}
</style>

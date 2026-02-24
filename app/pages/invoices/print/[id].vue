<template>
  <q-page class="print-invoice-page">

    <!-- toolbar nascosta in stampa -->
    <div class="print-actions no-print">
      <q-btn flat dense icon="arrow_back" label="Indietro" @click="handleBack" />
      <q-btn unelevated color="primary" icon="print" label="Stampa / PDF" @click="handlePrint" />
    </div>

    <!-- Loading -->
    <div class="loading-container" v-if="loading">
      <q-spinner size="48px" color="primary" />
      <p>Caricamento fattura...</p>
    </div>

    <!-- ===================== TEMPLATE FATTURA ===================== -->
    <div class="invoice-template" v-if="invoice && !loading">

      <!-- ── TOP HEADER: logo sx + loghi certificazioni dx ── -->
      <div class="inv-top-header">

        <!-- SX: logo principale + dati azienda -->
        <div class="company-block">
          <img src="/images/invoice/logo-main.png" class="logo-main" alt="Logo" />
          <div class="company-address">
            <p>Calle Vivarini, 6/A - 30141 Murano - Venezia (Italy)</p>
            <p>Tel. (0039) 041 5274633 - 041 5275110 - Fax 041 5275827</p>
            <p>R.E.A. 327708 - Capitale Sociale € 50.000,00</p>
            <p>info@newmuranogallery.it - www.newmuranogallery.it</p>
            <p>Codice Fiscale - Partita IVA IT 03662440274</p>
          </div>
        </div>

        <!-- DX: loghi promo + certificazioni -->
        <div class="logos-block">
          <div class="promo-logos">
            <img src="/images/invoice/logo-promo01.jpg" class="logo-promo" alt="" />
            <img src="/images/invoice/logo-promo02.jpg" class="logo-promo" alt="" />
          </div>
          <div class="cert-logos">
            <img src="/images/invoice/logo-ministry.png" class="logo-cert" alt="Ministero" />
            <img src="/images/invoice/logo-iso.png" class="logo-cert" alt="ISO 9001:2015" />
          </div>
        </div>

      </div>

      <!-- ── RIGA INTESTATARIO + BOX FATTURA ── -->
      <div class="inv-client-row">

        <!-- Cliente: nome + indirizzo (col destra) -->
        <div class="client-address-block">
          <p class="client-name">
            <span v-if="invoice.client.company">{{ invoice.client.company }}</span>
            <span v-else>{{ invoice.client.lastname }} {{ invoice.client.firstname }}</span>
          </p>
          <p v-if="invoice.client.address">{{ invoice.client.address }}</p>
          <p v-if="invoice.client.cap || invoice.client.city">
            {{ invoice.client.cap }} - {{ invoice.client.city }}
            <span v-if="invoice.client.region">({{ invoice.client.region }})</span>
          </p>
          <p v-if="invoice.client.state">{{ invoice.client.state }}</p>
        </div>

        <!-- Box FATTURA / PROFORMA -->
        <div class="invoice-type-block">
          <div class="invoice-type-label">{{ invoiceTypeLabel }}</div>
          <table class="invoice-meta-table">
            <tbody>
              <tr>
                <td class="meta-key">NR.</td>
                <td class="meta-val">{{ invoiceFullNumber }}</td>
                <td class="meta-key">DATA</td>
                <td class="meta-val">{{ formatDate(invoice.invoiceDate) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>

      <!-- ── RIGA DATI PAGAMENTO / SPEDIZIONE ── -->
      <table class="inv-meta-row">
        <thead>
          <tr>
            <th>P.IVA</th>
            <th>SCONTRINO N.</th>
            <th>SPEDIZIONE A MEZZO</th>
            <th>DESCRIZIONE PAGAMENTO</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{{ invoice.client.piva || '' }}</td>
            <td>
              <span v-for="(r, i) in receipts" :key="i">
                {{ r.number }}<span v-if="r.date"> del {{ formatDate(r.date) }}</span>
                <br v-if="i < receipts.length - 1" />
              </span>
            </td>
            <td>{{ invoice.shipping || '' }}</td>
            <td>{{ invoice.payment || '' }}</td>
          </tr>
        </tbody>
      </table>

      <!-- ── RIF. COMMISSIONE ── -->
      <div class="inv-rif-row" v-if="invoice.commNum">
        <span class="rif-label">RIF.</span>
        <span class="rif-value">{{ invoice.commNum }}</span>
      </div>

      <!-- ── TABELLA ARTICOLI ── -->
      <table class="inv-items-table">
        <thead>
          <tr>
            <th class="col-art">ART.</th>
            <th class="col-qty">QUANTITÀ</th>
            <th class="col-desc">DESCRIZIONE</th>
            <th class="col-price">PREZZO</th>
            <th class="col-total">IMPORTO</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, idx) in invoice.items" :key="idx">
            <td class="col-art">{{ item.code || '' }}</td>
            <td class="col-qty text-center">{{ item.quantity }}</td>
            <td class="col-desc">{{ item.description }}</td>
            <td class="col-price text-right">{{ formatCurrency(item.unitPrice) }}</td>
            <td class="col-total text-right">{{ formatCurrency(item.quantity * item.unitPrice) }}</td>
          </tr>

          <!-- Note / Made in Italy / Conai -->
          <tr class="notes-row" v-if="invoice.notes || hasPacking">
            <td colspan="2" class="notes-left">
              <p v-if="invoice.notes">{{ invoice.notes }}</p>
              <p class="made-in">MADE IN ITALY</p>
              <p>M.f.r.: New Murano Gallery</p>
              <p v-if="invoice.commNum">Sender's reference: {{ invoice.commNum }}</p>
              <p>CONTRIBUTO AMBIENTALE CONAI ASSOLTO</p>
            </td>
            <td colspan="3" class="totals-packing-cell">

              <!-- Totali -->
              <div class="totals-block">
                <div class="total-line">
                  <span>Total</span>
                  <span>{{ formatCurrency(invoice.taxable) }}</span>
                </div>
                <div class="total-line" v-if="invoice.financial?.deposit || invoice.deposit">
                  <span>Deposito</span>
                  <span>{{ formatCurrency(invoice.deposit || 0) }}</span>
                </div>
                <div class="total-line" v-if="invoice.financial?.cod || invoice.cod">
                  <span>C.O.D.</span>
                  <span>{{ formatCurrency(invoice.cod || 0) }}</span>
                </div>
                <div class="total-line seao">
                  <span></span>
                  <span>S. E. &amp; O.</span>
                </div>
              </div>

              <!-- Packing info (integrata nella cella come nell'esempio) -->
              <div class="packing-inline" v-if="hasPacking">
                <div class="packing-boxes-row">
                  <span>Total boxes: <strong>{{ invoice.packing?.numPackages || totalPackages }}</strong></span>
                  <span v-if="packingMeasures">measures cm. <strong>{{ packingMeasures }}</strong></span>
                </div>
                <div class="packing-weights-row">
                  <span>T.W. kg. <strong>{{ invoice.packing?.grossWeight || '' }}</strong></span>
                  <span>N.W. kg. <strong>{{ invoice.packing?.netWeight || '' }}</strong></span>
                </div>
              </div>

            </td>
          </tr>
        </tbody>
      </table>

      <!-- ── DETTAGLIO PACCHI (se multipli) ── -->
      <table class="inv-packages-table" v-if="invoice.packages && invoice.packages.length > 1">
        <thead>
          <tr>
            <th>N. Pacco</th>
            <th>Dim. cm (L × P × H)</th>
            <th>Peso Lordo kg</th>
            <th>Peso Netto kg</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(pkg, idx) in invoice.packages" :key="idx">
            <td class="text-center">{{ idx + 1 }}</td>
            <td class="text-center">{{ pkg.size1 }} × {{ pkg.size2 }} × {{ pkg.size3 }}</td>
            <td class="text-center">{{ pkg.grossWeight }}</td>
            <td class="text-center">{{ pkg.netWeight }}</td>
          </tr>
        </tbody>
      </table>

      <!-- ── FOOTER TOTALE FATTURA ── -->
      <table class="inv-footer-table">
        <thead>
          <tr>
            <th>IMPONIBILE</th>
            <th>IMPOSTA</th>
            <th>NOTE E ART. DI LEGGE</th>
            <th>TOTALE FATTURA</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="text-center">{{ formatCurrency(invoice.taxable) }}</td>
            <td class="text-center">
              <span v-if="invoice.hasVat">{{ formatCurrency(invoice.vatAmount) }}</span>
            </td>
            <td class="text-center">
              <span v-if="!invoice.hasVat">Art. 8 lett. a) DPR 633/72 - Operazione non imponibile</span>
            </td>
            <td class="text-center grand-total">
              {{ formatCurrency(invoice.total) }}
              <div class="seao-small">S.E.&amp;O.</div>
            </td>
          </tr>
        </tbody>
      </table>

    </div><!-- /invoice-template -->

  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const invoice = ref(null)
const loading = ref(true)

// ─── Caricamento ───
onMounted(async () => {
  const id = route.params.id
  try {
    const { data } = await useFetch(`/api/invoices/${id}`)
    if (data.value?.invoice) {
      invoice.value = data.value.invoice
    }
  } catch (err) {
    console.error('Errore caricamento fattura:', err)
  } finally {
    loading.value = false
  }
})

// ─── Computed ───

const invoiceTypeLabel = computed(() => {
  if (!invoice.value) return 'FATTURA'
  return invoice.value.invoiceType === 'P' ? 'PROFORMA' : 'FATTURA'
})

const invoiceFullNumber = computed(() => {
  if (!invoice.value) return ''
  const num = String(invoice.value.invoiceNumber || invoice.value.invoiceId || '').padStart(3, '0')
  const year = String(invoice.value.invoiceYear || new Date().getFullYear()).slice(-2)
  return `${num}/${year}`
})

const receipts = computed(() => {
  return (invoice.value?.receipts || []).filter(r => r.number)
})

const hasPacking = computed(() => {
  const p = invoice.value?.packing
  if (!p) return false
  return p.numPackages || p.packageSize || p.grossWeight || p.netWeight ||
    (invoice.value?.packages && invoice.value.packages.length > 0)
})

const totalPackages = computed(() => {
  return invoice.value?.packages?.length || 1
})

const packingMeasures = computed(() => {
  const p = invoice.value?.packing
  if (p?.packageSize) return p.packageSize
  // Se c'è un solo pacco, prendi le misure da lì
  const pkgs = invoice.value?.packages
  if (pkgs && pkgs.length === 1) {
    const pkg = pkgs[0]
    return `${pkg.size1 || 0} x ${pkg.size2 || 0} x ${pkg.size3 || 0}`
  }
  return ''
})

// ─── Formatters ───

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('it-IT', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  })
}

const formatCurrency = (val) => {
  if (val === null || val === undefined || val === '') return ''
  return Number(val).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €'
}

// ─── Azioni ───

const handleBack = () => {
  router.back()
}

const handlePrint = () => {
  window.print()
}
</script>

<style scoped lang="scss">
// ══════════════════════════════════════════════
// VARIABILI
// ══════════════════════════════════════════════
$border: #333;
$border-light: #999;
$font-main: 'Arial', sans-serif;
$font-size-base: 11px;
$font-size-sm: 10px;
$font-size-xs: 9px;

* { box-sizing: border-box; }

// ══════════════════════════════════════════════
// PAGE WRAPPER
// ══════════════════════════════════════════════
.print-invoice-page {
  background: #f0f0f0;
  min-height: 100vh;
  padding: 0;
}

.print-actions {
  position: sticky;
  top: 0;
  z-index: 100;
  background: white;
  padding: 12px 20px;
  border-bottom: 2px solid #ddd;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 6px rgba(0,0,0,.12);
}

// ══════════════════════════════════════════════
// TEMPLATE A4
// ══════════════════════════════════════════════
.invoice-template {
  max-width: 210mm;
  min-height: 297mm;
  margin: 24px auto;
  padding: 12mm 14mm;
  background: white;
  box-shadow: 0 0 24px rgba(0,0,0,.18);
  font-family: $font-main;
  font-size: $font-size-base;
  color: #111;
}

// ══════════════════════════════════════════════
// TOP HEADER: logo + dati azienda | loghi dx
// ══════════════════════════════════════════════
.inv-top-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
  padding-bottom: 8px;
  border-bottom: 2px solid $border;
}

.company-block {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;

  .logo-main {
    max-height: 70px;
    max-width: 220px;
    object-fit: contain;
  }

  .company-address {
    p {
      margin: 1px 0;
      font-size: $font-size-xs;
      line-height: 1.4;
      color: #333;
    }
  }
}

.logos-block {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;

  .promo-logos {
    display: flex;
    gap: 8px;
    align-items: center;

    .logo-promo {
      max-height: 50px;
      max-width: 120px;
      object-fit: contain;
    }
  }

  .cert-logos {
    display: flex;
    gap: 8px;
    align-items: center;

    .logo-cert {
      max-height: 36px;
      max-width: 80px;
      object-fit: contain;
    }
  }
}

// ══════════════════════════════════════════════
// RIGA CLIENTE + BOX TIPO FATTURA
// ══════════════════════════════════════════════
.inv-client-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin: 10px 0;
  gap: 20px;
}

.client-address-block {
  flex: 1;
  text-align: center;

  .client-name {
    font-size: 14px;
    font-weight: bold;
    text-transform: uppercase;
    margin-bottom: 4px;
  }

  p {
    margin: 2px 0;
    font-size: $font-size-base;
  }
}

.invoice-type-block {
  min-width: 160px;
  border: 1px solid $border;
  padding: 4px 8px;

  .invoice-type-label {
    font-size: 13px;
    font-weight: bold;
    text-align: center;
    text-transform: uppercase;
    background: #e8e8e8;
    padding: 2px 0;
    margin-bottom: 4px;
    letter-spacing: 1px;
  }

  .invoice-meta-table {
    width: 100%;
    border-collapse: collapse;
    font-size: $font-size-sm;

    td {
      padding: 2px 4px;
    }

    .meta-key {
      font-size: $font-size-xs;
      color: #666;
      font-weight: bold;
      white-space: nowrap;
    }

    .meta-val {
      font-weight: bold;
      font-size: $font-size-base;
    }
  }
}

// ══════════════════════════════════════════════
// RIGA META (P.IVA / SCONTRINO / SPEDIZIONE / PAGAMENTO)
// ══════════════════════════════════════════════
.inv-meta-row {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid $border;
  margin-bottom: 2px;
  font-size: $font-size-sm;

  thead th {
    background: #e8e8e8;
    border: 1px solid $border-light;
    padding: 3px 6px;
    font-size: $font-size-xs;
    font-weight: bold;
    text-transform: uppercase;
    text-align: left;
  }

  tbody td {
    border: 1px solid $border-light;
    padding: 4px 6px;
    font-size: $font-size-base;
    vertical-align: top;
  }
}

// ══════════════════════════════════════════════
// RIGA RIF. COMMISSIONE
// ══════════════════════════════════════════════
.inv-rif-row {
  border: 1px solid $border-light;
  border-top: none;
  padding: 3px 6px;
  font-size: $font-size-base;
  margin-bottom: 6px;

  .rif-label {
    font-size: $font-size-xs;
    font-weight: bold;
    text-transform: uppercase;
    color: #555;
    margin-right: 8px;
  }

  .rif-value {
    font-weight: bold;
    font-size: 13px;
  }
}

// ══════════════════════════════════════════════
// TABELLA ARTICOLI (corpo fattura)
// ══════════════════════════════════════════════
.inv-items-table {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid $border;
  margin-bottom: 6px;
  font-size: $font-size-base;

  thead tr {
    background: #e8e8e8;

    th {
      border: 1px solid $border-light;
      padding: 4px 6px;
      font-size: $font-size-xs;
      font-weight: bold;
      text-transform: uppercase;
      text-align: center;
    }
  }

  tbody td {
    border: 1px solid $border-light;
    padding: 4px 6px;
    vertical-align: top;
  }

  .col-art   { width: 6%; text-align: center; }
  .col-qty   { width: 8%; text-align: center; }
  .col-desc  { width: 52%; }
  .col-price { width: 14%; text-align: right; }
  .col-total { width: 14%; text-align: right; }

  .text-center { text-align: center; }
  .text-right  { text-align: right; }

  // Riga note + totali + packing
  .notes-row {
    td {
      vertical-align: top;
      padding: 8px 6px;
    }

    .notes-left {
      p {
        margin: 2px 0;
        font-size: $font-size-sm;
      }
      .made-in {
        font-weight: bold;
        margin-top: 8px;
      }
    }

    .totals-packing-cell {
      vertical-align: top;
    }
  }
}

// ══════════════════════════════════════════════
// TOTALI INLINE
// ══════════════════════════════════════════════
.totals-block {
  .total-line {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 3px 0;
    font-size: $font-size-base;
    border-bottom: 1px dashed #ccc;

    &:last-child { border-bottom: none; }

    &.seao {
      font-style: italic;
      font-size: $font-size-xs;
      color: #555;
    }
  }
}

// ══════════════════════════════════════════════
// PACKING INLINE (dentro la cella articoli)
// ══════════════════════════════════════════════
.packing-inline {
  margin-top: 12px;
  border-top: 1px solid $border-light;
  padding-top: 6px;
  font-size: $font-size-sm;

  .packing-boxes-row,
  .packing-weights-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 3px;
  }
}

// ══════════════════════════════════════════════
// TABELLA DETTAGLIO PACCHI (se > 1 pacco)
// ══════════════════════════════════════════════
.inv-packages-table {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid $border-light;
  margin-bottom: 6px;
  font-size: $font-size-sm;

  thead th {
    background: #f0f0f0;
    border: 1px solid $border-light;
    padding: 3px 6px;
    font-size: $font-size-xs;
    font-weight: bold;
    text-align: center;
  }

  tbody td {
    border: 1px solid $border-light;
    padding: 3px 6px;
    text-align: center;
  }
}

// ══════════════════════════════════════════════
// FOOTER TOTALE FATTURA
// ══════════════════════════════════════════════
.inv-footer-table {
  width: 100%;
  border-collapse: collapse;
  border: 2px solid $border;
  margin-top: 8px;
  font-size: $font-size-base;

  thead th {
    background: #e8e8e8;
    border: 1px solid $border-light;
    padding: 4px 8px;
    font-size: $font-size-xs;
    font-weight: bold;
    text-transform: uppercase;
    text-align: center;
  }

  tbody td {
    border: 1px solid $border-light;
    padding: 8px;
    font-size: $font-size-base;
    vertical-align: middle;
    min-height: 36px;
  }

  .grand-total {
    font-size: 14px;
    font-weight: bold;
  }

  .seao-small {
    font-size: $font-size-xs;
    font-style: italic;
    color: #555;
    margin-top: 2px;
  }
}

// ══════════════════════════════════════════════
// LOADING
// ══════════════════════════════════════════════
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 16px;

  p { font-size: 16px; color: #666; }
}

// ══════════════════════════════════════════════
// PRINT
// ══════════════════════════════════════════════
@media print {
  .no-print { display: none !important; }

  .print-invoice-page {
    background: white !important;
    padding: 0 !important;
  }

  .invoice-template {
    max-width: 100%;
    margin: 0;
    padding: 8mm 10mm;
    box-shadow: none;
  }

  .inv-top-header,
  .inv-client-row,
  .inv-meta-row,
  .inv-rif-row,
  .inv-items-table,
  .inv-packages-table,
  .inv-footer-table {
    page-break-inside: avoid;
  }

  @page {
    margin: 8mm;
    size: A4 portrait;
  }
}
</style>
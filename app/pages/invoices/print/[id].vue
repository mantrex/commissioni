<template>
  <q-page class="print-invoice-page">
    <!-- toolbar nascosta in stampa -->
    <div class="print-actions no-print">
      <q-btn
        flat
        dense
        icon="arrow_back"
        label="Indietro"
        @click="handleBack" />
      <q-btn
        unelevated
        color="primary"
        icon="print"
        label="Stampa / PDF"
        @click="handlePrint" />
    </div>

    <!-- Loading -->
    <div class="loading-container no-print" v-if="loading">
      <q-spinner size="48px" color="primary" />
      <p>Caricamento fattura...</p>
    </div>

    <!-- ===================== TEMPLATE FATTURA ===================== -->
    <div class="invoice-template" v-if="invoice && !loading">
      <!-- Wrapper: flex column, altezza esatta 1 pagina A4 -->
      <div class="invoice-page-inner">
        <!-- Corpo che si espande -->
        <div class="invoice-body">
          <!-- ── TOP HEADER ── -->
          <div class="inv-top-header">
            <div class="company-block">
              <div class="logo-main-wrapper">
                <img
                  src="/images/invoice/logo-main-2.png"
                  class="logo-main"
                  alt="Logo" />
              </div>
              <div class="company-address">
                <p>Calle Vivarini, 6/A - 30141 Murano - Venezia (Italy)</p>
                <p>Tel. (0039) 041 5274633 - 041 5275110 - Fax 041 5275827</p>
                <p>R.E.A. 327708 - Capitale Sociale € 50.000,00</p>
                <p>info@newmuranogallery.it - www.newmuranogallery.it</p>
                <p>Codice Fiscale - Partita IVA IT 03662440274</p>
              </div>
            </div>
            <div class="logos-block">
              <div class="promo-logos">
                <img
                  src="/images/invoice/logo-promo01.jpg"
                  class="logo-promo logo-promo-first logo-first"
                  alt="" />
                <img
                  src="/images/invoice/logo-promo02.jpg"
                  class="logo-promo logo-promo-second logo-second"
                  alt="" />
              </div>
              <div class="cert-logos">
                <img
                  src="/images/invoice/logo-ministry.png"
                  class="logo-cert logo-cert-first cert-first"
                  alt="Ministero" />
                <img
                  src="/images/invoice/logo-iso.png"
                  class="logo-cert logo-cert-second cert-second"
                  alt="ISO 9001:2015" />
              </div>
            </div>
          </div>

          <!-- ── BOX FATTURA (sx) + INTESTATARIO (dx) ── -->
          <div class="inv-client-row">
            <!-- SX: box tipo fattura -->
            <div class="invoice-type-block">
              <div class="invoice-type-label">{{ invoiceTypeLabel }}</div>
              <table class="invoice-meta-table">
                <tbody>
                  <tr>
                    <td class="meta-key">NR.</td>
                    <td class="meta-val">{{ invoiceFullNumber }}</td>
                    <td class="meta-key">DATA</td>
                    <td class="meta-val">
                      {{ formatDate(invoice.invoiceDate) }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- DX: cliente centrato -->
            <div class="client-address-block">
              <p class="client-name">
                <span v-if="invoice.client.company">{{
                  invoice.client.company
                }}</span>
                <span v-else
                  >{{ invoice.client.lastname }}
                  {{ invoice.client.firstname }}</span
                >
              </p>
              <p v-if="invoice.client.address">{{ invoice.client.address }}</p>
              <p v-if="invoice.client.cap || invoice.client.city">
                {{ invoice.client.cap }} - {{ invoice.client.city }}
                <span v-if="invoice.client.region"
                  >({{ invoice.client.region }})</span
                >
              </p>
              <p v-if="invoice.client.state">{{ invoice.client.state }}</p>
            </div>
          </div>

          <!-- ── RIGA META (P.IVA / SCONTRINO / SPEDIZIONE / PAGAMENTO) ── -->
          <table class="inv-meta-row">
            <thead>
              <tr>
                <th>P.IVA</th>
                <th>SPEDIZIONE A MEZZO</th>
                <th>DESCRIZIONE PAGAMENTO</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{{ invoice.client.piva || "" }}</td>
                <td>{{ invoice.shipping || "" }}</td>
                <td>{{ invoice.payment || "" }}</td>
              </tr>
            </tbody>
          </table>

          <!-- ── RIF ── -->
          <div class="inv-rif-row">
            <span class="rif-label">RIF.</span>
            <span class="rif-value">{{ invoice.commNum || "" }}</span>
          </div>

          <!-- ── TABELLA ARTICOLI (si espande per riempire) ── -->
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
                <td class="col-art">{{ item.code || "" }}</td>
                <td class="col-qty text-center">{{ item.quantity }}</td>
                <td class="col-desc">{{ item.description }}</td>
                <td class="col-price text-right">
                  {{ formatCurrency(item.unitPrice) }}
                </td>
                <td class="col-total text-right">
                  {{ formatCurrency(item.quantity * item.unitPrice) }}
                </td>
              </tr>

              <!-- Riga note + totali + packing -->
              <tr class="notes-row">
                <td colspan="2" class="notes-left">
                  <p v-if="invoice.notes">{{ invoice.notes }}</p>
                  <p class="made-in">MADE IN ITALY</p>
                  <p>M.f.r.: New Murano Gallery</p>
                  <p v-if="invoice.commNum">
                    Sender's reference: {{ invoice.commNum }}
                  </p>
                  <p>CONTRIBUTO AMBIENTALE CONAI ASSOLTO</p>
                </td>
                <td colspan="3" class="totals-packing-cell">
                  <div class="totals-block">
                    <div class="total-line">
                      <span>Total</span>
                      <span>{{ formatCurrency(invoice.taxable) }}</span>
                    </div>
                    <div class="total-line" v-if="invoice.deposit">
                      <span>Deposito</span>
                      <span>{{ formatCurrency(invoice.deposit) }}</span>
                    </div>
                    <div class="total-line" v-if="invoice.cod">
                      <span>C.O.D.</span>
                      <span>{{ formatCurrency(invoice.cod) }}</span>
                    </div>
                    <div class="total-line seao">
                      <span></span><span>S. E. &amp; O.</span>
                    </div>
                  </div>
                  <div class="packing-inline" v-if="hasPacking">
                    <div class="packing-boxes-row">
                      <span
                        >Total boxes:
                        <strong>{{
                          invoice.packing?.numPackages || totalPackages
                        }}</strong></span
                      >
                      <span v-if="packingMeasures"
                        >measures cm.
                        <strong>{{ packingMeasures }}</strong></span
                      >
                    </div>
                    <div class="packing-weights-row">
                      <span
                        >T.W. kg.
                        <strong>{{
                          invoice.packing?.grossWeight || ""
                        }}</strong></span
                      >
                      <span
                        >N.W. kg.
                        <strong>{{
                          invoice.packing?.netWeight || ""
                        }}</strong></span
                      >
                    </div>
                  </div>
                </td>
              </tr>

              <!-- Riga spacer: prende tutto lo spazio rimanente -->
              <tr class="spacer-row">
                <td colspan="5"></td>
              </tr>
            </tbody>
          </table>

          <!-- ── PACCHI MULTIPLI ── -->
          <table
            class="inv-packages-table"
            v-if="invoice.packages && invoice.packages.length > 1">
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
                <td class="text-center">
                  {{ pkg.size1 }} × {{ pkg.size2 }} × {{ pkg.size3 }}
                </td>
                <td class="text-center">{{ pkg.grossWeight }}</td>
                <td class="text-center">{{ pkg.netWeight }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <!-- /invoice-body -->

        <!-- ── FOOTER FISSO IN FONDO ── -->
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
              <td>{{ formatCurrency(invoice.taxable) }}</td>
              <td>
                <span v-if="invoice.hasVat">{{
                  formatCurrency(invoice.vatAmount)
                }}</span>
              </td>
              <td>
                <span v-if="!invoice.hasVat"
                  >Art. 8 lett. a) DPR 633/72 - Operazione non imponibile</span
                >
              </td>
              <td class="grand-total">
                {{ formatCurrency(invoice.total) }}
                <div class="seao-small">S.E.&amp;O.</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <!-- /invoice-page-inner -->
    </div>
    <!-- /invoice-template -->
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();
const invoice = ref(null);
const loading = ref(true);

onMounted(async () => {
  const id = route.params.id;
  try {
    const { data } = await $(`/api/invoices/${id}`);
    if (data?.invoice) invoice.value = data.value.invoice;
  } catch (err) {
    console.error("Errore caricamento fattura:", err);
  } finally {
    loading.value = false;
  }
});

const invoiceTypeLabel = computed(() => {
  return "FATTURA PROFORMA";
});

const invoiceFullNumber = computed(() => {
  return invoice.value.invoiceId
});

const receipts = computed(() =>
  (invoice.value?.receipts || []).filter((r) => r.number),
);

const hasPacking = computed(() => {
  const p = invoice.value?.packing;
  if (!p) return false;
  return (
    p.numPackages ||
    p.packageSize ||
    p.grossWeight ||
    p.netWeight ||
    invoice.value?.packages?.length > 0
  );
});

const totalPackages = computed(() => invoice.value?.packages?.length || 1);

const packingMeasures = computed(() => {
  const p = invoice.value?.packing;
  if (p?.packageSize) return p.packageSize;
  const pkgs = invoice.value?.packages;
  if (pkgs?.length === 1)
    return `${pkgs[0].size1 || 0} x ${pkgs[0].size2 || 0} x ${
      pkgs[0].size3 || 0
    }`;
  return "";
});

const formatDate = (date) => {
  if (!date) return "";
  return new Date(date).toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const formatCurrency = (val) => {
  if (val === null || val === undefined || val === "") return "";
  return (
    Number(val).toLocaleString("it-IT", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + " €"
  );
};

const handleBack = () => router.back();
const handlePrint = () => window.print();
</script>

<style scoped lang="scss">


$font-size-base: 11px;
$font-size-sm: 10px;
$font-size-xs: 9px;

* {
  box-sizing: border-box;
}

// ── Page wrapper ─────────────────────────────────
.print-invoice-page {
  background: $quasi;
  min-height: unset !important;
  padding: 0 !important;
}

.print-actions {
  position: sticky;
  top: 0;
  z-index: 100;
  background: $contrast;
  padding: 12px 20px;
  border-bottom: 2px solid $border-dark;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
}

// ── A4 wrapper ───────────────────────────────────
.invoice-template {
  width: 210mm;
  margin: 24px auto;
  background: $contrast;
  box-shadow: 0 0 24px rgba(0, 0, 0, 0.18);
  font-family: "Arial", sans-serif;
  font-size: $font-size-base;
  color: #111;
}

// Inner page: flex column a esattamente 1 A4
.invoice-page-inner {
  width: 100%;
  height: 277mm; // 297mm - 2*10mm padding
  padding: 10mm 12mm;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

// Body che cresce
.invoice-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
}

// ── Top Header ───────────────────────────────────
.inv-top-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
  padding-bottom: 6px;
  border-bottom: 2px solid $primary;
  flex-shrink: 0;

  .company-block {
    display: flex;
    flex-direction: column;
    gap: 4px;
    flex: 1;

    .logo-main-wrapper {
      object-fit: contain;
      display: block;
      position: relative;
      left: 0;
      width: 250px;

      .logo-main {
        max-height: 95px;
      }
    }
    .company-address p {
      margin: 1px 0;
      font-size: $font-size-xs;
      line-height: 1.4;
      color: $altcontrast;
      text-align: justify;
      text-align-last: justify;
      width: 250px;
    }
  }

  .logos-block {
    display: flex;
    flex-direction: column;
    gap: 4px;
    width: 300px;

    .promo-logos {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;

      .logo-promo {
        max-height: 54px;
        width: 200px;
        object-fit: contain;
        object-position: center;
      }

      .logo-promo-first {
        object-position: left center;
      }
      .logo-promo-second {
        object-position: right center;
        height:60px
      }
    }

    .cert-logos {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;

      .logo-cert {
        max-height: 50px;
         // ← metà esatta
     
        object-position: center;
      }

      .logo-cert-first {
        object-position: left center;
        border:1px solid $lightgrey;
        display:block;
        height:100px;

      }
      .logo-cert-second {
        object-position: right center;
        height:40px;
      }
    }
  }
}

// ── Riga cliente/fattura ─────────────────────────
.inv-client-row {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin: 8px 0;
  flex-shrink: 0;
}

.invoice-type-block {
  flex-shrink: 0;
  width: 200px;
  border: 1px solid $border-dark;
  padding: 4px 8px;

  .invoice-type-label {
    font-size: 12px;
    font-weight: bold;
    text-align: center;
    text-transform: uppercase;
    background: $th;
    padding: 2px 0;
    margin-bottom: 4px;
    letter-spacing: 0.5px;
  }

  .invoice-meta-table {
    width: 100%;
    border-collapse: collapse;

    td {
      padding: 2px 3px;
    }

    .meta-key {
      font-size: $font-size-xs;
      color: $middle-contrast;
      font-weight: bold;
      white-space: nowrap;
    }

    .meta-val {
      font-weight: bold;
      font-size: $font-size-base;
    }
  }
}

.client-address-block {
  flex: 1;
  text-align: left;
  padding-bottom:16px;
  padding-left:16px;
  .client-name {
    font-size: 14px;
    font-weight: bold;
    text-transform: uppercase;
    margin-bottom: 3px;
  }

  p {
    margin: 1px 0;
    font-size: $font-size-base;
  }
}

// ── Meta row ─────────────────────────────────────
.inv-meta-row {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid $border-dark;
  margin-bottom: 2px;
  flex-shrink: 0;

  thead th {
    background: $th;
    border: 1px solid $border-light;
    padding: 3px 6px;
    font-size: $font-size-xs;
    font-weight: bold;
    text-transform: uppercase;
    text-align: left;
  }

  tbody td {
    border: 1px solid $border-light;
    padding: 3px 6px;
    font-size: $font-size-base;
    vertical-align: top;
    height: 18px;
  }
}

// ── RIF ──────────────────────────────────────────
.inv-rif-row {
  border: 1px solid $border-light;
  border-top: none;
  padding: 3px 6px;
  margin-bottom: 4px;
  flex-shrink: 0;

  .rif-label {
    font-size: $font-size-xs;
    font-weight: bold;
    text-transform: uppercase;
    color: $middle-contrast;
    margin-right: 8px;
  }

  .rif-value {
    font-weight: bold;
    font-size: 13px;
  }
}

// ── Tabella articoli ─────────────────────────────
// Usa height: 100% per espandersi — la tecnica è table-layout fixed + tr spacer
.inv-items-table {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid $border-dark;
  flex: 1; // cresce nel flex container
  margin-bottom: 4px;
  min-height: 0;

  thead tr {
    background: $th;

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

  .col-art {
    width: 7%;
    text-align: center;
  }
  .col-qty {
    width: 8%;
    text-align: center;
  }
  .col-desc {
    width: 51%;
  }
  .col-price {
    width: 14%;
    text-align: right;
  }
  .col-total {
    width: 14%;
    text-align: right;
  }
  .text-center {
    text-align: center;
  }
  .text-right {
    text-align: right;
  }

  .notes-row td {
    vertical-align: top;
    padding: 6px;
  }
  .notes-left p {
    margin: 2px 0;
    font-size: $font-size-sm;
    &.made-in {
      font-weight: bold;
      margin-top: 6px;
    }
  }

  // Il tr spacer prende tutto lo spazio residuo
  .spacer-row {
    height: 100%;
    td {
      height: 100%;
      border-left: 1px solid $border-light;
      border-right: 1px solid $border-light;
      border-top: none;
      border-bottom: none;
    }
  }
}

// ── Totali inline ────────────────────────────────
.totals-block {
  .total-line {
    display: flex;
    justify-content: space-between;
    padding: 2px 0;
    font-size: $font-size-base;
    border-bottom: 1px dashed #ccc;

    &:last-child {
      border-bottom: none;
    }
    &.seao {
      font-style: italic;
      font-size: $font-size-xs;
      color: #555;
    }
  }
}

// ── Packing ──────────────────────────────────────
.packing-inline {
  margin-top: 8px;
  border-top: 1px solid $border-light;
  padding-top: 4px;
  font-size: $font-size-sm;

  .packing-boxes-row,
  .packing-weights-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 2px;
  }
}

// ── Pacchi multipli ──────────────────────────────
.inv-packages-table {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid $border-light;
  margin-bottom: 4px;
  flex-shrink: 0;

  thead th {
    background: $th;
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

// ── Footer sempre in fondo ───────────────────────
.inv-footer-table {
  width: 100%;
  border-collapse: collapse;
  border: 2px solid $border;
  flex-shrink: 0;

  thead th {
    background: $th;
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
    height: 36px;
    text-align: center;
  }

  .grand-total {
    font-size: 15px;
    font-weight: bold;
  }

  .seao-small {
    font-size: $font-size-xs;
    font-style: italic;
    color: $middle-contrast;
    margin-top: 2px;
  }
}

// ── Loading ──────────────────────────────────────
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  gap: 16px;
  p {
    font-size: 16px;
    color: $middle-contrast;
  }
}

// ── STAMPA ───────────────────────────────────────
@media print {
  .no-print {
    display: none !important;
  }

  :global(html),
  :global(body) {
    margin: 0 !important;
    padding: 0 !important;
    height: auto !important;
    overflow: hidden !important;
  }

  .print-invoice-page {
    background: $contrast !important;
    padding: 0 !important;
    margin: 0 !important;
    min-height: unset !important;
    height: auto !important;
    overflow: visible !important;
  }

  .invoice-template {
    width: 100%;
    margin: 0;
    padding: 0;
    box-shadow: none;
    page-break-after: avoid;
  }

  .invoice-page-inner {
    padding: 8mm 10mm;
    // Altezza precisa: 297mm (A4) - 16mm (2 * padding 8mm)
    height: 281mm;
    page-break-inside: avoid;
    page-break-after: avoid;
    overflow: hidden;
  }

  @page {
    margin: 0;
    size: A4 portrait;
  }
}
</style>

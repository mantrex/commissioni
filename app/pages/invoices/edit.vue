<template>
  <q-page class="invoice-edit-page">
    <div class="invoice-edit-container">
      <!-- ✅ HEADER STICKY -->
      <div class="invoice-header-sticky">
        <div class="header-content">
          <div class="header-left">
            <q-btn flat dense round icon="arrow_back" @click="handleBack" size="sm" class="back-btn">
              <q-tooltip>Torna indietro</q-tooltip>
            </q-btn>
            <span class="invoice-info">
              Fattura {{ isNew ? 'Nuova' : invoiceData.invoiceId }}
              <span v-if="commNum" class="separator">•</span>
              <span v-if="commNum" class="comm-ref">Comm. {{ commNum }}</span>
            </span>
          </div>
          <div class="header-actions">
            <q-btn flat dense label="Stampa" icon="print" @click="handlePrint" :disable="isNew"
              class="action-btn print-btn">
              <q-tooltip v-if="isNew">Salva prima la fattura per stamparla</q-tooltip>
            </q-btn>
            <q-btn flat dense label="Annulla" @click="handleCancel" class="action-btn cancel-btn" />
            <q-btn flat dense label="Salva" icon="save" @click="handleSave" :loading="saving"
              class="action-btn save-btn" />
          </div>
        </div>
      </div>

      <!-- Spacer -->
      <div class="header-spacer"></div>

      <!-- 🎯 LAYOUT COMPATTO - 2 COLONNE IN ALTO -->
      <div class="top-section">
        <!-- COLONNA SINISTRA: Cliente + Pacchi -->
        <div class="left-column">
          <!-- Cliente -->
          <q-card flat bordered class="client-card">
            <q-card-section class="section-header">
              <q-icon name="person" size="18px" />
              <span>Dati Cliente</span>
            </q-card-section>
            <q-card-section class="compact-section">
              <div class="compact-grid">
                <q-input v-model="invoiceData.client.lastname" label="Cognome" outlined dense />
                <q-input v-model="invoiceData.client.firstname" label="Nome" outlined dense />
                <q-input v-model="invoiceData.client.title" label="Titolo" outlined dense class="span-2" />
                <q-input v-model="invoiceData.client.company" label="Ditta" outlined dense class="span-2" />
                <q-input v-model="invoiceData.client.address" label="Indirizzo" outlined dense class="span-2" />
                <q-input v-model="invoiceData.client.cap" label="CAP" outlined dense />
                <q-input v-model="invoiceData.client.city" label="Città" outlined dense />
                <q-input v-model="invoiceData.client.region" label="Prov" outlined dense />
                <q-input v-model="invoiceData.client.state" label="Paese" outlined dense />
                <q-input v-model="invoiceData.client.tel" label="Tel" outlined dense class="span-2" />
                <q-input v-model="invoiceData.client.piva" label="P.IVA" outlined dense class="span-2" />
              </div>
            </q-card-section>
          </q-card>

          <!-- Imballo e Pacchi -->
          <q-card flat bordered class="packing-card">
            <q-card-section class="section-header">
              <q-icon name="inventory" size="18px" />
              <span>Imballo e Pacchi</span>
            </q-card-section>
            <q-card-section class="compact-section">
              <div class="compact-grid">
                <q-input v-model="invoiceData.packing.made" label="Made" outlined dense />
                <q-input v-model="invoiceData.packing.whoMakes" label="Chi Fa" outlined dense />
                <q-input v-model.number="invoiceData.packing.numPackages" label="N.Pacchi" type="number" outlined
                  dense />
                <q-input v-model="invoiceData.packing.packageSize" label="Mis" outlined dense />
                <q-input v-model.number="invoiceData.packing.grossWeight" label="P.Lordo" type="number" outlined dense
                  step="0.01" />
                <q-input v-model.number="invoiceData.packing.netWeight" label="P.Netto" type="number" outlined dense
                  step="0.01" />
                <q-input v-model="invoiceData.packing.conai" label="Conai" outlined dense class="span-2" />
              </div>

              <!-- Lista Pacchi compatta -->
              <div class="packages-list q-mt-sm" v-if="invoiceData.packages.length > 0">
                <div class="packages-header">
                  <span class="text-caption text-weight-medium">Pacchi ({{ invoiceData.packages.length }})</span>
                  <q-btn flat dense size="sm" icon="add" color="primary" @click="handleAddPackage">
                    <q-tooltip>Aggiungi pacco</q-tooltip>
                  </q-btn>
                </div>
                <div class="package-item" v-for="(pkg, index) in invoiceData.packages" :key="index">
                  <span class="text-caption">{{ pkg.size1 }}x{{ pkg.size2 }}x{{ pkg.size3 }} cm - {{ pkg.grossWeight
                    }}kg</span>
                  <div>
                    <q-btn flat dense size="xs" round icon="edit" @click="handleEditPackage(pkg, index)" />
                    <q-btn flat dense size="xs" round icon="delete" color="negative"
                      @click="handleRemovePackage(index)" />
                  </div>
                </div>
              </div>
              <q-btn v-else flat dense size="sm" icon="add" label="Aggiungi pacco" color="primary"
                @click="handleAddPackage" class="full-width q-mt-sm" />
            </q-card-section>
          </q-card>
        </div>

        <!-- COLONNA DESTRA: Dati Fattura + Scontrini + Dati Finanziari -->
        <div class="right-column">
          <!-- Dati Fattura -->
          <q-card flat bordered class="data-card">
            <q-card-section class="section-header">
              <q-icon name="description" size="18px" />
              <span>Dati Fattura</span>
            </q-card-section>
            <q-card-section class="compact-section">
              <div class="compact-grid">
                <q-input v-model="invoiceData.invoiceData.invoiceDate" label="Data Fattura" type="date" outlined dense
                  class="span-2" />
                <q-input v-model="invoiceData.invoiceData.commNum" label="Comm" outlined dense readonly />
                <q-select v-model="invoiceData.invoiceData.payment" label="Pagamento" :options="[]" outlined dense
                  emit-value map-options />
                <q-select v-model="invoiceData.invoiceData.shipping" label="Spedizione" :options="[]" outlined dense
                  emit-value map-options />
                <q-select v-model="invoiceData.invoiceData.insurance" label="Assicura" :options="[]" outlined dense
                  emit-value map-options />
                <q-input v-model="invoiceData.invoiceData.notes" label="Note" outlined dense type="textarea" rows="2"
                  class="span-2" />
                <q-checkbox v-model="invoiceData.invoiceData.issued" label="Fattura Emessa" dense class="span-2" />
              </div>
            </q-card-section>
          </q-card>

          <!-- Scontrini -->
          <q-card flat bordered class="receipts-card">
            <q-card-section class="section-header">
              <q-icon name="receipt" size="18px" />
              <span>Scontrini</span>
            </q-card-section>
            <q-card-section class="compact-section">
              <div class="receipt-row" v-for="(receipt, index) in invoiceData.receipts" :key="index">
                <span class="receipt-label">N.Sc. {{ index + 1 }}</span>
                <q-input v-model="receipt.number" placeholder="Numero" outlined dense class="receipt-input" />
                <q-input v-model="receipt.date" type="date" placeholder="Data" outlined dense class="receipt-input" />
              </div>
            </q-card-section>
          </q-card>

          <!-- Dati Finanziari -->
          <q-card flat bordered class="financial-card">
            <q-card-section class="section-header">
              <q-icon name="euro" size="18px" />
              <span>Totale fattura</span>
            </q-card-section>
            <q-card-section class="compact-section">
              <div class="compact-grid">
                <q-input v-model.number="invoiceData.financial.taxable" label="Imponibile" type="number" outlined dense
                  step="0.01" >
                  
              </q-input>
                <q-checkbox v-model="invoiceData.financial.hasVat" label="IVA SI/NO" dense />
                <q-input v-model.number="invoiceData.financial.vatRate" label="% IVA" type="number" outlined dense
                  :disable="!invoiceData.financial.hasVat" />
                <q-input :model-value="invoiceData.financial.vatAmount" label="Importo IVA" outlined dense readonly
                   />
                <q-input :model-value="invoiceData.financial.total" label="Totale" outlined dense readonly 
                  class="text-weight-bold" />
                <q-input v-model.number="invoiceData.financial.deposit" label="Acconto" type="number" outlined dense
                  step="0.01"  />
                <q-input v-model.number="invoiceData.financial.cod" label="Cod" type="number" outlined dense step="0.01"
                   />
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- ARTICOLI - TABELLA FULL WIDTH -->
      <q-card flat bordered class="items-card q-mt-md">
        <q-card-section class="section-header">
          <div class="header-left-items">
            <q-icon name="inventory_2" size="18px" />
            <span>Voci Fattura</span>
            <q-chip v-if="invoiceData.items.length > 0" dense color="primary" text-color="white" size="sm">
              {{ invoiceData.items.length }}
            </q-chip>
          </div>
          <q-btn color="primary" icon="add" label="Aggiungi" unelevated dense size="sm" @click="handleAddInvoiceItem" />
        </q-card-section>
        <q-card-section class="q-pa-none">
          <q-table flat :rows="invoiceData.items" :columns="itemColumns" row-key="_id" dense
            :rows-per-page-options="[0]" hide-pagination class="items-table">

            <template v-slot:body-cell-actions="props">
              <q-td :props="props">
                <q-btn flat dense round icon="edit" size="sm" color="primary"
                  @click="handleEditInvoiceItem(props.row, props.rowIndex)" />
                <q-btn flat dense round icon="delete" size="sm" color="negative"
                  @click="handleRemoveInvoiceItem(props.rowIndex)" />
              </q-td>
            </template>

            <template v-slot:body-cell-unitPrice="props">
              <q-td :props="props" class="text-right">
                {{ formatCurrency(props.row.unitPrice) }}
              </q-td>
            </template>

            <template v-slot:body-cell-total="props">
              <q-td :props="props" class="text-right text-weight-bold">
                {{ formatCurrency((props.row.quantity || 0) * (props.row.unitPrice || 0)) }}
              </q-td>
            </template>

            <template v-slot:no-data>
              <div class="full-width row flex-center q-pa-md text-grey-7">
                <q-icon size="2em" name="inventory_2" class="q-mr-sm" />
                <span>Nessuna voce. Clicca "Aggiungi" per inserirne una.</span>
              </div>
            </template>
          </q-table>
        </q-card-section>
      </q-card>

      <!-- Etichetta Spedizione -->
      <q-card flat bordered class="shipping-card q-mt-md">
        <q-card-section class="section-header">
          <q-icon name="local_shipping" size="18px" />
          <span>Etichetta Spedizione</span>
        </q-card-section>
        <q-card-section class="compact-section">
          <div class="compact-grid">
            <q-input v-model="invoiceData.shippingLabel.line1" label="Riga 1" outlined dense class="span-2" />
            <q-input v-model="invoiceData.shippingLabel.line2" label="Riga 2" outlined dense class="span-2" />
            <q-input v-model="invoiceData.shippingLabel.line3" label="Riga 3" outlined dense class="span-2" />
            <q-input v-model="invoiceData.shippingLabel.line4" label="Riga 4" outlined dense class="span-2" />
            <q-input v-model="invoiceData.shippingLabel.tel" label="Tel" outlined dense />
            <q-input v-model="invoiceData.shippingLabel.content" label="Contenuto" outlined dense />
            <q-input v-model="invoiceData.shippingLabel.netWeight" label="P.Netto" outlined dense />
            <q-input v-model="invoiceData.shippingLabel.grossWeight" label="P.Lordo" outlined dense />
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- Dialog Pacchi -->
    <ComponentDialog v-model="dialogs.package.show" :side="true"
      :custom-style="'min-width: 200px; width: 600px; max-width: 800px'" title="Dati Pacco"
      :component-name="PackageDialog" :component-props="{ package: dialogs.package.data }"
      @close="handlePackageDialogClose" />

    <!-- Dialog Item Fattura -->
    <ComponentDialog v-model="dialogs.invoiceItem.show" :side="true"
      :custom-style="'min-width: 200px; width: 700px; max-width: 900px'" title="Voce Fattura"
      :component-name="InvoiceItemDialog" :component-props="{ item: dialogs.invoiceItem.data }"
      @close="handleInvoiceItemDialogClose" />
  </q-page>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import ComponentDialog from '~/components/common/ComponentDialog.vue'
import PackageDialog from '~/components/invoice-edit/PackageDialog.vue'
import InvoiceItemDialog from '~/components/invoice-edit/InvoiceItemDialog.vue'

const router = useRouter()
const route = useRoute()
const $q = useQuasar()

const invoiceId = computed(() => route.query.id || null)
const commNum = computed(() => route.query.commNum || null)
const isNew = computed(() => !invoiceId.value)
const saving = ref(false)

// Dati fattura
const invoiceData = reactive({
  invoiceId: '',
  invoiceData: {
    invoiceDate: new Date().toISOString().split('T')[0],
    orderId: null,
    commNum: commNum.value || null,
    payment: '',
    shipping: '',
    insurance: '',
    notes: '',
    issued: false
  },
  client: {
    clientId: null,
    firstname: '',
    lastname: '',
    title: '',
    company: '',
    address: '',
    cap: '',
    city: '',
    region: '',
    state: '',
    tel: '',
    piva: ''
  },
  receipts: Array(3).fill(null).map(() => ({ number: '', date: null })),
  items: [],
  financial: {
    taxable: 0,
    hasVat: true,
    vatRate: 22,
    vatAmount: 0,
    total: 0,
    deposit: 0,
    cod: 0
  },
  packing: {
    made: '',
    whoMakes: '',
    numPackages: 0,
    packageSize: '',
    grossWeight: 0,
    netWeight: 0,
    conai: ''
  },
  packages: [],
  shippingLabel: {
    line1: '',
    line2: '',
    line3: '',
    line4: '',
    tel: '',
    content: '',
    netWeight: '',
    grossWeight: ''
  }
})

// Auto-calcolo IVA e Totale
watch(() => [invoiceData.financial.taxable, invoiceData.financial.hasVat, invoiceData.financial.vatRate], () => {
  if (invoiceData.financial.hasVat) {
    invoiceData.financial.vatAmount = (invoiceData.financial.taxable * invoiceData.financial.vatRate) / 100
  } else {
    invoiceData.financial.vatAmount = 0
  }
  invoiceData.financial.total = invoiceData.financial.taxable + invoiceData.financial.vatAmount
}, { deep: true })

watch(() => invoiceData.items, () => {
  // Calcola la somma di (quantità × prezzo unitario) di tutti gli articoli
  const totalTaxable = invoiceData.items.reduce((sum, item) => {
    return sum + ((item.quantity || 0) * (item.unitPrice || 0))
  }, 0)

  // Arrotonda a 2 decimali
  invoiceData.financial.taxable = Math.round(totalTaxable * 100) / 100
}, { deep: true })

// Il watch esistente per IVA e Totale rimarrà così com'è:
watch(() => [invoiceData.financial.taxable, invoiceData.financial.hasVat, invoiceData.financial.vatRate], () => {
  if (invoiceData.financial.hasVat) {
    invoiceData.financial.vatAmount = Math.round((invoiceData.financial.taxable * invoiceData.financial.vatRate) / 100 * 100) / 100
  } else {
    invoiceData.financial.vatAmount = 0
  }
  invoiceData.financial.total = Math.round((invoiceData.financial.taxable + invoiceData.financial.vatAmount) * 100) / 100
}, { deep: true })

// Dialogs
const dialogs = reactive({
  package: {
    show: false,
    data: null,
    index: null
  },
  invoiceItem: {
    show: false,
    data: null,
    index: null
  }
})

// Colonne tabella articoli
const itemColumns = [
  { name: 'code', label: 'Cod. Art.', align: 'left', field: 'code', style: 'width: 120px' },
  { name: 'description', label: 'Descrizione', align: 'left', field: 'description', style: 'min-width: 250px' },
  { name: 'quantity', label: 'Q.', align: 'center', field: 'quantity', style: 'width: 80px' },
  { name: 'unitPrice', label: 'Prezzo Un.', align: 'right', field: 'unitPrice', style: 'width: 120px' },
  { name: 'total', label: 'Totale', align: 'right', field: row => (row.quantity || 0) * (row.unitPrice || 0), style: 'width: 120px' },
  { name: 'actions', label: 'Azioni', align: 'center', style: 'width: 100px' }
]

const formatCurrency = (value) => {
  if (value === null || value === undefined) return '€ 0,00'
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value)
}

// Load invoice data
const loadInvoice = async () => {
  if (isNew.value && !commNum.value) return

  try {
    if (!isNew.value) {
      const { data, error } = await useFetch(`/api/invoices/${invoiceId.value}`)
      if (error.value) throw new Error(error.value.message)
      populateInvoiceData(data.value.invoice)
    } else if (commNum.value) {
      console.log('🔍 Caricamento ordine per commNum:', commNum.value)
      const { data, error } = await useFetch(`/api/orders/by-commnum/${commNum.value}`)

      if (error.value) {
        console.error('❌ Errore caricamento ordine:', error.value)
        throw new Error(error.value.message)
      }

      console.log('✅ Ordine caricato:', data.value.order)
      const order = data.value.order
      console.log('📦 Items nell\'ordine:', order.items?.length || 0)
      console.log('✔️ Items con invoiced=true:', order.items?.filter(i => i.invoiced)?.length || 0)

      populateFromOrder(order)

      console.log('📋 Items caricati in fattura:', invoiceData.items.length)
    }
  } catch (err) {
    $q.notify({ type: 'negative', message: 'Errore nel caricamento', caption: err.message })
  }
}

const populateInvoiceData = (invoice) => {
  invoiceData.invoiceId = invoice.invoiceId || ''
  invoiceData.invoiceData.invoiceDate = invoice.invoiceDate ? new Date(invoice.invoiceDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
  invoiceData.invoiceData.orderId = invoice.orderId
  invoiceData.invoiceData.commNum = invoice.commNum
  invoiceData.invoiceData.payment = invoice.payment || ''
  invoiceData.invoiceData.shipping = invoice.shipping || ''
  invoiceData.invoiceData.insurance = invoice.insurance || ''
  invoiceData.invoiceData.notes = invoice.notes || ''
  invoiceData.invoiceData.issued = invoice.issued || false
  invoiceData.client = { ...invoice.client }
  invoiceData.receipts = invoice.receipts && invoice.receipts.length > 0 ? invoice.receipts : Array(3).fill(null).map(() => ({ number: '', date: null }))
  invoiceData.items = invoice.items || []
  invoiceData.financial = {
    taxable: invoice.taxable || 0,
    hasVat: invoice.hasVat ?? true,
    vatRate: invoice.vatRate || 22,
    vatAmount: invoice.vatAmount || 0,
    total: invoice.total || 0,
    deposit: invoice.deposit || 0,
    cod: invoice.cod || 0
  }
  invoiceData.packing = invoice.packing || {}
  invoiceData.packages = invoice.packages || []
  invoiceData.shippingLabel = invoice.shippingLabel || {}
}

const populateFromOrder = (order) => {
  console.log('🔄 populateFromOrder chiamata con:', order)

  if (order.clientId) {
    invoiceData.client = {
      clientId: order.clientId._id,
      firstname: order.clientId.firstname || '',
      lastname: order.clientId.lastname || '',
      title: '',
      company: order.clientId.company || '',
      address: order.clientId.address || '',
      cap: order.clientId.cap || '',
      city: order.clientId.city || '',
      region: order.clientId.region || '',
      state: order.clientId.state || '',
      tel: order.clientId.tel || '',
      piva: order.clientId.piva || ''
    }
    console.log('👤 Cliente popolato:', invoiceData.client)
  }

  invoiceData.invoiceData.orderId = order._id
  invoiceData.invoiceData.commNum = order.commNum

  if (order.items && order.items.length > 0) {
    const invoicedItems = order.items.filter(item => item.invoiced)
    console.log('📦 Filtraggio items - Totali:', order.items.length, 'Fatturati:', invoicedItems.length)

    invoiceData.items = invoicedItems.map(item => {
      const mapped = {
        productId: item.productId?._id || item.productId || null,
        orderItemId: item._id,
        code: item.productId?.code || item.code || '',
        description: item.productId?.name || item.description || '',
        quantity: item.quantity || 0,
        unitPrice: 0
      }
      console.log('  → Item mappato:', mapped)
      return mapped
    })

    console.log('✅ Items finali assegnati:', invoiceData.items)
  } else {
    console.log('⚠️ Nessun item nell\'ordine')
  }
}

// ========================================
// FIX DEFINITIVO: handleBack in /app/pages/invoices/edit.vue
// Il problema: orderId può essere un OGGETTO popolato invece di una stringa
// ========================================

const handleBack = async () => {
  // ✅ Estrai l'ID correttamente (può essere stringa O oggetto popolato)
  const orderIdValue = typeof invoiceData.invoiceData.orderId === 'object'
    ? invoiceData.invoiceData.orderId?._id
    : invoiceData.invoiceData.orderId

  // ✅ CASO 1: Fattura ha orderId valido - Vai all'ordine
  if (orderIdValue) {
    router.push(`/orders/${orderIdValue}`)
    return
  }

  // ✅ CASO 2: Fattura legacy senza orderId ma con commNum - Cerca ordine per commNum
  if (invoiceData.invoiceData.commNum) {
    try {
      const response = await $fetch(`/api/orders/by-commnum/${invoiceData.invoiceData.commNum}`)

      if (response?.order?._id) {
        router.push(`/orders/${response.order._id}`)
        return
      }
    } catch (err) {
      console.log('⚠️ Ordine non trovato per commNum:', invoiceData.invoiceData.commNum)
    }
  }

  // ✅ CASO 3: Fallback - Vai alla lista fatture
  router.push('/invoices')
}

const handleCancel = () => {
  $q.dialog({
    title: 'Conferma',
    message: 'Vuoi annullare le modifiche?',
    cancel: true,
    persistent: true
  }).onOk(() => handleBack())
}

const handlePrint = () => {
  if (isNew.value) {
    $q.notify({
      type: 'warning',
      message: 'Salva prima la fattura per poterla stampare'
    })
    return
  }

  // ✅ NAVIGA alla pagina di stampa (stessa finestra)
  router.push(`/invoices/print/${invoiceId.value}`)
}

// ========================================
// MODIFICA: handleSave - RIMANI SULLA PAGINA
// Sostituisci la funzione handleSave in /app/pages/invoices/edit.vue
// ========================================

const handleSave = async () => {
  saving.value = true
  try {
    const payload = {
      invoiceData: invoiceData.invoiceData,
      client: invoiceData.client,
      receipts: invoiceData.receipts.filter(r => r.number),
      items: invoiceData.items,
      financial: invoiceData.financial,
      packing: invoiceData.packing,
      packages: invoiceData.packages,
      shippingLabel: invoiceData.shippingLabel
    }

    if (isNew.value) {
      // ✅ POST - Crea nuova fattura
      const { data, error } = await useFetch('/api/invoices', {
        method: 'POST',
        body: payload
      })

      if (error.value) {
        throw new Error(error.value.message)
      }

      $q.notify({
        type: 'positive',
        message: 'Fattura creata con successo'
      })

      // ✅ MODIFICA: Cambia URL senza ricaricare la pagina
      if (data.value?.invoice?._id) {
        invoiceData.invoiceId = data.value.invoice.invoiceId

        // Cambia URL da /invoices/edit?commNum=X a /invoices/edit?id=Y
        router.replace(`/invoices/edit?id=${data.value.invoice._id}`)
      }

    } else {
      // ✅ PUT - Aggiorna fattura esistente
      const { data, error } = await useFetch(`/api/invoices/${invoiceId.value}`, {
        method: 'PUT',
        body: payload
      })

      if (error.value) {
        throw new Error(error.value.message)
      }

      $q.notify({
        type: 'positive',
        message: 'Fattura salvata con successo'
      })

      // ✅ MODIFICA: NON fare handleBack() - rimani sulla pagina
      // Opzionalmente ricarica i dati per sicurezza
      if (data.value?.invoice) {
        populateInvoiceData(data.value.invoice)
      }
    }

  } catch (err) {
    $q.notify({
      type: 'negative',
      message: 'Errore nel salvataggio',
      caption: err.message
    })
  } finally {
    saving.value = false
  }
}

// Package handlers
const handleAddPackage = () => {
  dialogs.package.data = { size1: 0, size2: 0, size3: 0, grossWeight: 0, netWeight: 0 }
  dialogs.package.index = null
  dialogs.package.show = true
}

const handleEditPackage = (pkg, index) => {
  dialogs.package.data = { ...pkg }
  dialogs.package.index = index
  dialogs.package.show = true
}

const handleRemovePackage = (index) => {
  invoiceData.packages.splice(index, 1)
}

const handlePackageDialogClose = (result) => {
  if (result) {
    if (dialogs.package.index !== null) {
      invoiceData.packages[dialogs.package.index] = result
    } else {
      invoiceData.packages.push(result)
    }
  }
  dialogs.package.show = false
}

// Invoice item handlers
const handleAddInvoiceItem = () => {
  dialogs.invoiceItem.data = { code: '', description: '', quantity: 0, unitPrice: 0 }
  dialogs.invoiceItem.index = null
  dialogs.invoiceItem.show = true
}

const handleEditInvoiceItem = (item, index) => {
  dialogs.invoiceItem.data = { ...item }
  dialogs.invoiceItem.index = index
  dialogs.invoiceItem.show = true
}

const handleRemoveInvoiceItem = (index) => {
  invoiceData.items.splice(index, 1)
}

const handleInvoiceItemDialogClose = (result) => {
  if (result) {
    if (dialogs.invoiceItem.index !== null) {
      invoiceData.items[dialogs.invoiceItem.index] = result
    } else {
      invoiceData.items.push(result)
    }
  }
  dialogs.invoiceItem.show = false
}

onMounted(() => {
  loadInvoice()
})
</script>

<style scoped lang="scss">
@use "sass:color";

.invoice-edit-page {
  background: $bg-light;
  min-height: 100vh;
}

.invoice-edit-container {
  max-width: 1600px;
  margin: 0 auto;
  position:relative
}



// Header sticky
.invoice-header-sticky {
  position: fixed;
  top: 50px;
  left: 0;
  right: 0;
  z-index: 999;
  background: $sticky-menu;
  border-bottom: 1px solid $border;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  .header-content {
    max-width: 1800px;
    margin: 0 auto;
    padding: 8px 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .header-left {
      display: flex;
      align-items: center;
      gap: 12px;

      .invoice-info {
        font-weight: 600;
        font-size: 16px;
        color: $text-primary;

        .separator {
          margin: 0 8px;
          color: $text-secondary;
        }

        .comm-ref {
          color: $primary;
        }
      }
    }

    .header-actions {
      display: flex;
      gap: 8px;

      .action-btn {
        font-size: 13px;
        padding: 6px 16px;
      }

      .save-btn {
        background: $primary;
        color: white;

        &:hover {
          background: color.adjust($primary, $lightness: -10%);
        }
      }

      .print-btn {
        background: transparent;
        color: $primary;
        border: 1px solid $primary;

        &:hover:not(:disabled) {
          background: rgba($primary, 0.1);
        }

        &:disabled {
          opacity: 0.5;
        }
      }
    }
  }
}

.header-spacer {
  height: 60px;
}

// Layout 2 colonne
.top-section {
  display: grid;
  grid-template-columns: 450px 1fr;
  gap: 8px;
  margin-bottom: 8px;
}

.left-column,
.right-column {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

// Sezioni compatte
.section-header {
  padding: 6px 12px !important;
  background: $bg-light;
  border-bottom: 1px solid $border;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 13px;
  color: $text-primary;
  min-height: 32px;

  .header-left-items {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 1;
  }
}

.compact-section {
  padding: 8px !important;
}

.compact-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 6px;

  .span-2 {
    grid-column: span 2;
  }

  :deep(.q-field) {
    margin-bottom: 0;
  }

  :deep(.q-field__control) {
    min-height: 32px;
    height: 32px;
  }

  :deep(.q-field__label) {
    font-size: 12px;
  }

  :deep(input),
  :deep(textarea) {
    font-size: 12px;
  }
}

// Scontrini
.receipt-row {
  display: grid;
  grid-template-columns: 60px 1fr 1fr;
  gap: 6px;
  align-items: center;
  margin-bottom: 6px;

  .receipt-label {
    font-size: 12px;
    font-weight: 500;
  }

  .receipt-input {
    :deep(.q-field__control) {
      min-height: 32px;
      height: 32px;
    }
  }
}

// Pacchi
.packages-list {
  border-top: 1px solid $border;
  padding-top: 8px;

  .packages-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 4px;
  }

  .package-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 4px 8px;
    background: $bg-light;
    border-radius: 4px;
    margin-bottom: 4px;

    &:hover {
      background: color.adjust($bg-light, $lightness: -5%);
    }
  }
}

// Tabella articoli
.items-card {
  background: $contrast;
}

.items-table {
  :deep(th) {
    font-weight: 600;
    font-size: 12px;
    padding: 6px 8px;
    background: $bg-light;
  }

  :deep(td) {
    font-size: 12px;
    padding: 4px 8px;
  }

  :deep(tbody tr:hover) {
    background-color: rgba($primary, 0.05);
  }
}

// Cards
.client-card,
.data-card,
.receipts-card,
.financial-card,
.packing-card,
.shipping-card {
  background: $contrast;
}

// Responsive
@media (max-width: 1200px) {
  .top-section {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .invoice-header-sticky .header-content {
    flex-direction: column;
    gap: 8px;

    .header-left,
    .header-actions {
      width: 100%;
    }

    .header-actions {
      justify-content: flex-end;
    }
  }

  .header-spacer {
    height: 100px;
  }

  .compact-grid {
    grid-template-columns: 1fr;

    .span-2 {
      grid-column: span 1;
    }
  }
}


</style>
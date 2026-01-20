<template>
  <q-page class="invoice-edit-page">
    <div class="invoice-edit-container">
      <!-- ✅ HEADER STICKY come commissioni -->
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
            <q-btn flat dense label="Annulla" @click="handleCancel" class="action-btn cancel-btn" />
            <q-btn flat dense label="Salva" icon="save" @click="handleSave" :loading="saving"
              class="action-btn save-btn" />
          </div>
        </div>
      </div>

      <!-- Spacer -->
      <div class="header-spacer"></div>

      <!-- Griglia principale -->
      <div class="invoice-grid">
        <!-- Dati Cliente -->
        <InvoiceClientSection v-model:client="invoiceData.client" />

        <!-- Dati Fattura -->
        <InvoiceDataSection v-model:data="invoiceData.invoiceData" />

        <!-- Scontrini -->
        <InvoiceReceiptsSection v-model:receipts="invoiceData.receipts" />

        <!-- Articoli/Voci Fattura -->
        <InvoiceItemsSection v-model:items="invoiceData.items" @add-item="handleAddInvoiceItem"
          @edit-item="handleEditInvoiceItem" @remove-item="handleRemoveInvoiceItem" />

        <!-- Dati Finanziari -->
        <InvoiceFinancialSection v-model:financial="invoiceData.financial" />

        <!-- Imballo -->
        <InvoicePackingSection v-model:packing="invoiceData.packing" v-model:packages="invoiceData.packages"
          @add-package="handleAddPackage" @edit-package="handleEditPackage" @remove-package="handleRemovePackage" />

        <!-- Etichetta Spedizione -->
        <InvoiceShippingLabelSection v-model:label="invoiceData.shippingLabel" />
      </div>
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
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import ComponentDialog from '~/components/common/ComponentDialog.vue'
import InvoiceClientSection from '~/components/invoice-edit/InvoiceClientSection.vue'
import InvoiceDataSection from '~/components/invoice-edit/InvoiceDataSection.vue'
import InvoiceReceiptsSection from '~/components/invoice-edit/InvoiceReceiptsSection.vue'
import InvoiceItemsSection from '~/components/invoice-edit/InvoiceItemsSection.vue'
import InvoiceFinancialSection from '~/components/invoice-edit/InvoiceFinancialSection.vue'
import InvoicePackingSection from '~/components/invoice-edit/InvoicePackingSection.vue'
import InvoiceShippingLabelSection from '~/components/invoice-edit/InvoiceShippingLabelSection.vue'
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

// Load invoice data
const loadInvoice = async () => {
  if (isNew.value && !commNum.value) return

  try {
    if (!isNew.value) {
      // Carica fattura esistente
      const { data, error } = await useFetch(`/api/invoices/${invoiceId.value}`)

      if (error.value) {
        throw new Error(error.value.message)
      }

      const invoice = data.value.invoice
      populateInvoiceData(invoice)

    } else if (commNum.value) {
      // Carica dati da commissione
      const { data, error } = await useFetch(`/api/orders/by-commnum/${commNum.value}`)

      if (error.value) {
        throw new Error(error.value.message)
      }

      const order = data.value.order
      populateFromOrder(order)
    }

  } catch (err) {
    $q.notify({
      type: 'negative',
      message: 'Errore nel caricamento',
      caption: err.message
    })
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

  invoiceData.packing = invoice.packing || {
    made: '',
    whoMakes: '',
    numPackages: 0,
    packageSize: '',
    grossWeight: 0,
    netWeight: 0,
    conai: ''
  }

  invoiceData.packages = invoice.packages || []
  invoiceData.shippingLabel = invoice.shippingLabel || {
    line1: '',
    line2: '',
    line3: '',
    line4: '',
    tel: '',
    content: '',
    netWeight: '',
    grossWeight: ''
  }
}

const populateFromOrder = (order) => {
  // Popola dati cliente da ordine
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
  }

  invoiceData.invoiceData.orderId = order._id
  invoiceData.invoiceData.commNum = order.commNum

  // Carica solo articoli fatturati
  if (order.items && order.items.length > 0) {
    invoiceData.items = order.items
      .filter(item => item.invoiced)
      .map(item => ({
        productId: item.productId?._id || item.productId || null,
        orderItemId: item._id,
        code: item.code || '',
        description: item.description || '',
        quantity: item.quantity || 0,
        unitPrice: 0
      }))
  }
}

const handleBack = () => {
  if (commNum.value) {
    router.push(`/orders/${commNum.value}`)
  } else {
    router.push('/invoices')
  }
}

const handleCancel = () => {
  $q.dialog({
    title: 'Conferma',
    message: 'Vuoi annullare le modifiche?',
    cancel: true,
    persistent: true
  }).onOk(() => {
    handleBack()
  })
}

const handleSave = async () => {
  // Validazione
  if (!invoiceData.client.lastname && !invoiceData.client.company) {
    $q.notify({
      type: 'negative',
      message: 'Cliente obbligatorio'
    })
    return
  }

  if (invoiceData.items.length === 0) {
    $q.notify({
      type: 'negative',
      message: 'Inserisci almeno un articolo'
    })
    return
  }

  saving.value = true

  try {
    const endpoint = isNew.value ? '/api/invoices' : `/api/invoices/${invoiceId.value}`
    const method = isNew.value ? 'POST' : 'PUT'

    const { data, error } = await useFetch(endpoint, {
      method,
      body: invoiceData
    })

    if (error.value) {
      throw new Error(error.value.message)
    }

    $q.notify({
      type: 'positive',
      message: 'Fattura salvata con successo'
    })

    handleBack()

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

// Handlers Pacchi
const handleAddPackage = () => {
  dialogs.package.data = {}
  dialogs.package.index = null
  dialogs.package.show = true
}

const handleEditPackage = (pkg, index) => {
  dialogs.package.data = { ...pkg }
  dialogs.package.index = index
  dialogs.package.show = true
}

const handlePackageDialogClose = (savedPackage) => {
  if (!savedPackage) {
    dialogs.package.show = false
    return
  }

  if (dialogs.package.index === null) {
    invoiceData.packages.push(savedPackage)
  } else {
    invoiceData.packages.splice(dialogs.package.index, 1, savedPackage)
  }

  dialogs.package.show = false
}

const handleRemovePackage = (index) => {
  $q.dialog({
    title: 'Conferma',
    message: 'Vuoi rimuovere questo pacco?',
    cancel: true,
    persistent: true
  }).onOk(() => {
    invoiceData.packages.splice(index, 1)
  })
}

// Handlers Voci Fattura
const handleAddInvoiceItem = () => {
  dialogs.invoiceItem.data = {}
  dialogs.invoiceItem.index = null
  dialogs.invoiceItem.show = true
}

const handleEditInvoiceItem = (item, index) => {
  dialogs.invoiceItem.data = { ...item }
  dialogs.invoiceItem.index = index
  dialogs.invoiceItem.show = true
}

const handleInvoiceItemDialogClose = (savedItem) => {
  if (!savedItem) {
    dialogs.invoiceItem.show = false
    return
  }

  if (dialogs.invoiceItem.index === null) {
    invoiceData.items.push(savedItem)
  } else {
    invoiceData.items.splice(dialogs.invoiceItem.index, 1, savedItem)
  }

  dialogs.invoiceItem.show = false
}

const handleRemoveInvoiceItem = (index) => {
  $q.dialog({
    title: 'Conferma',
    message: 'Vuoi rimuovere questa voce?',
    cancel: true,
    persistent: true
  }).onOk(() => {
    invoiceData.items.splice(index, 1)
  })
}

onMounted(() => {
  loadInvoice()
})
</script>

<style scoped lang="scss">
.invoice-edit-page {
  background: $bg-light;
  min-height: 100vh;
}

.invoice-edit-container {
  max-width: 1600px;
  margin: 0 auto;
  position: relative;
}

.invoice-header-sticky {
  position: fixed;
  top: 50px;
  left: 0;
  right: 0;
  z-index: 999;
  background: $sticky-menu;
  border-bottom: 1px solid $border;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);

  .header-content {
    max-width: 1600px;
    margin: 0 auto;
    padding: 8px 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    min-height: 40px;
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 12px;
    flex: 1;
    min-width: 0;

    .back-btn {
      color: $text-primary;
      flex-shrink: 0;
    }

    .invoice-info {
      font-size: 15px;
      font-weight: 600;
      color: $text-primary;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      display: flex;
      align-items: center;
      gap: 8px;

      .separator {
        color: $text-secondary;
        font-weight: 400;
      }

      .comm-ref {
        font-weight: 400;
        color: $text-secondary;
      }
    }
  }

  .header-actions {
    display: flex;
    gap: 4px;
    flex-shrink: 0;

    .action-btn {
      font-size: 13px;
      font-weight: 500;
      padding: 6px 16px;
      text-transform: none;
      min-height: 32px;
    }

    .cancel-btn {
      color: $negative;
    }

    .save-btn {
      color: $primary;
    }
  }
}

.header-spacer {
  height: 90px;
}

.invoice-grid {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

@media (max-width: 768px) {
  .invoice-header-sticky {
    .header-content {
      padding: 6px 12px;
      gap: 8px;
    }

    .header-left {
      gap: 8px;

      .invoice-info {
        font-size: 14px;
        flex-direction: column;
        align-items: flex-start;
        gap: 2px;

        .separator {
          display: none;
        }
      }
    }

    .header-actions {
      gap: 3px;

      .action-btn {
        font-size: 12px;
        padding: 5px 12px;
        min-height: 28px;
      }
    }
  }

  .header-spacer {
    height: 100px;
  }
}
</style>
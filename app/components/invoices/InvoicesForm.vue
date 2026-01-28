<template>
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
            <span v-if="displayCommNum" class="separator">•</span>
            <span v-if="displayCommNum" class="comm-ref">Comm. {{ displayCommNum }}</span>
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

    <!-- 
    ========================================
    🎯 LAYOUT: 3 COLONNE 
    ========================================
    Colonna 1 (sinistra):  Cliente + Imballo/Pacchi
    Colonna 2 (centro):    Dati Fattura + Scontrini + Importi
    Colonna 3 (destra):    Articoli
    
    Per modificare il layout, cerca "LAYOUT COLUMNS" nel CSS
    e cambia grid-template-columns
    ======================================== 
    -->
    <div class="top-section">

      <!-- 
      ========================================
      COLONNA 1: CLIENTE + IMBALLO 
      Per spostare questa colonna, taglia tutto 
      il blocco <div class="left-column"> e incollalo 
      dove vuoi nel layout
      ======================================== 
      -->
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
              <q-input v-model.number="invoiceData.packing.numPackages" label="N.Pacchi" type="number" outlined dense />
              <q-input v-model="invoiceData.packing.packageSize" label="Mis" outlined dense />
              <q-input v-model.number="invoiceData.packing.grossWeight" label="P.Lordo" type="number" outlined dense
                step="0.01" />
              <q-input v-model.number="invoiceData.packing.netWeight" label="P.Netto" type="number" outlined dense
                step="0.01" />
              <q-input v-model="invoiceData.packing.conai" label="Conai" outlined dense class="span-2" />
            </div>

            <!-- Lista Pacchi -->
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

      <!-- 
      ========================================
      COLONNA 2: DATI FATTURA + SCONTRINI + IMPORTI
      Per spostare questa colonna, taglia tutto 
      il blocco <div class="middle-column"> e incollalo 
      dove vuoi nel layout
      ======================================== 
      -->
      <div class="middle-column">
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

              <q-select v-model="invoiceData.invoiceData.payment" label="Pagamento" :options="paymentOptions"
                option-label="label" option-value="value" emit-value map-options outlined dense use-input
                @filter="filterPayments" />

              <q-select v-model="invoiceData.invoiceData.shipping" label="Spedizione" :options="shipmentOptions"
                option-label="label" option-value="value" emit-value map-options outlined dense use-input
                @filter="filterShipments" />

              <q-select v-model="invoiceData.invoiceData.insurance" label="Assicura" :options="insuranceOptions"
                option-label="label" option-value="value" emit-value map-options outlined dense use-input
                @filter="filterInsurances" />

              <q-input v-model="invoiceData.invoiceData.notes" label="Note" outlined dense type="textarea" :rows="6"
                class="span-2" />

              <q-checkbox v-model="invoiceData.invoiceData.issued" label="Fattura Emessa" dense class="span-2" />
            </div>
          </q-card-section>
        </q-card>

        <!-- ✅ FIX: Scontrini con Aggiungi e Rimuovi -->
        <q-card flat bordered class="receipts-card">
          <q-card-section class="section-header">
            <div class="header-left-items">
              <q-icon name="receipt" size="18px" />
              <span>Scontrini</span>
              <q-chip v-if="invoiceData.receipts.length > 0" dense color="primary" text-color="white" size="sm">
                {{ invoiceData.receipts.length }}
              </q-chip>
            </div>
            <q-btn flat dense size="sm" icon="add" color="primary" @click="handleAddReceipt">
              <q-tooltip>Aggiungi scontrino</q-tooltip>
            </q-btn>
          </q-card-section>
          <q-card-section class="compact-section">
            <div v-if="invoiceData.receipts.length === 0" class="text-center text-grey-7 q-pa-sm">
              <q-icon name="receipt" size="24px" />
              <div class="text-caption q-mt-xs">Nessuno scontrino</div>
            </div>
            <div v-else class="receipts-list">
              <div class="receipt-row" v-for="(receipt, index) in invoiceData.receipts" :key="index">
                <span class="receipt-label">N.{{ index + 1 }}</span>
                <q-input v-model="receipt.number" placeholder="Numero" outlined dense class="receipt-input" />
                <q-input v-model="receipt.date" type="date" placeholder="Data" outlined dense class="receipt-input" />
                <q-btn flat dense round icon="delete" size="xs" color="negative" @click="handleRemoveReceipt(index)">
                  <q-tooltip>Rimuovi</q-tooltip>
                </q-btn>
              </div>
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
                step="0.01" />
              <q-checkbox v-model="invoiceData.financial.hasVat" label="IVA SI/NO" dense />
              <q-input v-model.number="invoiceData.financial.vatRate" label="% IVA" type="number" outlined dense
                :disable="!invoiceData.financial.hasVat" />
              <q-input :model-value="invoiceData.financial.vatAmount" label="Importo IVA" outlined dense readonly />
              <q-input :model-value="invoiceData.financial.total" label="Totale" outlined dense readonly
                class="text-weight-bold" />
              <q-input v-model.number="invoiceData.financial.deposit" label="Acconto" type="number" outlined dense
                step="0.01" />
              <q-input v-model.number="invoiceData.financial.cod" label="Cod" type="number" outlined dense
                step="0.01" />
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- 
      ========================================
      COLONNA 3: ETICHETTA SPEDIZIONE
      Per spostare questa colonna, taglia tutto 
      il blocco <div class="right-column"> e incollalo 
      dove vuoi nel layout
      ======================================== 
      -->
      <div class="right-column">
        <q-card flat bordered class="shipping-card">
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
    </div>

    <!-- 
    ========================================
    ARTICOLI - FULL WIDTH SOTTO TUTTO
    Per spostare questa sezione, taglia tutto 
    il blocco <q-card class="items-card"> e 
    incollalo dove vuoi (es: dentro right-column 
    per metterlo in colonna a destra)
    ======================================== 
    -->
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
        <q-table flat :rows="invoiceData.items" :columns="itemColumns" row-key="_id" dense :rows-per-page-options="[0]"
          hide-pagination class="items-table">

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
              <span>Nessuna voce</span>
            </div>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

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
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import ComponentDialog from '~/components/common/ComponentDialog.vue'
import PackageDialog from '~/components/invoice-edit/PackageDialog.vue'
import InvoiceItemDialog from '~/components/invoice-edit/InvoiceItemDialog.vue'

const props = defineProps({
  mode: { type: String, required: true, validator: (v) => ['new', 'edit'].includes(v) },
  invoiceId: { type: String, default: null },
  commNum: { type: String, default: null }
})

const router = useRouter()
const $q = useQuasar()
const saving = ref(false)

const isNew = computed(() => props.mode === 'new')
const displayCommNum = computed(() => props.commNum || invoiceData.invoiceData.commNum)

// ✅ FIX: Caricamento dati select
const { payments: allPayments, loadPayments } = usePayments()
const { shipments: allShipments, loadShipments } = useShipments()
const { insurances: allInsurances, loadInsurances } = useInsurances()

const paymentOptions = ref([])
const shipmentOptions = ref([])
const insuranceOptions = ref([])

const invoiceData = reactive({
  invoiceId: '',
  invoiceData: {
    invoiceDate: new Date().toISOString().split('T')[0],
    orderId: null,
    commNum: props.commNum || null,
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
  receipts: [], // ✅ FIX: Parte vuoto, si aggiungono con pulsante
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

watch(() => [invoiceData.financial.taxable, invoiceData.financial.hasVat, invoiceData.financial.vatRate], () => {
  if (invoiceData.financial.hasVat) {
    invoiceData.financial.vatAmount = Math.round((invoiceData.financial.taxable * invoiceData.financial.vatRate) / 100 * 100) / 100
  } else {
    invoiceData.financial.vatAmount = 0
  }
  invoiceData.financial.total = Math.round((invoiceData.financial.taxable + invoiceData.financial.vatAmount) * 100) / 100
}, { deep: true })

watch(() => invoiceData.items, () => {
  const totalTaxable = invoiceData.items.reduce((sum, item) => {
    return sum + ((item.quantity || 0) * (item.unitPrice || 0))
  }, 0)
  invoiceData.financial.taxable = Math.round(totalTaxable * 100) / 100
}, { deep: true })

const dialogs = reactive({
  package: { show: false, data: null, index: null },
  invoiceItem: { show: false, data: null, index: null }
})

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

// ✅ FIX: Filtri select
const filterPayments = (val, update) => {
  if (val === '') {
    update(() => { paymentOptions.value = allPayments.value })
    return
  }
  update(() => {
    const needle = val.toLowerCase()
    paymentOptions.value = allPayments.value.filter(p => p.label.toLowerCase().indexOf(needle) > -1)
  })
}

const filterShipments = (val, update) => {
  if (val === '') {
    update(() => { shipmentOptions.value = allShipments.value })
    return
  }
  update(() => {
    const needle = val.toLowerCase()
    shipmentOptions.value = allShipments.value.filter(s => s.label.toLowerCase().indexOf(needle) > -1)
  })
}

const filterInsurances = (val, update) => {
  if (val === '') {
    update(() => { insuranceOptions.value = allInsurances.value })
    return
  }
  update(() => {
    const needle = val.toLowerCase()
    insuranceOptions.value = allInsurances.value.filter(i => i.label.toLowerCase().indexOf(needle) > -1)
  })
}

// ✅ FIX: Handlers Scontrini
const handleAddReceipt = () => {
  invoiceData.receipts.push({ number: '', date: null })
}

const handleRemoveReceipt = (index) => {
  invoiceData.receipts.splice(index, 1)
}

const loadInvoice = async () => {
  if (isNew.value && !props.commNum) return

  try {
    if (!isNew.value && props.invoiceId) {
      const { data, error } = await useFetch(`/api/invoices/${props.invoiceId}`)
      if (error.value) throw new Error(error.value.message)
      populateInvoiceData(data.value.invoice)
    } else if (props.commNum) {
      const { data, error } = await useFetch(`/api/orders/by-commnum/${props.commNum}`)
      if (error.value) throw new Error(error.value.message)
      populateFromOrder(data.value.order)
    }
  } catch (err) {
    $q.notify({ type: 'negative', message: 'Errore caricamento', caption: err.message })
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
  invoiceData.receipts = invoice.receipts && invoice.receipts.length > 0 ? invoice.receipts : []
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

  if (order.items && order.items.length > 0) {
    invoiceData.items = order.items
      .filter(item => item.invoiced)
      .map(item => ({
        productId: item.productId?._id || item.productId || null,
        orderItemId: item._id,
        code: item.productId?.code || item.code || '',
        description: item.productId?.name || item.description || '',
        quantity: item.quantity || 0,
        unitPrice: 0
      }))
  }
}

const handleBack = () => {
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
  if (!isNew.value && props.invoiceId) {
    router.push(`/invoices/print/${props.invoiceId}`)
  }
}

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
      const { data, error } = await useFetch('/api/invoices', {
        method: 'POST',
        body: payload
      })

      if (error.value) throw new Error(error.value.message)

      $q.notify({ type: 'positive', message: 'Fattura creata' })

      if (data.value?.invoice?._id) {
        invoiceData.invoiceId = data.value.invoice.invoiceId
        router.replace(`/invoices/edit?id=${data.value.invoice._id}`)
      }
    } else {
      const { data, error } = await useFetch(`/api/invoices/${props.invoiceId}`, {
        method: 'PUT',
        body: payload
      })

      if (error.value) throw new Error(error.value.message)

      $q.notify({ type: 'positive', message: 'Fattura salvata' })

      if (data.value?.invoice) {
        populateInvoiceData(data.value.invoice)
      }
    }
  } catch (err) {
    $q.notify({ type: 'negative', message: 'Errore salvataggio', caption: err.message })
  } finally {
    saving.value = false
  }
}

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

onMounted(async () => {
  // ✅ FIX: Carica dati select
  console.log('🔵 Caricamento dati select...')

  try {
    await loadPayments()
    paymentOptions.value = allPayments.value
    console.log('✅ Payments caricati:', paymentOptions.value.length, paymentOptions.value)
  } catch (err) {
    console.error('❌ Errore loadPayments:', err)
  }

  try {
    await loadShipments()
    shipmentOptions.value = allShipments.value
    console.log('✅ Shipments caricati:', shipmentOptions.value.length, shipmentOptions.value)
  } catch (err) {
    console.error('❌ Errore loadShipments:', err)
  }

  try {
    await loadInsurances()
    insuranceOptions.value = allInsurances.value
    console.log('✅ Insurances caricati:', insuranceOptions.value.length, insuranceOptions.value)
  } catch (err) {
    console.error('❌ Errore loadInsurances:', err)
  }

  await loadInvoice()
})
</script>

<style scoped lang="scss">
@use "sass:color";

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

/* 
========================================
🎯 LAYOUT COLUMNS - MODIFICA QUI
========================================
Per cambiare il layout delle 3 colonne,
modifica grid-template-columns:

Attuale: 450px (cliente) | 1fr (dati) | 1fr (articoli)

Altri esempi:
- 2 colonne: 450px 1fr
- Uguale larghezza: 1fr 1fr 1fr
- Proporzioni: 1fr 2fr 1fr
======================================== 
*/
.top-section {
  display: grid;
  grid-template-columns: 450px 1fr 1fr; // Cliente | Dati | Articoli
  gap: 8px;
  margin-bottom: 8px;
}

.left-column,
.middle-column,
.right-column {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.section-header {
  padding: 6px 12px !important;
  background: $bg-light;
  border-bottom: 1px solid $border;
  display: flex;
  justify-content: space-between;
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
    min-height: 40px; // ✅ Aumentato da 32px e RIMOSSO height fisso
    // height: 32px; ❌ RIMOSSO - lascia che si espanda
  }

  :deep(.q-field__label) {
    font-size: 12px;
  }

  :deep(input),
  :deep(textarea) {
    font-size: 12px;
  }

  // ✅ Select devono avere più spazio verticale
  :deep(.q-select .q-field__native) {
    min-height: 40px;
    padding-top: 8px;
    padding-bottom: 8px;
  }
}

// ✅ FIX: Receipts list
.receipts-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.receipt-row {
  display: grid;
  grid-template-columns: 40px 1fr 1fr 32px;
  gap: 6px;
  align-items: center;

  .receipt-label {
    font-size: 11px;
    font-weight: 600;
    color: $text-secondary;
  }

  .receipt-input {
    :deep(.q-field__control) {
      min-height: 32px;
      height: 32px;
    }
  }
}

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

.items-card {
  background: $contrast;
  // Full-width sotto tutto, non più in colonna
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

.client-card,
.data-card,
.receipts-card,
.financial-card,
.packing-card,
.shipping-card {
  background: $contrast;
}

/* 
========================================
🎯 RESPONSIVE - MODIFICA QUI
========================================
Per cambiare quando il layout diventa 
mobile, modifica @media (max-width: XXXpx)
======================================== 
*/
@media (max-width: 1400px) {
  .top-section {
    grid-template-columns: 1fr 1fr; // 2 colonne su tablet
  }

  .right-column {
    grid-column: span 2; // Articoli full-width
  }
}

@media (max-width: 768px) {
  .top-section {
    grid-template-columns: 1fr; // 1 colonna su mobile
  }

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
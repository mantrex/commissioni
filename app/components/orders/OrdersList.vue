<template>
  <q-page class="orders-page">
    <!-- Sidebar con menu principale -->
    <div class="sidebar">
      <q-btn class="menu-btn" color="primary" icon="add" label="Nuova" unelevated @click="handleNewOrder" />

      <q-btn class="menu-btn" color="secondary" icon="search" label="Ricerca" unelevated
        @click="toggleAdvancedFilters" />

      <q-btn class="menu-btn" color="accent" icon="receipt" label="Fattura" unelevated @click="handleInvoice" />

      <q-btn class="menu-btn" color="secondary" icon="list_alt" label="Liste" unelevated @click="router.push('/lists')" />

      <q-btn class="menu-btn" color="info" icon="logout" label="Esci" unelevated @click="handleExit" />
    </div>

    <!-- Contenuto principale -->
    <div class="main-content">
      <!-- Filtri -->
      <OrdersFilters v-model:filters="filters" v-model:show-advanced="showAdvancedFilters" :total-orders="totalOrders"
        @search="handleSearch" @reset="handleReset" />

      <!-- Tabella ordini -->
      <OrdersTable v-model:pagination="pagination" :orders="orders" :loading="loading" @request="onRequest"
        @row-click="handleRowClick" />
    </div>

    <!-- =============================================
         Dialog: inserimento numero commissione
    ============================================== -->
    <q-dialog v-model="newOrderDialog.show" persistent @show="focusCommNumInput">
      <q-card style="min-width: 400px">
        <q-bar class="dialog-header">
          <q-icon name="add_circle" />
          <div class="dialog-title q-ml-sm">Nuova Commissione</div>
          <q-space />
          <q-btn dense flat icon="close" @click="closeNewOrderDialog" />
        </q-bar>

        <q-card-section class="q-pa-md" style="min-height: 160px;">
          <div class="text-body2 text-grey-7 q-mb-md">
            Inserisci il numero della nuova commissione. Verrà formattato a 8 cifre automaticamente.
          </div>

          <q-input
            ref="commNumInputRef"
            v-model="newOrderDialog.commNum"
            label="Numero Commissione *"
            outlined
            dense
            mask="########"
            fill-mask="0"
            reverse-fill-mask
            input-style="font-family: monospace; font-size: 16px; letter-spacing: 2px;"
            :error="!!newOrderDialog.error"
            :error-message="newOrderDialog.error"
            :loading="newOrderDialog.checking"
            @keyup.enter="confirmNewOrder"
            @update:model-value="onCommNumInput"
          >
            <template v-slot:append>
              <q-icon v-if="newOrderDialog.valid === true" name="check_circle" color="positive" />
              <q-icon v-else-if="newOrderDialog.valid === false" name="cancel" color="negative" />
            </template>
          </q-input>

          <!-- Spazio fisso per il messaggio di stato: non allargarsi mai -->
          <div style="height: 24px; margin-top: 4px;">
            <span v-if="newOrderDialog.valid === true" class="text-positive text-caption">
              <q-icon name="check" size="xs" /> Numero disponibile
            </span>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Annulla" color="negative" @click="closeNewOrderDialog" />
          <q-btn
            label="Crea Commissione"
            color="primary"
            unelevated
            icon="add"
            :disable="!newOrderDialog.commNum || newOrderDialog.valid !== true || newOrderDialog.checking"
            @click="confirmNewOrder"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import OrdersFilters from './OrdersFilters.vue'
import OrdersTable from './OrdersTable.vue'
const authStore = useAuthStore()
const router = useRouter()
const $q = useQuasar()

const loading = ref(false)
const orders = ref([])
const totalOrders = ref(0)
const showAdvancedFilters = ref(false)

const config = useRuntimeConfig()
const defaultExpiredDays = config.public.expiredDays || 30

const filters = reactive({
  commNum: '',
  expiredFilter: 'expired',
  customDays: defaultExpiredDays,
  clientLastname: '',
  clientFirstname: '',
  clientCity: '',
  clientCountry: '',
  clientVip: null,
  agentId: null,
  productCode: '',
  status: null,
  dateFrom: null,
  dateTo: null,
  dueDateFrom: null,
  dueDateTo: null
})

const pagination = ref({
  sortBy: 'dueDate',
  descending: false,
  page: 1,
  rowsPerPage: 25,
  rowsNumber: 0
})

const loadOrders = async () => {
  loading.value = true

  try {
    const params = new URLSearchParams({
      page: pagination.value.page,
      limit: pagination.value.rowsPerPage,
      sortBy: pagination.value.sortBy,
      sortDesc: pagination.value.descending ? 'true' : 'false'
    })

    if (filters.commNum) params.append('commNum', filters.commNum)
    if (filters.expiredFilter === 'expired') {
      params.append('expiredDays', defaultExpiredDays)
    } else if (filters.expiredFilter === 'custom') {
      params.append('expiredDays', filters.customDays)
    } else if (filters.expiredFilter === 'notExpired') {
      params.append('notExpired', 'true')
    }

    if (filters.clientLastname) params.append('clientLastname', filters.clientLastname)
    if (filters.clientFirstname) params.append('clientFirstname', filters.clientFirstname)
    if (filters.clientCity) params.append('clientCity', filters.clientCity)
    if (filters.clientCountry) params.append('clientCountry', filters.clientCountry)
    if (filters.clientVip !== null) params.append('clientVip', filters.clientVip)
    if (filters.agentId) params.append('agentId', filters.agentId)
    if (filters.productCode) params.append('productCode', filters.productCode)
    if (filters.status) params.append('status', filters.status)
    if (filters.dateFrom) params.append('dateFrom', filters.dateFrom)
    if (filters.dateTo) params.append('dateTo', filters.dateTo)
    if (filters.dueDateFrom) params.append('dueDateFrom', filters.dueDateFrom)
    if (filters.dueDateTo) params.append('dueDateTo', filters.dueDateTo)

    const { data, error } = await useFetch(`/api/orders?${params.toString()}`)

    if (error.value) {
      throw new Error(error.value.message || 'Errore nel caricamento')
    }

    if (!data.value) return

    orders.value = data.value.orders || []
    totalOrders.value = data.value.total || 0
    pagination.value.rowsNumber = totalOrders.value

  } catch (err) {
    $q.notify({
      type: 'negative',
      message: 'Errore nel caricamento degli ordini',
      caption: err.message
    })
  } finally {
    loading.value = false
  }
}

const onRequest = (props) => {
  const { page, rowsPerPage, sortBy, descending } = props.pagination
  pagination.value.page = page
  pagination.value.rowsPerPage = rowsPerPage
  pagination.value.sortBy = sortBy
  pagination.value.descending = descending
  loadOrders()
}

const handleSearch = () => {
  pagination.value.page = 1
  loadOrders()
}

const handleReset = () => {
  filters.commNum = ''
  filters.expiredFilter = 'expired'
  filters.customDays = defaultExpiredDays
  filters.clientLastname = ''
  filters.clientFirstname = ''
  filters.clientCity = ''
  filters.clientCountry = ''
  filters.clientVip = null
  filters.agentId = null
  filters.productCode = ''
  filters.status = null
  filters.dateFrom = null
  filters.dateTo = null
  filters.dueDateFrom = null
  filters.dueDateTo = null
  pagination.value.page = 1
  loadOrders()
}

const toggleAdvancedFilters = () => {
  showAdvancedFilters.value = !showAdvancedFilters.value
}

const handleRowClick = (row) => {
  router.push(`/orders/${row._id}`)
}

const handleInvoice = () => {
  router.push('/invoices')
}

const handleExit = () => {
  authStore.logout()
}

// =============================================
// Dialog: nuova commissione con verifica numero
// =============================================
const commNumInputRef = ref(null)
const checkTimeout = ref(null)

const COMM_NUM_LENGTH = 8

// Normalizza qualsiasi numero a 8 cifre con zero-padding
const padCommNum = (val) => {
  const n = parseInt(val)
  if (isNaN(n) || n <= 0) return ''
  return String(n).padStart(COMM_NUM_LENGTH, '0')
}

const newOrderDialog = reactive({
  show: false,
  commNum: '',
  checking: false,
  valid: null,  // null = non verificato, true = disponibile, false = già esiste
  error: ''
})

const handleNewOrder = () => {
  newOrderDialog.show = true
  newOrderDialog.commNum = ''
  newOrderDialog.checking = false
  newOrderDialog.valid = null
  newOrderDialog.error = ''
}

const closeNewOrderDialog = () => {
  newOrderDialog.show = false
  clearTimeout(checkTimeout.value)
}

const focusCommNumInput = () => {
  nextTick(() => commNumInputRef.value?.focus())
}

const onCommNumInput = (val) => {
  newOrderDialog.valid = null
  newOrderDialog.error = ''

  // Con la mask il valore è sempre 8 char, ma potrebbe essere "00000000" (vuoto)
  if (!val || val === '00000000') return

  const n = parseInt(val)
  if (isNaN(n) || n <= 0) {
    newOrderDialog.error = 'Inserisci un numero valido (maggiore di zero)'
    return
  }

  // Il valore dalla mask è già formattato con zeri es. "00000010"
  clearTimeout(checkTimeout.value)
  checkTimeout.value = setTimeout(() => checkCommNum(val), 400)
}

const checkCommNum = async (commNumPadded) => {
  newOrderDialog.checking = true
  newOrderDialog.valid = null
  newOrderDialog.error = ''

  try {
    // Usa l'endpoint dedicato che confronta per valore numerico
    // così "781", "00781", "00000781" sono tutti equivalenti
    const result = await $fetch(`/api/orders/check-commnum?commNum=${encodeURIComponent(commNumPadded)}`)
    if (result.exists) {
      newOrderDialog.valid = false
      newOrderDialog.error = `La commissione "${result.commNum}" esiste già`
    } else {
      newOrderDialog.valid = true
    }
  } catch (err) {
    newOrderDialog.valid = null
    newOrderDialog.error = 'Errore durante la verifica, riprova'
  } finally {
    newOrderDialog.checking = false
  }
}

const confirmNewOrder = () => {
  const commNum = newOrderDialog.commNum
  if (!commNum || commNum === '00000000' || newOrderDialog.valid !== true || newOrderDialog.checking) return
  closeNewOrderDialog()
  router.push(`/orders/new?commNum=${encodeURIComponent(commNum)}`)
}

onMounted(() => {
  loadOrders()
})
</script>

<style scoped lang="scss">
.orders-page {
  display: flex;
  height: calc(100vh - 50px);
  background: $bg-light;
}

.sidebar {
  width: 160px;
  background: $contrast;
  border-right: 1px solid $border;
  padding: 16px 8px;
  display: flex;
  flex-direction: column;
  gap: 12px;

  .menu-btn {
    width: 100%;
    justify-content: flex-start;
    font-size: 13px;
    padding: 12px 16px;
  }
}

.main-content {
  flex: 1;
  padding: 16px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.dialog-header {
  background-color: $modal-header;
  color: $contrast;

  .dialog-title {
    font-weight: 500;
    font-size: 16px;
  }
}

@media (max-width: 960px) {
  .orders-page {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    flex-direction: row;
    overflow-x: auto;
    padding: 8px;

    .menu-btn {
      white-space: nowrap;
    }
  }
}
</style>
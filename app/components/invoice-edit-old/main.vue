<template>
  <q-page class="orders-page">

    <div class="sidebar">
      <q-btn class="menu-btn" color="primary" icon="add" label="Nuova commissione" unelevated @click="handleNewOrder" />

      <q-btn class="menu-btn" color="secondary" icon="search" label="Ricerca Comm" unelevated @click="focusSearch" />

      <q-btn class="menu-btn" color="accent" icon="receipt" label="Fattura" unelevated @click="handleInvoice" />

      <q-btn class="menu-btn" color="info" icon="logout" label="Esci" unelevated @click="handleExit" />
    </div>

    <!-- Contenuto principale -->
    <div class="main-content">
      <!-- Header con filtri -->
      <div class="filters-section">
        <q-card flat bordered class="filters-card">
          <q-card-section class="q-pa-md">
            <div class="row q-col-gutter-md items-center">
              <!-- Ricerca per numero commissione -->
              <div class="col-12 col-md-4">
                <q-input ref="searchInput" v-model="filters.commNum" outlined dense label="Num Commissione"
                  placeholder="Cerca per numero..." clearable @keyup.enter="loadOrders">
                  <template v-slot:prepend>
                    <q-icon name="search" />
                  </template>
                  <template v-slot:append>
                    <q-btn flat dense round icon="search" color="primary" @click="loadOrders" />
                  </template>
                </q-input>
              </div>

              <!-- Filtro scadenza -->
              <div class="col-12 col-md-4">
                <q-select v-model="filters.expiredFilter" outlined dense :options="expiredOptions"
                  label="Filtra per scadenza" emit-value map-options @update:model-value="loadOrders">
                  <template v-slot:prepend>
                    <q-icon name="event" />
                  </template>
                </q-select>
              </div>

              <!-- Giorni scadenza custom (se "custom" selezionato) -->
              <div class="col-12 col-md-2" v-if="filters.expiredFilter === 'custom'">
                <q-input v-model.number="filters.customDays" outlined dense type="number" label="Giorni" min="0"
                  @update:model-value="loadOrders">
                  <template v-slot:append>
                    gg
                  </template>
                </q-input>
              </div>

              <!-- Pulsante reset filtri -->
              <div class="col-12 col-md-2">
                <q-btn flat color="negative" icon="clear" label="Reset" @click="resetFilters" />
              </div>
            </div>

            <!-- Info risultati -->
            <div class="row q-mt-sm">
              <div class="col-12">
                <q-chip v-if="totalOrders > 0" color="primary" text-color="white" icon="info">
                  {{ totalOrders }} ordini trovati
                </q-chip>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Tabella ordini -->
      <div class="table-section q-mt-md">
        <q-table flat bordered :rows="orders" :columns="columns" row-key="_id" :loading="loading"
          v-model:pagination="pagination" @request="onRequest" @row-click="handleRowClick" class="orders-table"
          :rows-per-page-options="[10, 25, 50, 100]">
          <!-- Loading -->
          <template v-slot:loading>
            <q-inner-loading showing color="primary" />
          </template>

          <!-- Colonna numero commissione -->
          <template v-slot:body-cell-commNum="props">
            <q-td :props="props" class="text-bold">
              {{ props.row.commNum }}
            </q-td>
          </template>

          <!-- Colonna data -->
          <template v-slot:body-cell-date="props">
            <q-td :props="props">
              {{ formatDate(props.row.date) }}
            </q-td>
          </template>

          <!-- Colonna scadenza con colore -->
          <template v-slot:body-cell-dueDate="props">
            <q-td :props="props">
              <q-chip :color="getDueDateColor(props.row.dueDate)" text-color="white" dense size="sm">
                {{ formatDate(props.row.dueDate) }}
              </q-chip>
            </q-td>
          </template>

          <!-- Colonna cliente -->
          <template v-slot:body-cell-client="props">
            <q-td :props="props">
              {{ getClientName(props.row.clientId) }}
            </q-td>
          </template>

          <!-- Colonna agente -->
          <template v-slot:body-cell-agent="props">
            <q-td :props="props">
              {{ getAgentName(props.row.agentId) }}
            </q-td>
          </template>

          <!-- Colonna stato con badge colorato -->
          <template v-slot:body-cell-status="props">
            <q-td :props="props">
              <q-badge :color="getStatusColor(props.row.status)"
                :label="props.row.statusInfo?.label || props.row.status || 'N/A'" />
            </q-td>
          </template>

          <!-- Colonna saldo -->
          <template v-slot:body-cell-balance="props">
            <q-td :props="props" class="text-right">
              <span :class="props.row.balance < 0 ? 'text-negative' : ''">
                {{ formatCurrency(props.row.balance) }}
              </span>
            </q-td>
          </template>

          <!-- Nessun risultato -->
          <template v-slot:no-data>
            <div class="full-width row flex-center q-gutter-sm q-pa-lg">
              <q-icon size="2em" name="info" color="grey-5" />
              <span class="text-grey-7">
                Nessun ordine trovato con i filtri selezionati
              </span>
            </div>
          </template>
        </q-table>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
const authStore = useAuthStore()

const router = useRouter()
const $q = useQuasar()

// Refs
const searchInput = ref(null)
const loading = ref(false)
const orders = ref([])
const totalOrders = ref(0)

// Ottieni il valore EXPIRED da runtimeConfig (default 30)
const config = useRuntimeConfig()
const defaultExpiredDays = config.public.expiredDays || 30

// Filtri
const filters = reactive({
  commNum: '',
  expiredFilter: 'expired', // 'expired', 'all', 'notExpired', 'custom'
  customDays: defaultExpiredDays
})

// Opzioni filtro scadenza
const expiredOptions = [
  { label: `Scaduti (${defaultExpiredDays} giorni)`, value: 'expired' },
  { label: 'Tutti', value: 'all' },
  { label: 'Non scaduti', value: 'notExpired' },
  { label: 'Scaduti personalizzati', value: 'custom' }
]

// ✅ Paginazione - IMPORTANTE: deve essere reactive
const pagination = ref({
  sortBy: 'dueDate',
  descending: false,
  page: 1,
  rowsPerPage: 25,
  rowsNumber: 0  // ← questo viene aggiornato dall'API
})

// Colonne tabella
const columns = [
  {
    name: 'commNum',
    required: true,
    label: 'Num Commissione',
    align: 'left',
    field: 'commNum',
    sortable: true
  },
  {
    name: 'date',
    label: 'Data',
    align: 'left',
    field: 'date',
    sortable: true
  },
  {
    name: 'dueDate',
    label: 'Scadenza',
    align: 'left',
    field: 'dueDate',
    sortable: true
  },
  {
    name: 'client',
    label: 'Cliente',
    align: 'left',
    field: row => row.clientId,
    sortable: false
  },
  {
    name: 'agent',
    label: 'Agente',
    align: 'left',
    field: row => row.agentId,
    sortable: false
  },
  {
    name: 'status',
    label: 'Stato',
    align: 'center',
    field: 'status',
    sortable: true
  },
  {
    name: 'balance',
    label: 'Saldo',
    align: 'right',
    field: 'balance',
    sortable: true
  }
]

// Funzioni
const loadOrders = async () => {
  loading.value = true

  try {
    const params = new URLSearchParams({
      page: pagination.value.page,
      limit: pagination.value.rowsPerPage,
      sortBy: pagination.value.sortBy,
      sortDesc: pagination.value.descending ? 'true' : 'false'
    })

    // Filtro per numero commissione
    if (filters.commNum) {
      params.append('commNum', filters.commNum)
    }

    // Filtro scadenza
    if (filters.expiredFilter === 'expired') {
      params.append('expiredDays', defaultExpiredDays)
    } else if (filters.expiredFilter === 'custom') {
      params.append('expiredDays', filters.customDays)
    } else if (filters.expiredFilter === 'notExpired') {
      params.append('notExpired', 'true')
    }

    const { data, error } = await useFetch(`/api/orders?${params.toString()}`)

    if (error.value) {
      throw new Error(error.value.message)
    }

    orders.value = data.value.orders || []
    totalOrders.value = data.value.total || 0

    // ✅ CRITICAL: aggiorna rowsNumber per la paginazione
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

// ✅ Handler per la paginazione server-side
const onRequest = (props) => {
  const { page, rowsPerPage, sortBy, descending } = props.pagination

  // Aggiorna i valori della paginazione
  pagination.value.page = page
  pagination.value.rowsPerPage = rowsPerPage
  pagination.value.sortBy = sortBy
  pagination.value.descending = descending

  // Ricarica i dati
  loadOrders()
}

const resetFilters = () => {
  filters.commNum = ''
  filters.expiredFilter = 'expired'
  filters.customDays = defaultExpiredDays
  pagination.value.page = 1
  loadOrders()
}

const handleRowClick = (evt, row) => {
  router.push(`/orders/${row._id}`)
}

const focusSearch = () => {
  searchInput.value?.focus()
}

// Utility functions
const formatDate = (date) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('it-IT')
}

const formatCurrency = (value) => {
  if (value === null || value === undefined) return '€ 0,00'
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR'
  }).format(value)
}

const getDueDateColor = (dueDate) => {
  if (!dueDate) return 'grey'

  const today = new Date()
  const due = new Date(dueDate)
  const diffDays = Math.floor((due - today) / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return 'negative' // Scaduto
  if (diffDays <= 7) return 'warning' // Scade entro 7 giorni
  return 'positive' // Ok
}

const getStatusColor = (status) => {
  const statusMap = {
    'ARCHIVIO': 'grey-7',
    'APERTA': 'positive',
    'CHIUSA': 'grey',
    'SPEDITO': 'info',
    'ANNULLATA': 'negative'
  }

  return statusMap[status] || 'primary'
}

const getClientName = (clientId) => {
  if (!clientId) return 'N/A'
  const parts = []
  if (clientId.firstname) parts.push(clientId.firstname)
  if (clientId.lastname) parts.push(clientId.lastname)
  if (parts.length > 0) return parts.join(' ')
  if (clientId.company) return clientId.company
  return 'N/A'
}

const getAgentName = (agentId) => {
  if (!agentId) return 'N/A'
  const parts = []
  if (agentId.firstname) parts.push(agentId.firstname)
  if (agentId.lastname) parts.push(agentId.lastname)
  return parts.length > 0 ? parts.join(' ') : 'N/A'
}

// Handler menu laterale
const handleNewOrder = () => {
  router.push('/orders/new')
}

const handleInvoice = () => {
  router.push('/invoices')
}

const handleExit = () => {
  authStore.logout()
}

// Mount
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
}

.filters-section {
  flex-shrink: 0;
}

.filters-card {
  background: $contrast;
  border-radius: 8px;
}

.table-section {
  flex: 1;
  overflow: hidden;
}

.orders-table {
  height: 100%;

  :deep(.q-table__top) {
    padding: 12px;
  }

  :deep(tbody tr) {
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover {
      background-color: rgba($primary, 0.05);
    }
  }

  :deep(th) {
    font-weight: 600;
    color: $text-primary;
    background: $bg-light;
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
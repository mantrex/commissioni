<template>
  <q-page class="invoices-page">
    <!-- Sidebar con menu principale -->
    <div class="sidebar">
      <q-btn class="menu-btn" color="primary" icon="add" label="Nuova" unelevated @click="handleNewInvoice" />

      <q-btn class="menu-btn" color="secondary" icon="search" label="Ricerca" unelevated
        @click="toggleAdvancedFilters" />

      <q-btn class="menu-btn" color="info" icon="arrow_back" label="Commissioni" unelevated
        @click="handleBackToOrders" />
    </div>

    <!-- Contenuto principale -->
    <div class="main-content">
      <!-- Filtri -->
      <InvoicesFilters v-model:filters="filters" v-model:show-advanced="showAdvancedFilters"
        :total-invoices="totalInvoices" @search="handleSearch" @reset="handleReset" />

      <!-- Tabella fatture -->
      <InvoicesTable v-model:pagination="pagination" :invoices="invoices" :loading="loading" @request="onRequest"
        @row-click="handleRowClick" @edit="handleEdit" />
    </div>
  </q-page>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import InvoicesFilters from '~/components/invoices/InvoicesFilters.vue'
import InvoicesTable from '~/components/invoices/InvoicesTable.vue'

const router = useRouter()
const $q = useQuasar()

const loading = ref(false)
const invoices = ref([])
const totalInvoices = ref(0)
const showAdvancedFilters = ref(false)

const filters = reactive({
  invoiceId: '',
  clientName: '',
  commNum: '',
  issued: null,
  dateFrom: null,
  dateTo: null
})

const pagination = ref({
  sortBy: 'invoiceDate',
  descending: true,
  page: 1,
  rowsPerPage: 25,
  rowsNumber: 0
})

const loadInvoices = async () => {
  loading.value = true

  try {
    const params = new URLSearchParams({
      page: pagination.value.page,
      limit: pagination.value.rowsPerPage,
      sortBy: pagination.value.sortBy,
      sortDesc: pagination.value.descending ? 'true' : 'false'
    })

    if (filters.invoiceId) params.append('invoiceId', filters.invoiceId)
    if (filters.clientName) params.append('clientName', filters.clientName)
    if (filters.commNum) params.append('commNum', filters.commNum)
    if (filters.issued !== null) params.append('issued', filters.issued)
    if (filters.dateFrom) params.append('dateFrom', filters.dateFrom)
    if (filters.dateTo) params.append('dateTo', filters.dateTo)

    const { data, error } = await useFetch(`/api/invoices?${params.toString()}`)

    if (error.value) {
      throw new Error(error.value.message || 'Errore nel caricamento')
    }

    invoices.value = data.value.invoices || []
    totalInvoices.value = data.value.total || 0
    pagination.value.rowsNumber = totalInvoices.value

  } catch (err) {
    $q.notify({
      type: 'negative',
      message: 'Errore nel caricamento delle fatture',
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
  loadInvoices()
}

const handleSearch = () => {
  pagination.value.page = 1
  loadInvoices()
}

const handleReset = () => {
  filters.invoiceId = ''
  filters.clientName = ''
  filters.commNum = ''
  filters.issued = null
  filters.dateFrom = null
  filters.dateTo = null
  pagination.value.page = 1
  loadInvoices()
}

const toggleAdvancedFilters = () => {
  showAdvancedFilters.value = !showAdvancedFilters.value
}

const handleRowClick = (row) => {
  router.push(`/invoices/${row._id}`)
}

const handleEdit = (row) => {
  router.push(`/invoices/${row._id}`)
}

const handleNewInvoice = () => {
  router.push('/invoices/new')
}

const handleBackToOrders = () => {
  router.push('/orders')
}

onMounted(() => {
  loadInvoices()
})
</script>

<style scoped lang="scss">
.invoices-page {
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

@media (max-width: 960px) {
  .invoices-page {
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
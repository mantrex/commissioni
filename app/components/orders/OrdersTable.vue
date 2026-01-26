<template>
  <div class="table-container">
    <q-table flat bordered :rows="orders" :columns="columns" :visible-columns="visibleColumns" row-key="_id"
      :loading="loading" v-model:pagination="localPagination" @request="emit('request', $event)"
      @row-click="(evt, row) => emit('rowClick', row)" class="orders-table" :rows-per-page-options="[10, 25, 50, 100]">
      <!-- Loading -->
      <template v-slot:loading>
        <q-inner-loading showing color="primary" />
      </template>

      <!-- Colonna numero commissione -->
      <template v-slot:body-cell-commNum="props">
        <q-td :props="props" class="text-bold cursor-pointer">
          {{ props.row.commNum }}
        </q-td>
      </template>

      <!-- Colonna data -->
      <template v-slot:body-cell-date="props">
        <q-td :props="props">
          {{ formatDate(props.row.date) }}
        </q-td>
      </template>

      <!-- Colonna agente -->
      <template v-slot:body-cell-agent="props">
        <q-td :props="props">
          {{ getAgentName(props.row.agentId) }}
        </q-td>
      </template>

      <!-- Colonna VIP - FIX: controllo esplicito === true -->
      <template v-slot:body-cell-vip="props">
        <q-td :props="props" class="text-center">
          <q-icon v-if="props.row.clientId?.vip === true" name="star" color="warning" size="sm" />
          <span v-else class="text-grey-5">—</span>
        </q-td>
      </template>

      <!-- Colonna cognome cliente -->
      <template v-slot:body-cell-clientLastname="props">
        <q-td :props="props">
          {{ props.row.clientId?.lastname || '' }}
        </q-td>
      </template>

      <!-- Colonna nome cliente -->
      <template v-slot:body-cell-clientFirstname="props">
        <q-td :props="props">
          {{ props.row.clientId?.firstname || '' }}
        </q-td>
      </template>

      <!-- Colonna paese -->
      <template v-slot:body-cell-country="props">
        <q-td :props="props">
          {{ props.row.clientId?.state || '' }}
        </q-td>
      </template>

      <!-- Colonna città -->
      <template v-slot:body-cell-city="props">
        <q-td :props="props">
          {{ props.row.clientId?.city || '' }}
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

      <!-- Colonna presenza fattura -->
      <template v-slot:body-cell-hasInvoice="props">
        <q-td :props="props" class="text-center">
          <q-icon v-if="props.row.hasInvoice" name="circle" color="positive" size="12px">
            <q-tooltip>Fattura esistente</q-tooltip>
          </q-icon>
          <span v-else class="text-grey-5">—</span>
        </q-td>
      </template>

      <!-- Colonna stato con badge colorato -->
    
      <template v-slot:body-cell-status="props">
        <q-td :props="props">
          <q-badge :color="getStatusColor(props.row.status)" :label="props.row.status || 'N/A'" />
        </q-td>
      </template>

      <!-- Colonna CA -->
      <template v-slot:body-cell-ca="props">
        <q-td :props="props" class="text-right">
          {{ props.row.ca || 0 }}
        </q-td>
      </template>

      <!-- Colonna RD -->
      <template v-slot:body-cell-rd="props">
        <q-td :props="props" class="text-right">
          {{ props.row.rd || 0 }}
        </q-td>
      </template>

      <!-- Colonna RIC -->
      <template v-slot:body-cell-ric="props">
        <q-td :props="props" class="text-right">
          {{ props.row.ric || 0 }}
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
</template>

<script setup>
import { computed } from 'vue'

// Props
const props = defineProps({
  orders: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  pagination: {
    type: Object,
    required: true
  }
})

// Emits
const emit = defineEmits(['update:pagination', 'request', 'rowClick'])

// Local state
const localPagination = computed({
  get: () => props.pagination,
  set: (val) => emit('update:pagination', val)
})

// Colonne tabella (SOLO quelle da visualizzare)
const columns = [
  {
    name: 'commNum',
    required: true,
    label: 'Comm.',
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
    name: 'agent',
    label: 'Vend.',
    align: 'left',
    field: row => row.agentId,
    sortable: false
  },
  {
    name: 'vip',
    label: 'VIP',
    align: 'center',
    field: row => row.clientId?.vip,
    sortable: false
  },
  {
    name: 'clientLastname',
    label: 'Cognome Cliente',
    align: 'left',
    field: row => row.clientId?.lastname,
    sortable: false
  },
  {
    name: 'clientFirstname',
    label: 'Nome Cliente',
    align: 'left',
    field: row => row.clientId?.firstname,
    sortable: false
  },
  {
    name: 'country',
    label: 'Paese',
    align: 'left',
    field: row => row.clientId?.state,
    sortable: false
  },
  {
    name: 'city',
    label: 'Città',
    align: 'left',
    field: row => row.clientId?.city,
    sortable: false
  },
  {
    name: 'dueDate',
    label: 'Scadenza',
    align: 'left',
    field: 'dueDate',
    sortable: true
  },
  {
    name: 'hasInvoice',
    label: 'FAT',
    align: 'center',
    field: 'hasInvoice',
    sortable: false,
    style: 'width: 60px'
  },
  {
    name: 'status',
    label: 'Posizione',
    align: 'center',
    field: 'status',
    sortable: true
  },
  {
    name: 'ca',
    label: 'CA',
    align: 'right',
    field: 'ca',
    sortable: true
  },
  {
    name: 'rd',
    label: 'RD',
    align: 'right',
    field: 'rd',
    sortable: true
  },
  {
    name: 'ric',
    label: 'RIC',
    align: 'right',
    field: 'ric',
    sortable: true
  }
]

// Colonne visibili (esclude quelle non necessarie)
const visibleColumns = computed(() => [
  'commNum', 'date', 'agent', 'vip', 'clientLastname', 'clientFirstname',
  'country', 'city', 'dueDate', 'hasInvoice', 'status', 'ca', 'rd', 'ric', 
])

// Utility functions
const formatDate = (date) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('it-IT')
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

const getAgentName = (agentId) => {
  if (!agentId) return 'N/A'
  const parts = []
  if (agentId.lastname) parts.push(agentId.lastname)
  if (agentId.firstname) parts.push(agentId.firstname)
  return parts.length > 0 ? parts.join(' ') : 'N/A'
}
</script>

<style scoped lang="scss">
.table-container {
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
    position: sticky;
    top: 0;
    z-index: 1;
  }
}
</style>
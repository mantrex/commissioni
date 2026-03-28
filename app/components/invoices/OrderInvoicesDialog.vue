<template>
  <div class="order-invoices-dialog">

    <!-- Lista fatture esistenti -->
    <div class="invoices-section">
      <div v-if="loading" class="state-box">
        <q-spinner size="24px" color="primary" />
        <span>Caricamento fatture...</span>
      </div>

      <div v-else-if="invoices.length === 0" class="state-box empty">
        <q-icon name="receipt_long" size="32px" color="grey-4" />
        <span class="empty-text">Nessuna fattura collegata a questa commissione</span>
      </div>

      <div v-else class="invoices-list">
        <div
          v-for="inv in invoices"
          :key="inv._id"
          class="invoice-row"
        >
          <div class="invoice-info">
            <span class="invoice-id">{{ inv.invoiceId }}</span>
            <span class="invoice-date">{{ formatDate(inv.invoiceDate) }}</span>
            <span class="invoice-client">{{ getClientName(inv.client) }}</span>
          </div>
          <div class="invoice-meta">
            <span class="invoice-total">{{ formatEuro(inv.total) }}</span>
            <q-badge
              :color="inv.issued ? 'positive' : 'grey-5'"
              :label="inv.issued ? 'Emessa' : 'Bozza'"
              class="q-ml-sm"
            />
          </div>
          <q-btn
            unelevated
            dense
            color="primary"
            icon="open_in_new"
            label="Apri"
            size="sm"
            class="open-btn"
            @click="handleOpenInvoice(inv)"
          />
        </div>
      </div>
    </div>

    <!-- Separatore -->
    <q-separator class="q-my-md" />

    <!-- Avviso se non ci sono articoli fatturabili (solo quando viene da una commissione) -->
    <q-banner
      v-if="fromOrder && !canCreate"
      dense rounded
      class="no-invoiceable-banner q-mb-md">
      <template #avatar>
        <q-icon name="info" color="warning" />
      </template>
      <span class="text-caption">
        Per creare una fattura, marca almeno un articolo come fatturato
        (colonna <strong>F.</strong> nella lista articoli).
      </span>
    </q-banner>

    <!-- Sezione crea nuova fattura -->
    <div class="new-invoice-section">
      <div class="section-title">
        <q-icon name="add_circle_outline" size="18px" color="primary" />
        <span>Crea nuova fattura</span>
      </div>

      <div class="q-mt-md">
        <q-select
          v-model="selectedType"
          :options="typeOptions"
          label="Tipo fattura"
          emit-value
          map-options
          outlined
          dense
          :disable="fromOrder && !canCreate"
          @update:model-value="fetchNextNumber"
        />

        <div class="invoice-preview q-mt-md" v-if="previewNumber && !fetchingNumber && (!fromOrder || canCreate)">
          <div class="preview-label">Numero fattura proposto</div>
          <div class="preview-number">{{ previewNumber }}</div>
        </div>

        <div v-if="fetchingNumber" class="text-center q-py-sm">
          <q-spinner size="20px" color="primary" />
        </div>
      </div>

      <div class="dialog-actions q-mt-md">
        <q-btn
          color="primary"
          label="Crea Fattura"
          unelevated
          icon="add"
          :disable="!previewNumber || fetchingNumber || (fromOrder && !canCreate)"
          @click="handleConfirm"
        >
          <q-tooltip v-if="fromOrder && !canCreate">
            Nessun articolo marcato come fatturato
          </q-tooltip>
        </q-btn>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { formatEuro } from '~/utils/formatters'
const props = defineProps({
  commNum: { type: String, default: null },
  orderId: { type: String, default: null },
  // true = aperto da commissione, false = standalone (sempre abilitato)
  fromOrder: { type: Boolean, default: false },
  // almeno un item con invoiced > 0
  canCreate: { type: Boolean, default: true }
})

const emit = defineEmits(['close'])
const router = useRouter()

// ─── Fatture esistenti ───
const loading = ref(false)
const invoices = ref([])

const loadInvoices = async () => {
  if (!props.commNum) return
  loading.value = true
  try {
    const data = await $fetch(`/api/invoices?commNum=${props.commNum}&limit=50&page=1`)
    invoices.value = data.invoices || []
  } catch (err) {
    console.error('Errore caricamento fatture:', err)
  } finally {
    loading.value = false
  }
}

const handleOpenInvoice = (inv) => {
  emit('close', null)
  router.push(`/invoices/edit?id=${inv._id}`)
}

// ─── Nuova fattura ───
const typeOptions = [
  { label: 'E - Export', value: 'E' },
  { label: 'N - Non Export', value: 'N' }
]

const selectedType = ref('E')
const nextNumber = ref(null)
const fetchingNumber = ref(false)
const currentYear = new Date().getFullYear()

const previewNumber = computed(() => {
  if (!nextNumber.value) return null
  const padded = String(nextNumber.value).padStart(3, '0')
  return `${selectedType.value}${padded}/${currentYear}`
})

const fetchNextNumber = async () => {
  fetchingNumber.value = true
  try {
    const data = await $fetch('/api/invoices/next-number', {
      query: { type: selectedType.value, year: currentYear }
    })
    nextNumber.value = data.nextNumber
  } catch {
    nextNumber.value = 1
  } finally {
    fetchingNumber.value = false
  }
}

const handleConfirm = () => {
  emit('close', {
    invoiceId: previewNumber.value,
    invoiceType: selectedType.value,
    invoiceNumber: nextNumber.value,
    invoiceYear: currentYear,
    commNum: props.commNum,
    orderId: props.orderId
  })
}

// ─── Format helpers ───
const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('it-IT')
}


const getClientName = (client) => {
  if (!client) return ''
  if (client.company) return client.company
  const parts = []
  if (client.lastname) parts.push(client.lastname)
  if (client.firstname) parts.push(client.firstname)
  return parts.join(' ')
}

onMounted(() => {
  loadInvoices()
  fetchNextNumber()
})
</script>

<style scoped lang="scss">
.order-invoices-dialog {
  min-width: 420px;
  padding: 16px;
}

.invoices-section {
  min-height: 60px;
}

.state-box {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px;
  color: $text-secondary;
  font-size: 13px;

  &.empty {
    flex-direction: column;
    justify-content: center;
    padding: 24px;
    background: $bg-light;
    border-radius: 8px;
    border: 1px dashed $border;

    .empty-text {
      color: $text-secondary;
      font-size: 13px;
    }
  }
}

.invoices-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.invoice-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: $contrast;
  border: 1px solid $border;
  border-radius: 6px;
  transition: border-color 0.15s;

  &:hover {
    border-color: $primary;
  }

  .invoice-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;

    .invoice-id {
      font-weight: 700;
      font-size: 14px;
      color: $primary;
      letter-spacing: 0.5px;
    }

    .invoice-date {
      font-size: 11px;
      color: $text-secondary;
    }

    .invoice-client {
      font-size: 12px;
      color: $text-primary;
    }
  }

  .invoice-meta {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 4px;

    .invoice-total {
      font-weight: 600;
      font-size: 13px;
    }
  }

  .open-btn {
    flex-shrink: 0;
  }
}

.no-invoiceable-banner {
  background: rgba($warning, 0.12);
  border: 1px solid rgba($warning, 0.3);
  border-radius: 6px;
}

.new-invoice-section {
  .section-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
    font-size: 14px;
    color: $text-primary;
  }
}

.invoice-preview {
  padding: 12px 16px;
  background: $primary;
  border-radius: 8px;
  text-align: center;

  .preview-label {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.8);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 4px;
  }

  .preview-number {
    font-size: 26px;
    font-weight: 700;
    color: white;
    letter-spacing: 2px;
  }
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
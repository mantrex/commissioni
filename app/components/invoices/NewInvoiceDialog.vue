<template>
  <div class="new-invoice-dialog">
    <div class="q-pa-md column q-gutter-md">

      <q-select
        v-model="selectedType"
        :options="typeOptions"
        label="Tipo fattura"
        emit-value
        map-options
        outlined
        dense
        @update:model-value="fetchNextNumber"
      />

      <div class="invoice-preview" v-if="previewNumber && !loading">
        <div class="preview-label">Numero fattura</div>
        <div class="preview-number">{{ previewNumber }}</div>
      </div>

      <div v-if="loading" class="text-center q-py-md">
        <q-spinner size="28px" color="primary" />
      </div>

    </div>

    <div class="dialog-actions q-pa-md q-pt-none">
      <q-btn flat label="Annulla" color="negative" @click="emit('close', null)" />
      <q-btn
        color="primary"
        label="Crea Fattura"
        unelevated
        icon="add"
        :disable="!previewNumber || loading"
        @click="handleConfirm"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const emit = defineEmits(['close'])

const typeOptions = [
  { label: 'E - Export', value: 'E' },
  { label: 'N - Non Export', value: 'N' }
]

const selectedType = ref('E')
const nextNumber = ref(null)
const loading = ref(false)
const currentYear = new Date().getFullYear()

const previewNumber = computed(() => {
  if (!nextNumber.value) return null
  const padded = String(nextNumber.value).padStart(3, '0')
  return `${selectedType.value}${padded}/${currentYear}`
})

const fetchNextNumber = async () => {
  loading.value = true
  try {
    const data = await $fetch('/api/invoices/next-number', {
      query: { type: selectedType.value, year: currentYear }
    })
    nextNumber.value = data.nextNumber
  } catch (err) {
    nextNumber.value = 1
  } finally {
    loading.value = false
  }
}

const handleConfirm = () => {
  emit('close', {
    invoiceId: previewNumber.value,
    invoiceType: selectedType.value,
    invoiceNumber: nextNumber.value,
    invoiceYear: currentYear
  })
}

onMounted(() => {
  fetchNextNumber()
})
</script>

<style scoped lang="scss">
.new-invoice-dialog {
  min-width: 340px;
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
    font-size: 28px;
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
<template>
  <component-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    title="Nuova Fattura"
    side
    :width="380"
  >
    <template #content>
      <div class="q-pa-md column gap-md">
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

        <div class="invoice-preview" v-if="previewNumber">
          <div class="preview-label">Numero fattura proposto</div>
          <div class="preview-number">{{ previewNumber }}</div>
        </div>

        <div v-if="loading" class="text-center q-py-sm">
          <q-spinner size="24px" color="primary" />
        </div>
      </div>
    </template>

    <template #actions>
      <q-btn flat label="Annulla" @click="$emit('update:modelValue', false)" />
      <q-btn
        color="primary"
        label="Crea Fattura"
        :disable="!previewNumber || loading"
        @click="handleConfirm"
      />
    </template>
  </component-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  modelValue: Boolean
})

const emit = defineEmits(['update:modelValue', 'confirm'])

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
  emit('confirm', {
    invoiceType: selectedType.value,
    invoiceNumber: nextNumber.value,
    invoiceYear: currentYear,
    invoiceId: previewNumber.value
  })
  emit('update:modelValue', false)
}

// Carica subito alla apertura del dialog
watch(() => props.modelValue, (val) => {
  if (val) {
    selectedType.value = 'E'
    fetchNextNumber()
  }
})
</script>

<style scoped lang="scss">
.invoice-preview {
  padding: 12px 16px;
  background: var(--q-primary);
  border-radius: 8px;
  text-align: center;

  .preview-label {
    font-size: 11px;
    color: rgba(white, 0.8);
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
</style>
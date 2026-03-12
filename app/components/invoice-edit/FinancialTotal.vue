<template>
  <q-card flat bordered class="financial-card section-card">
    <q-card-section class="section-header">
      <q-icon name="euro" size="18px" />
      <span>Totale fattura</span>
    </q-card-section>
    <q-card-section class="compact-section">
      <div class="compact-grid">
        <q-input v-model.number="financial.taxable" label="Imponibile" type="number" outlined dense step="0.01" />
        <q-checkbox v-model="financial.hasVat" label="IVA SI/NO" dense />
        <q-input v-model.number="financial.vatRate" label="% IVA" type="number" outlined dense
          :disable="!financial.hasVat" />
        <q-input :model-value="financial.vatAmount" label="Importo IVA" outlined dense readonly />
        <q-input :model-value="financial.total" label="Totale" outlined dense readonly class="text-weight-bold" />
        <q-input v-model.number="financial.deposit" label="Acconto" type="number" outlined dense step="0.01" />
        <q-input v-model.number="financial.cod" label="Cod" type="number" outlined dense step="0.01" />
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { watch } from 'vue'

const financial = defineModel('financial', {
  type: Object,
  required: true
})

// ✅ WATCH automatico per calcolare IVA e Totale
watch(
  () => [financial.value.taxable, financial.value.hasVat, financial.value.vatRate],
  () => {
    if (financial.value.hasVat) {
      financial.value.vatAmount = Math.round((financial.value.taxable * financial.value.vatRate) / 100 * 100) / 100
    } else {
      financial.value.vatAmount = 0
    }
    financial.value.total = Math.round((financial.value.taxable + financial.value.vatAmount) * 100) / 100
  },
  { deep: true }
)
</script>

<style scoped lang="scss">



.compact-section {
  padding: 8px !important;
}

.compact-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 6px;

  :deep(.q-field) {
    margin-bottom: 0;
  }

  :deep(.q-field__control) {
    min-height: 40px;
  }

  :deep(.q-field__label) {
    font-size: 12px;
  }

  :deep(input) {
    font-size: 12px;
  }
}
</style>

<template>
  <q-card flat bordered class="financial-card section-card">
    <q-card-section class="section-header">
      <q-icon name="euro" size="18px" />
      <span>Totale fattura</span>
    </q-card-section>
    <q-card-section class="compact-section">
      <div class="compact-grid">

        <!-- Imponibile -->
        <q-input
          :model-value="focusedField === 'taxable' ? rawInput.taxable : formatEuro(financial.taxable)"
          label="Imponibile"
          outlined dense
          inputmode="decimal"
          @focus="onFocus('taxable')"
          @blur="onBlur('taxable')"
          @update:model-value="v => rawInput.taxable = v" />

        <!-- IVA SI/NO -->
        <q-checkbox v-model="financial.hasVat" label="IVA SI/NO" dense />

        <!-- % IVA -->
        <q-input
          :model-value="focusedField === 'vatRate' ? rawInput.vatRate : formatEuro(financial.vatRate)"
          label="% IVA"
          outlined dense
          inputmode="decimal"
          :disable="!financial.hasVat"
          @focus="onFocus('vatRate')"
          @blur="onBlur('vatRate')"
          @update:model-value="v => rawInput.vatRate = v" />

        <!-- Importo IVA (readonly) -->
        <q-input
          :model-value="formatEuro(financial.vatAmount)"
          label="Importo IVA"
          outlined dense
          readonly />

        <!-- Totale (readonly) -->
        <q-input
          :model-value="formatEuro(financial.total)"
          label="Totale"
          outlined dense
          readonly
          class="text-weight-bold" />

        <!-- Acconto -->
        <q-input
          :model-value="focusedField === 'deposit' ? rawInput.deposit : formatEuro(financial.deposit)"
          label="Acconto"
          outlined dense
          inputmode="decimal"
          @focus="onFocus('deposit')"
          @blur="onBlur('deposit')"
          @update:model-value="v => rawInput.deposit = v" />

        <!-- Cod -->
        <q-input
          :model-value="focusedField === 'cod' ? rawInput.cod : formatEuro(financial.cod)"
          label="Cod"
          outlined dense
          inputmode="decimal"
          @focus="onFocus('cod')"
          @blur="onBlur('cod')"
          @update:model-value="v => rawInput.cod = v" />

      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'

const financial = defineModel('financial', {
  type: Object,
  required: true
})

// ─── Formattazione euro ───────────────────────────────────────────────────────
const formatEuro = (value) => {
  const n = parseFloat(value)
  if (isNaN(n)) return ''
  return new Intl.NumberFormat('it-IT', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(n)
}

const parseEuro = (value) => {
  if (value === null || value === undefined || value === '') return 0
  const cleaned = String(value).replace(/\./g, '').replace(',', '.')
  const n = parseFloat(cleaned)
  return isNaN(n) ? 0 : n
}

// ─── Focus/blur ───────────────────────────────────────────────────────────────
const focusedField = ref(null)
const rawInput = reactive({ taxable: '', vatRate: '', deposit: '', cod: '' })

const onFocus = (field) => {
  focusedField.value = field
  rawInput[field] = financial.value[field] ? String(financial.value[field]).replace('.', ',') : ''
  setTimeout(() => { if (document.activeElement) document.activeElement.select() }, 0)
}

const onBlur = (field) => {
  financial.value[field] = parseEuro(rawInput[field])
  focusedField.value = null
}

// ─── Calcolo automatico IVA e Totale ─────────────────────────────────────────
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
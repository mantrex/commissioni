<template>
  <q-card flat bordered class="financial-section">
    <q-card-section class="section-header">
      <div class="header-left">
        <q-icon name="euro" size="20px" />
        <span>Dati Finanziari</span>
      </div>
    </q-card-section>

    <q-card-section class="section-content">
      <div class="row q-col-gutter-sm">
        <div class="col-12 col-md-6">
          <q-input v-model.number="financial.taxable" label="Imponibile" type="number" outlined dense step="0.01">
            <template v-slot:prepend>
              <q-icon name="euro" />
            </template>
          </q-input>
        </div>

        <div class="col-12 col-md-6">
          <q-checkbox v-model="financial.hasVat" label="IVA Si/No" dense />
        </div>

        <div class="col-12 col-md-6">
          <q-input v-model.number="financial.vatRate" label="IVA %" type="number" outlined dense step="0.01"
            :disable="!financial.hasVat">
            <template v-slot:prepend>
              <q-icon name="percent" />
            </template>
          </q-input>
        </div>

        <div class="col-12 col-md-6">
          <q-input v-model.number="financial.vatAmount" label="Importo IVA" type="number" outlined dense step="0.01"
            readonly>
            <template v-slot:prepend>
              <q-icon name="euro" />
            </template>
          </q-input>
        </div>

        <div class="col-12 col-md-6">
          <q-input v-model.number="financial.total" label="Totale Fattura" type="number" outlined dense step="0.01"
            readonly class="total-field">
            <template v-slot:prepend>
              <q-icon name="euro" />
            </template>
          </q-input>
        </div>

        <div class="col-12 col-md-6">
          <q-input v-model.number="financial.deposit" label="Deposito" type="number" outlined dense step="0.01">
            <template v-slot:prepend>
              <q-icon name="euro" />
            </template>
          </q-input>
        </div>

        <div class="col-12 col-md-6">
          <q-input v-model.number="financial.cod" label="Cod" type="number" outlined dense step="0.01">
            <template v-slot:prepend>
              <q-icon name="euro" />
            </template>
          </q-input>
        </div>
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

// Auto-calcola IVA e totale
watch(() => [financial.value.taxable, financial.value.hasVat, financial.value.vatRate], () => {
  if (financial.value.hasVat) {
    financial.value.vatAmount = (financial.value.taxable * financial.value.vatRate) / 100
  } else {
    financial.value.vatAmount = 0
  }

  financial.value.total = financial.value.taxable + financial.value.vatAmount
}, { deep: true })
</script>

<style scoped lang="scss">
.financial-section {
  background: $contrast;
}

.section-header {
  padding: 12px 16px;
  background: $bg-light;

  .header-left {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
    color: $text-primary;
  }
}

.section-content {
  padding: 16px;
}

.total-field {
  :deep(.q-field__control) {
    font-weight: 600;
    background: rgba($primary, 0.05);
  }
}
</style>
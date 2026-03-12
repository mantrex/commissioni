<template>
  <q-card flat bordered class="data-card">
    <q-card-section class="section-header">
      <q-icon name="description" size="18px" />
      <span>Dati Fattura</span>
    </q-card-section>
    <q-card-section class="compact-section">
      <div class="compact-grid">
        <q-input v-model="data.invoiceDate" label="Data Fattura" type="date" outlined dense class="span-2" />
        <q-input v-model="data.commNum" label="Comm" outlined dense readonly />

        <q-select v-model="data.payment" label="Pagamento" :options="paymentOptions" option-label="label"
          option-value="value" emit-value map-options outlined dense use-input @filter="filterPayments" />

        <q-select v-model="data.shipping" label="Spedizione" :options="shipmentOptions" option-label="label"
          option-value="value" emit-value map-options outlined dense use-input @filter="filterShipments" />

        <q-select v-model="data.insurance" label="Assicura" :options="insuranceOptions" option-label="label"
          option-value="value" emit-value map-options outlined dense use-input @filter="filterInsurances" />

        <q-input v-model="data.notes" label="Note" outlined dense type="textarea" :rows="3" class="span-2" />

        <q-checkbox v-model="data.issued" label="Fattura Emessa" dense class="span-2" />
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const data = defineModel('data', {
  type: Object,
  required: true
})

// Caricamento select
const { payments: allPayments, loadPayments } = usePayments()
const { shipments: allShipments, loadShipments } = useShipments()
const { insurances: allInsurances, loadInsurances } = useInsurances()

const paymentOptions = ref([])
const shipmentOptions = ref([])
const insuranceOptions = ref([])

const filterPayments = (val, update) => {
  if (val === '') {
    update(() => { paymentOptions.value = allPayments.value })
    return
  }
  update(() => {
    const needle = val.toLowerCase()
    paymentOptions.value = allPayments.value.filter(p => p.label.toLowerCase().indexOf(needle) > -1)
  })
}

const filterShipments = (val, update) => {
  if (val === '') {
    update(() => { shipmentOptions.value = allShipments.value })
    return
  }
  update(() => {
    const needle = val.toLowerCase()
    shipmentOptions.value = allShipments.value.filter(s => s.label.toLowerCase().indexOf(needle) > -1)
  })
}

const filterInsurances = (val, update) => {
  if (val === '') {
    update(() => { insuranceOptions.value = allInsurances.value })
    return
  }
  update(() => {
    const needle = val.toLowerCase()
    insuranceOptions.value = allInsurances.value.filter(i => i.label.toLowerCase().indexOf(needle) > -1)
  })
}

onMounted(async () => {
  await loadPayments()
  await loadShipments()
  await loadInsurances()
  paymentOptions.value = allPayments.value
  shipmentOptions.value = allShipments.value
  insuranceOptions.value = allInsurances.value
})
</script>

<style scoped lang="scss">
.data-card {
  background: $contrast;
}



.compact-section {
  padding: 8px !important;
}

.compact-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 6px;

  .span-2 {
    grid-column: span 2;
  }

  :deep(.q-field) {
    margin-bottom: 0;
  }

  :deep(.q-field__control) {
    min-height: 40px;
  }

  :deep(.q-field__label) {
    font-size: 12px;
  }

  :deep(input),
  :deep(textarea) {
    font-size: 12px;
  }

  :deep(.q-select .q-field__native) {
    min-height: 40px;
    padding-top: 8px;
    padding-bottom: 8px;
  }
}
</style>

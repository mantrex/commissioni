<template>
  <q-card flat bordered class="data-section">
    <q-card-section class="section-header">
      <div class="header-left">
        <q-icon name="receipt" size="20px" />
        <span>Dati Fattura</span>
      </div>
    </q-card-section>

    <q-card-section class="section-content">
      <div class="row q-col-gutter-sm">
        <div class="col-12 col-md-6">
          <q-input v-model="data.invoiceDate" label="Data Fattura" type="date" outlined dense>
            <template v-slot:prepend>
              <q-icon name="event" />
            </template>
          </q-input>
        </div>

        <div class="col-12 col-md-6">
          <q-input v-model="data.commNum" label="Num Commissione" outlined dense readonly>
            <template v-slot:prepend>
              <q-icon name="tag" />
            </template>
          </q-input>
        </div>

        <div class="col-12 col-md-4">
          <q-select v-model="data.payment" :options="paymentOptions" label="Pagamento" option-label="label"
            option-value="value" emit-value map-options outlined dense clearable use-input @filter="filterPayments">
            <template v-slot:prepend>
              <q-icon name="payment" />
            </template>
          </q-select>
        </div>

        <div class="col-12 col-md-4">
          <q-select v-model="data.shipping" :options="shipmentOptions" label="Spedizione" option-label="label"
            option-value="value" emit-value map-options outlined dense clearable use-input @filter="filterShipments">
            <template v-slot:prepend>
              <q-icon name="local_shipping" />
            </template>
          </q-select>
        </div>

        <div class="col-12 col-md-4">
          <q-select v-model="data.insurance" :options="insuranceOptions" label="Assicura" option-label="label"
            option-value="value" emit-value map-options outlined dense clearable use-input @filter="filterInsurances">
            <template v-slot:prepend>
              <q-icon name="verified_user" />
            </template>
          </q-select>
        </div>

        <div class="col-12">
          <q-input v-model="data.notes" label="Note" outlined dense type="textarea" :rows="3" />
        </div>

        <div class="col-12">
          <q-checkbox v-model="data.issued" label="Fattura Emessa" dense />
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const { payments: allPayments, loadPayments } = usePayments()
const { shipments: allShipments, loadShipments } = useShipments()
const { insurances: allInsurances, loadInsurances } = useInsurances()

const data = defineModel('data', {
  type: Object,
  required: true
})

const paymentOptions = ref([])
const shipmentOptions = ref([])
const insuranceOptions = ref([])

const filterPayments = (val, update) => {
  if (val === '') {
    update(() => {
      paymentOptions.value = allPayments.value
    })
    return
  }

  update(() => {
    const needle = val.toLowerCase()
    paymentOptions.value = allPayments.value.filter(
      p => p.label.toLowerCase().indexOf(needle) > -1
    )
  })
}

const filterShipments = (val, update) => {
  if (val === '') {
    update(() => {
      shipmentOptions.value = allShipments.value
    })
    return
  }

  update(() => {
    const needle = val.toLowerCase()
    shipmentOptions.value = allShipments.value.filter(
      s => s.label.toLowerCase().indexOf(needle) > -1
    )
  })
}

const filterInsurances = (val, update) => {
  if (val === '') {
    update(() => {
      insuranceOptions.value = allInsurances.value
    })
    return
  }

  update(() => {
    const needle = val.toLowerCase()
    insuranceOptions.value = allInsurances.value.filter(
      i => i.label.toLowerCase().indexOf(needle) > -1
    )
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
.data-section {
  background: $contrast;
}



  .header-left {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
    color: $text-primary;
  }


.section-content {
  padding: 16px;
}
</style>
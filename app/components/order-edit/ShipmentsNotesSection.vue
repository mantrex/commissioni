<template>
  <q-card flat bordered class="shipments-notes-section">
    <q-card-section class="section-content">
      <div class="three-columns">
        <!-- Colonna 1: Corrieri -->
        <div class="column-wrapper">
          <div class="column-header">
            <q-icon name="local_shipping" size="18px" />
            <span>Corrieri</span>
          </div>

          <div class="shipments-list">
            <div v-for="(shipment, index) in localShipments" :key="index" class="shipment-row">
              <span class="row-label">{{ index + 1 }}</span>
              <q-input v-model="shipment.date" type="date" outlined dense class="date-input" />
              <q-select v-model="shipment.courier" :options="courierOptions" option-label="label" option-value="value"
                emit-value map-options outlined dense clearable use-input @filter="filterCouriers"
                class="courier-select" />
            </div>
          </div>
        </div>

        <!-- Colonna 2: Note -->
        <div class="column-wrapper">
          <div class="column-header">
            <q-icon name="notes" size="18px" />
            <span>Note</span>
          </div>

          <div class="notes-list">
            <q-input v-for="(note, index) in localNotes" :key="index" v-model="note.text" :label="`Nota ${index + 1}`"
              outlined dense type="textarea" :rows="2" class="note-input" />
          </div>
        </div>

        <!-- Colonna 3: Dati Finanziari -->
        <div class="column-wrapper">
          <div class="column-header">
            <q-icon name="euro" size="18px" />
            <span>Dati Finanziari</span>
          </div>

          <div class="financial-data">
            <q-input v-model.number="localFinancial.ca" label="C/A" type="number" outlined dense
              class="financial-input" />
            <q-input v-model.number="localFinancial.rd" label="RD" type="number" outlined dense
              class="financial-input" />
            <q-input v-model.number="localFinancial.ric" label="Ric." type="number" outlined dense
              class="financial-input" />
            <q-input v-model.number="localFinancial.balance" label="Saldo" type="number" outlined dense
              class="financial-input" />
            <q-input v-model.number="localFinancial.pay" label="Pag." type="number" outlined dense
              class="financial-input" />
          </div>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { getSelectableCouriers } from '~~/utils/couriers'

const props = defineProps({
  shipments: {
    type: Array,
    default: () => []
  },
  notes: {
    type: Array,
    default: () => []
  },
  financial: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update:shipments', 'update:notes', 'update:financial'])

// Inizializza con max 10 righe
const localShipments = ref(
  props.shipments.length > 0
    ? props.shipments
    : Array(10).fill(null).map(() => ({ date: null, courier: '' }))
)

const localNotes = ref(
  props.notes.length > 0
    ? props.notes
    : Array(10).fill(null).map(() => ({ text: '' }))
)

const localFinancial = ref({ ...props.financial })

// Corrieri
const allCouriers = ref(getSelectableCouriers())
const courierOptions = ref(allCouriers.value)

const filterCouriers = (val, update) => {
  if (val === '') {
    update(() => {
      courierOptions.value = allCouriers.value
    })
    return
  }

  update(() => {
    const needle = val.toLowerCase()
    courierOptions.value = allCouriers.value.filter(
      c => c.label.toLowerCase().indexOf(needle) > -1
    )
  })
}

// Watch
watch(localShipments, (newVal) => {
  emit('update:shipments', newVal)
}, { deep: true })

watch(localNotes, (newVal) => {
  emit('update:notes', newVal)
}, { deep: true })

watch(localFinancial, (newVal) => {
  emit('update:financial', newVal)
}, { deep: true })

watch(() => props.shipments, (newVal) => {
  if (newVal && newVal.length > 0) {
    localShipments.value = [...newVal]
  }
}, { deep: true })

watch(() => props.notes, (newVal) => {
  if (newVal && newVal.length > 0) {
    localNotes.value = [...newVal]
  }
}, { deep: true })

watch(() => props.financial, (newVal) => {
  localFinancial.value = { ...newVal }
}, { deep: true })
</script>

<style scoped lang="scss">
.shipments-notes-section {
  background: $contrast;
}

.section-content {
  padding: 16px;
}

.three-columns {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;

  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
  }
}

.column-wrapper {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.column-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: $text-primary;
  padding: 8px 12px;
  background: $bg-light;
  border-radius: 4px;
}

.shipments-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.shipment-row {
  display: grid;
  grid-template-columns: 30px 140px 1fr;
  gap: 8px;
  align-items: center;

  .row-label {
    font-size: 12px;
    font-weight: 600;
    color: $text-secondary;
  }
}

.notes-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.note-input {
  :deep(textarea) {
    min-height: 50px;
  }
}

.financial-data {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

// Responsive per schermi piccoli
@media (max-width: 768px) {
  .shipment-row {
    grid-template-columns: 30px 1fr;

    .date-input {
      grid-column: 2;
    }

    .courier-select {
      grid-column: 2;
    }
  }
}
</style>
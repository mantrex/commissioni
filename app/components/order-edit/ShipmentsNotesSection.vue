<template>
  <q-card flat bordered class="shipments-notes-section">
    <q-card-section class="section-header">
      <div class="header-left">
        <q-btn flat dense round :icon="collapsed ? 'expand_more' : 'expand_less'" size="sm"
          @click="collapsed = !collapsed" class="collapse-btn">
          <q-tooltip>{{ collapsed ? 'Espandi' : 'Comprimi' }}</q-tooltip>
        </q-btn>

        <q-icon name="local_shipping" size="18px" />
        <span>Corrieri / Note / Dati Finanziari</span>
      </div>
    </q-card-section>

    <q-slide-transition>
      <q-card-section v-show="!collapsed" class="section-content">
        <div class="three-columns">
          <!-- Colonna 1: Corrieri -->
          <div class="column-wrapper">
            <div class="column-header">
              <div class="header-left">
                <q-icon name="local_shipping" size="18px" />
                <span>Corrieri</span>
              </div>
              <q-btn flat dense round icon="add" size="sm" color="primary" @click="addShipment">
                <q-tooltip>Aggiungi corriere</q-tooltip>
              </q-btn>
            </div>

            <div class="shipments-list">
              <div v-for="(shipment, index) in localShipments" :key="index" class="shipment-row">
                <q-btn flat dense round icon="delete" size="xs" color="negative" @click="removeShipment(index)"
                  class="delete-btn">
                  <q-tooltip>Rimuovi</q-tooltip>
                </q-btn>
                <span class="row-label">{{ index + 1 }}</span>
                <q-input v-model="shipment.date" type="date" outlined dense class="date-input" />
                <q-input v-model="shipment.courier" outlined dense placeholder="Corriere" class="courier-input" />
              </div>
            </div>
          </div>

          <!-- Colonna 2: Note -->
          <div class="column-wrapper">
            <div class="column-header">
              <div class="header-left">
                <q-icon name="notes" size="18px" />
                <span>Note</span>
              </div>
              <q-btn flat dense round icon="add" size="sm" color="primary" @click="addNote">
                <q-tooltip>Aggiungi nota</q-tooltip>
              </q-btn>
            </div>

            <div class="notes-list">
              <div v-for="(note, index) in localNotes" :key="index" class="note-row">
                <q-btn flat dense round icon="delete" size="xs" color="negative" @click="removeNote(index)"
                  class="delete-btn">
                  <q-tooltip>Rimuovi</q-tooltip>
                </q-btn>
                <q-input v-model="note.text" :label="`Nota ${index + 1}`" outlined dense type="textarea" :rows="2"
                  class="note-input" />
              </div>
            </div>
          </div>

          <!-- Colonna 3: Dati Finanziari -->
          <div class="column-wrapper">
            <div class="column-header">
              <div class="header-left">
                <q-icon name="euro" size="18px" />
                <span>Dati Finanziari</span>
              </div>
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
    </q-slide-transition>
  </q-card>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useQuasar } from 'quasar'

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

const $q = useQuasar()
const collapsed = ref(false)
const isUpdating = ref(false)

const localShipments = ref([])
const localNotes = ref([])
const localFinancial = ref({})

// ✅ Watch sicuri: props -> local (riceve dati da parent)
watch(() => props.shipments, (newVal) => {
  if (!isUpdating.value && newVal) {
    console.log('🚚 ShipmentsSection riceve shipments:', newVal.length)
    localShipments.value = [...newVal]
  }
}, { deep: true, immediate: true })

watch(() => props.notes, (newVal) => {
  if (!isUpdating.value && newVal) {
    console.log('📝 NotesSection riceve notes:', newVal.length)
    localNotes.value = [...newVal]
  }
}, { deep: true, immediate: true })

watch(() => props.financial, (newVal) => {
  if (!isUpdating.value && newVal) {
    console.log('💰 FinancialSection riceve financial')
    localFinancial.value = { ...newVal }
  }
}, { deep: true, immediate: true })

// ✅ Watch sicuri: local -> emit (invia modifiche a parent)
watch(localShipments, (newVal) => {
  if (!isUpdating.value) {
    isUpdating.value = true
    emit('update:shipments', newVal)
    setTimeout(() => {
      isUpdating.value = false
    }, 50)
  }
}, { deep: true })

watch(localNotes, (newVal) => {
  if (!isUpdating.value) {
    isUpdating.value = true
    emit('update:notes', newVal)
    setTimeout(() => {
      isUpdating.value = false
    }, 50)
  }
}, { deep: true })

watch(localFinancial, (newVal) => {
  if (!isUpdating.value) {
    isUpdating.value = true
    emit('update:financial', newVal)
    setTimeout(() => {
      isUpdating.value = false
    }, 50)
  }
}, { deep: true })

// Gestione corrieri
const addShipment = () => {
  localShipments.value.push({ date: null, courier: '' })
}

const removeShipment = (index) => {
  if (localShipments.value.length <= 1) {
    $q.notify({
      type: 'warning',
      message: 'Deve rimanere almeno un corriere'
    })
    return
  }

  $q.dialog({
    title: 'Conferma',
    message: 'Vuoi rimuovere questo corriere?',
    cancel: true,
    persistent: true
  }).onOk(() => {
    localShipments.value.splice(index, 1)
  })
}

// Gestione note
const addNote = () => {
  localNotes.value.push({ text: '' })
}

const removeNote = (index) => {
  if (localNotes.value.length <= 1) {
    $q.notify({
      type: 'warning',
      message: 'Deve rimanere almeno una nota'
    })
    return
  }

  $q.dialog({
    title: 'Conferma',
    message: 'Vuoi rimuovere questa nota?',
    cancel: true,
    persistent: true
  }).onOk(() => {
    localNotes.value.splice(index, 1)
  })
}
</script>

<style scoped lang="scss">
.shipments-notes-section {
  background: $contrast;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: $bg-light;

  .header-left {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
    color: $text-primary;
  }

  .collapse-btn {
    margin-right: 4px;
  }
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
  justify-content: space-between;
  padding: 8px 12px;
  background: $bg-light;
  border-radius: 4px;

  .header-left {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
    color: $text-primary;
  }
}

.shipments-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.shipment-row {
  display: grid;
  grid-template-columns: 32px 30px 140px 1fr;
  gap: 8px;
  align-items: center;

  .delete-btn {
    width: 28px;
    height: 28px;
  }

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

.note-row {
  display: grid;
  grid-template-columns: 32px 1fr;
  gap: 8px;
  align-items: flex-start;

  .delete-btn {
    width: 28px;
    height: 28px;
    margin-top: 8px;
  }
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

@media (max-width: 768px) {
  .shipment-row {
    grid-template-columns: 32px 30px 1fr;

    .date-input {
      grid-column: 3;
    }

    .courier-input {
      grid-column: 3;
    }
  }
}
</style>
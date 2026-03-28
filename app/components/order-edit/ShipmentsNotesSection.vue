<template>
  <q-card flat bordered class="shipments-notes-section section-card">
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
            <div class="column-header sub-header">
              <div class="header-left">
                <q-icon name="local_shipping" size="18px" />
                <span>Corrieri</span>
              </div>
              <q-btn flat dense round icon="add" size="sm" color="primary" @click="addShipment">
                <q-tooltip>Aggiungi corriere</q-tooltip>
              </q-btn>
            </div>

            <div class="shipments-list">
              <div v-for="(shipment, index) in shipments" :key="index" class="shipment-row">
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
            <div class="column-header sub-header">
              <div class="header-left">
                <q-icon name="notes" size="18px" />
                <span>Note</span>
              </div>
              <q-btn flat dense round icon="add" size="sm" color="primary" @click="addNote">
                <q-tooltip>Aggiungi nota</q-tooltip>
              </q-btn>
            </div>

            <div class="notes-list">
              <div v-for="(note, index) in notes" :key="index" class="note-row">
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
          <div class="column-wrapper financial-data-wrapper">
            <div class="column-header sub-header">
              <div class="header-left">
                <q-icon name="euro" size="18px" />
                <span>Dati Finanziari</span>
              </div>
            </div>

            <div class="financial-data">
              <q-input
                :model-value="focusedField === 'ca' ? rawInput.ca : formatEuro(financial.ca)"
                label="C/A"
                outlined dense
                class="financial-input bg-body"
                inputmode="decimal"
                @focus="onFocus('ca')"
                @blur="onBlur('ca')"
                @update:model-value="v => rawInput.ca = v" />

              <q-input
                :model-value="focusedField === 'rd' ? rawInput.rd : formatEuro(financial.rd)"
                label="RD"
                outlined dense
                class="financial-input bg-body"
                inputmode="decimal"
                @focus="onFocus('rd')"
                @blur="onBlur('rd')"
                @update:model-value="v => rawInput.rd = v" />

              <q-input
                :model-value="focusedField === 'ric' ? rawInput.ric : formatEuro(financial.ric)"
                label="Ric."
                outlined dense
                class="financial-input bg-body"
                inputmode="decimal"
                @focus="onFocus('ric')"
                @blur="onBlur('ric')"
                @update:model-value="v => rawInput.ric = v" />

              <q-input
                :model-value="formatEuro(financial.balance)"
                label="Saldo"
                outlined dense
                class="financial-input financial-input--readonly"
                readonly />

              <div class="financial-data-separator"></div>

              <q-input
                :model-value="focusedField === 'pay' ? rawInput.pay : formatEuro(financial.pay)"
                label="Pag."
                outlined dense
                class="financial-input bg-body"
                inputmode="decimal"
                @focus="onFocus('pay')"
                @blur="onBlur('pay')"
                @update:model-value="v => rawInput.pay = v" />
            </div>
          </div>
        </div>
      </q-card-section>
    </q-slide-transition>
  </q-card>
</template>

<script setup>
import { ref, reactive, watch, nextTick } from 'vue'
import { useQuasar } from 'quasar'
import {formatEuro} from "~/utils/formatters"

const shipments = defineModel('shipments', {
  type: Array,
  default: () => []
})

const notes = defineModel('notes', {
  type: Array,
  default: () => []
})

const financial = defineModel('financial', {
  type: Object,
  default: () => ({
    ca: 0,
    rd: 0,
    ric: 0,
    balance: 0,
    pay: 0
  })
})

const $q = useQuasar()
const collapsed = ref(false)


const parseEuro = (value) => {
  if (value === null || value === undefined || value === '') return 0
  // Rimuove separatori migliaia (.) e sostituisce virgola decimale con punto
  const cleaned = String(value).replace(/\./g, '').replace(',', '.')
  const n = parseFloat(cleaned)
  return isNaN(n) ? 0 : n
}

// Campo attualmente in focus e relativo raw input
const focusedField = ref(null)
const rawInput = reactive({ ca: '', rd: '', ric: '', pay: '' })

const onFocus = (field) => {
  focusedField.value = field
  rawInput[field] = financial.value[field] ? String(financial.value[field]).replace('.', ',') : ''
  setTimeout(() => {
    const el = document.activeElement
    if (el) el.select()
  }, 0)
}

const onBlur = (field) => {
  const parsed = parseEuro(rawInput[field])
  financial.value[field] = parsed
  focusedField.value = null
}

// ─── Calcolo saldo automatico ─────────────────────────────────────────────────
watch(
  () => [financial.value.ca, financial.value.rd, financial.value.ric],
  ([ca, rd, ric]) => {
    financial.value.balance = (ric || 0) - ((ca || 0) + (rd || 0))
  },
  { immediate: true }
)

// ─── Corrieri ─────────────────────────────────────────────────────────────────
const addShipment = () => {
  shipments.value.push({ date: null, courier: '' })
}

const removeShipment = (index) => {
  if (shipments.value.length <= 1) {
    $q.notify({ type: 'warning', message: 'Deve rimanere almeno un corriere' })
    return
  }
  $q.dialog({
    title: 'Conferma',
    message: 'Vuoi rimuovere questo corriere?',
    cancel: true,
    persistent: true
  }).onOk(() => {
    shipments.value.splice(index, 1)
  })
}

// ─── Note ─────────────────────────────────────────────────────────────────────
const addNote = () => {
  notes.value.push({ text: '' })
}

const removeNote = (index) => {
  if (notes.value.length <= 1) {
    $q.notify({ type: 'warning', message: 'Deve rimanere almeno una nota' })
    return
  }
  $q.dialog({
    title: 'Conferma',
    message: 'Vuoi rimuovere questa nota?',
    cancel: true,
    persistent: true
  }).onOk(() => {
    notes.value.splice(index, 1)
  })
}
</script>

<style scoped lang="scss">
  .header-left {
    display: flex;
    align-items: center;
    gap: 8px;
    color: $text-primary;
  }

  .collapse-btn {
    margin-right: 4px;
  }

.section-content {
  padding: 16px;
}

.three-columns {
  display: grid;
  grid-template-columns: (1fr 2fr 180px);
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

.financial-data-wrapper {
  border: 1px solid $border;
  padding: 8px;
  border-radius: 4px;
  background: $bg-light2;
  width: auto;
  align-self: start;
}

.financial-data {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.financial-input--readonly {
  :deep(.q-field__control) {
    background: $readonly;
    color: $text-secondary;
  }
}

.financial-data-separator {
  border-bottom: 1px solid $border;
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
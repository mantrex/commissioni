<template>
  <q-card flat bordered class="receipts-card">
    <q-card-section class="section-header">
      <div class="header-left-items">
        <q-icon name="receipt" size="18px" />
        <span>Scontrini</span>
        <q-chip v-if="receipts.length > 0" dense color="primary" text-color="white" size="sm">
          {{ receipts.length }}
        </q-chip>
      </div>
      <q-btn flat dense size="sm" icon="add" color="primary" @click="handleAdd">
        <q-tooltip>Aggiungi scontrino</q-tooltip>
      </q-btn>
    </q-card-section>
    <q-card-section class="compact-section">
      <div v-if="receipts.length === 0" class="text-center text-grey-7 q-pa-sm">
        <q-icon name="receipt" size="24px" />
        <div class="text-caption q-mt-xs">Nessuno scontrino</div>
      </div>
      <div v-else class="receipts-list">
        <div class="receipt-row" v-for="(receipt, index) in receipts" :key="index">
          <span class="receipt-label">N.{{ index + 1 }}</span>
          <q-input v-model="receipt.number" placeholder="Numero" outlined dense class="receipt-input" />
          <q-input v-model="receipt.date" type="date" placeholder="Data" outlined dense class="receipt-input" />
          <q-btn flat dense round icon="delete" size="xs" color="negative" @click="handleRemove(index)">
            <q-tooltip>Rimuovi</q-tooltip>
          </q-btn>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
const receipts = defineModel('receipts', {
  type: Array,
  required: true
})

const handleAdd = () => {
  receipts.value.push({ number: '', date: null })
}

const handleRemove = (index) => {
  receipts.value.splice(index, 1)
}
</script>

<style scoped lang="scss">
.receipts-card {
  background: $contrast;
}



  .header-left-items {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 1;
  }


.compact-section {
  padding: 8px !important;
}

.receipts-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.receipt-row {
  display: grid;
  grid-template-columns: 40px 1fr 1fr 32px;
  gap: 6px;
  align-items: center;

  .receipt-label {
    font-size: 11px;
    font-weight: 600;
    color: $text-secondary;
  }

  .receipt-input {
    :deep(.q-field__control) {
      min-height: 32px;
      height: 32px;
    }

    :deep(.q-field__label) {
      font-size: 12px;
    }

    :deep(input) {
      font-size: 12px;
    }
  }
}
</style>

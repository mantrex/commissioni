<template>
  <q-card flat bordered class="receipts-section">
    <q-card-section class="section-header">
      <div class="header-left">
        <q-icon name="receipt_long" size="20px" />
        <span>Scontrini</span>
      </div>
    </q-card-section>

    <q-card-section class="section-content">
      <div class="receipts-list">
        <div v-for="(receipt, index) in receipts" :key="index" class="receipt-row">
          <span class="row-label">{{ index + 1 }}</span>
          <q-input v-model="receipt.number" :label="`Numero Scontrino ${index + 1}`" outlined dense
            class="receipt-number" />
          <q-input v-model="receipt.date" type="date" label="Data" outlined dense class="receipt-date" />
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
const receipts = defineModel('receipts', {
  type: Array,
  default: () => []
})
</script>

<style scoped lang="scss">
.receipts-section {
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

.receipts-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.receipt-row {
  display: grid;
  grid-template-columns: 30px 1fr 150px;
  gap: 8px;
  align-items: center;

  .row-label {
    font-size: 12px;
    font-weight: 600;
    color: $text-secondary;
  }
}

@media (max-width: 768px) {
  .receipt-row {
    grid-template-columns: 30px 1fr;

    .receipt-date {
      grid-column: 2;
    }
  }
}
</style>
<template>
  <q-card flat bordered class="shipping-card">
    <q-card-section class="section-header">
      <q-icon name="local_shipping" size="18px" />
      <span>Etichetta Spedizione</span>
    </q-card-section>
    <q-card-section class="compact-section">
      <div class="compact-grid">
        <q-input v-model="label.line1" label="Riga 1" outlined dense class="span-2" />
        <q-input v-model="label.line2" label="Riga 2" outlined dense class="span-2" />
        <q-input v-model="label.line3" label="Riga 3" outlined dense class="span-2" />
        <q-input v-model="label.line4" label="Riga 4" outlined dense class="span-2" />
        <q-input v-model="label.tel" label="Tel" outlined dense />
        <q-input v-model="label.content" label="Contenuto" outlined dense />
        <q-input v-model="label.netWeight" label="P.Netto" outlined dense />
        <q-input v-model="label.grossWeight" label="P.Lordo" outlined dense />
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
const label = defineModel('label', {
  type: Object,
  required: true
})
</script>

<style scoped lang="scss">
.shipping-card {
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

  :deep(input) {
    font-size: 12px;
  }
}
</style>

<template>
  <q-card flat bordered class="client-card">
    <q-card-section class="section-header">
      <q-icon name="person" size="18px" />
      <span>Dati Cliente</span>
    </q-card-section>
    <q-card-section class="compact-section">
      <div class="compact-grid">
        <q-input v-model="client.lastname" label="Cognome" outlined dense />
        <q-input v-model="client.firstname" label="Nome" outlined dense />
        <q-input v-model="client.title" label="Titolo" outlined dense class="span-2" />
        <q-input v-model="client.company" label="Ditta" outlined dense class="span-2" />
        <q-input v-model="client.address" label="Indirizzo" outlined dense class="span-2" />
        <q-input v-model="client.cap" label="CAP" outlined dense />
        <q-input v-model="client.city" label="Città" outlined dense />
        <q-input v-model="client.region" label="Prov" outlined dense />
        <q-input v-model="client.state" label="Paese" outlined dense />
        <q-input v-model="client.tel" label="Tel" outlined dense class="span-2" />
        <q-input v-model="client.piva" label="P.IVA" outlined dense class="span-2" />
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
const client = defineModel('client', {
  type: Object,
  required: true
})
</script>

<style scoped lang="scss">
.client-card {
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

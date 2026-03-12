<template>
  <q-card flat bordered class="client-section">
    <q-card-section class="section-header">
      <div class="header-left">
        <q-icon name="person" size="20px" />
        <span>Dati Cliente</span>
      </div>
    </q-card-section>

    <q-card-section class="section-content">
      <div class="row q-col-gutter-sm">
        <div class="col-12 col-md-6">
          <q-input v-model="client.lastname" label="Cognome" outlined dense />
        </div>
        <div class="col-12 col-md-6">
          <q-input v-model="client.firstname" label="Nome" outlined dense />
        </div>
        <div class="col-12 col-md-6">
          <q-input v-model="client.title" label="Titolo" outlined dense />
        </div>
        <div class="col-12 col-md-6">
          <q-input v-model="client.company" label="Ditta" outlined dense />
        </div>
        <div class="col-12">
          <q-input v-model="client.address" label="Indirizzo" outlined dense />
        </div>
        <div class="col-12 col-md-4">
          <q-input v-model="client.cap" label="CAP" outlined dense />
        </div>
        <div class="col-12 col-md-4">
          <q-input v-model="client.city" label="Città" outlined dense />
        </div>
        <div class="col-12 col-md-4">
          <q-input v-model="client.region" label="Provincia" outlined dense />
        </div>
        <div class="col-12 col-md-6">
          <q-input v-model="client.state" label="Paese" outlined dense />
        </div>
        <div class="col-12 col-md-6">
          <q-input v-model="client.tel" label="Telefono" outlined dense />
        </div>
        <div class="col-12">
          <q-input v-model="client.piva" label="P.IVA" outlined dense />
        </div>
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
.client-section {
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
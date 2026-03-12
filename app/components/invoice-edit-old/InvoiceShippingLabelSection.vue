<template>
  <q-card flat bordered class="label-section">
    <q-card-section class="section-header">
      <div class="header-left">
        <q-icon name="local_shipping" size="20px" />
        <span>Etichetta Spedizione</span>
      </div>
    </q-card-section>

    <q-card-section class="section-content">
      <div class="row q-col-gutter-sm">
        <div class="col-12">
          <q-input v-model="label.line1" label="Riga 1" outlined dense />
        </div>
        <div class="col-12">
          <q-input v-model="label.line2" label="Riga 2" outlined dense />
        </div>
        <div class="col-12">
          <q-input v-model="label.line3" label="Riga 3" outlined dense />
        </div>
        <div class="col-12">
          <q-input v-model="label.line4" label="Riga 4" outlined dense />
        </div>
        <div class="col-12 col-md-6">
          <q-input v-model="label.tel" label="Telefono" outlined dense />
        </div>
        <div class="col-12 col-md-6">
          <q-input v-model="label.content" label="Contenuto" outlined dense />
        </div>
        <div class="col-12 col-md-6">
          <q-input v-model="label.netWeight" label="Peso Netto" outlined dense />
        </div>
        <div class="col-12 col-md-6">
          <q-input v-model="label.grossWeight" label="Peso Lordo" outlined dense />
        </div>
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
.label-section {
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
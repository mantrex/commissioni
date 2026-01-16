<template>
  <q-page class="invoices-list-page">
    <div class="invoices-container">
      <div class="page-header">
        <h5>Fatture</h5>
        <q-btn color="primary" icon="add" label="Nuova Fattura" unelevated @click="handleNewInvoice" />
      </div>

      <q-card flat bordered>
        <q-card-section>
          <div class="text-grey-7">Lista fatture - In costruzione</div>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const handleNewInvoice = () => {
  router.push('/invoices/new')
}
</script>

<style scoped lang="scss">
.invoices-list-page {
  background: $bg-light;
}

.invoices-container {
  max-width: 1600px;
  margin: 0 auto;
  padding: 16px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 16px;
  background: $contrast;
  border-radius: 8px;

  h5 {
    margin: 0;
    color: $text-primary;
    font-size: 20px;
    font-weight: 600;
  }
}
</style>
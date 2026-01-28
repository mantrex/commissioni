<template>
  <q-page class="invoice-page">
    <InvoiceForm mode="edit" :invoice-id="invoiceId" />
  </q-page>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import InvoiceForm from '~/components/invoices/InvoicesForm.vue'

const route = useRoute()
const invoiceId = computed(() => route.params.id)
</script>

<style scoped lang="scss">
.invoice-page {
  background: $bg-light;
}
</style>
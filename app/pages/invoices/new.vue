<template>
  <q-page class="invoice-page">
    <InvoiceForm mode="new" :comm-num="commNum" />
  </q-page>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import InvoiceForm from '~/components/invoices/InvoicesForm.vue'

const route = useRoute()
const commNum = computed(() => route.query.commNum || null)
</script>

<style scoped lang="scss">
.invoice-page {
  background: $bg-light;
}
</style>
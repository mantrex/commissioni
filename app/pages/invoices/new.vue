<template>
  <q-page class="invoice-page">
    <InvoiceForm
      mode="new"
      :comm-num="commNum"
      :preset-invoice-id="presetInvoiceId"
      :preset-invoice-type="presetInvoiceType"
      :preset-invoice-number="presetInvoiceNumber"
      :preset-invoice-year="presetInvoiceYear" />
  </q-page>
</template>

<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import InvoiceForm from "~/components/invoices/InvoicesForm.vue";

const route = useRoute();
const commNum = computed(() => route.query.commNum || null)
const presetInvoiceId = computed(() => route.query.invoiceId || null)
const presetInvoiceType = computed(() => route.query.invoiceType || 'E')
const presetInvoiceNumber = computed(() => route.query.invoiceNumber ? parseInt(route.query.invoiceNumber) : null)
const presetInvoiceYear = computed(() => route.query.invoiceYear ? parseInt(route.query.invoiceYear) : new Date().getFullYear())
</script>

<style scoped lang="scss">
.invoice-page {
  background: $bg-light;
}
</style>

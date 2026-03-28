<template>
  <div class="print-container">
    <div class="print-header">
      <h2>Lista Commissioni</h2>
      <p class="print-date">Stampato il: {{ formatDate(new Date()) }}</p>
    </div>

    <table class="print-table">
      <thead>
        <tr>
          <th v-for="col in visibleColumns" :key="col.field">{{ col.label }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="order in orders" :key="order.commNum">
          <td v-for="col in visibleColumns" :key="col.field">
            <template v-if="col.field === 'date' || col.field === 'shipDate'">
              {{ order[col.field] ? formatDate(order[col.field]) : '' }}
            </template>
            <template v-else-if="col.field === 'ca' || col.field === 'rd'">
              {{ order[col.field] ? '✓' : '' }}
            </template>
            <template v-else-if="col.field === 'balance'">
              {{ formatEuro(order[col.field]) }}
            </template>
            <template v-else>
              {{ order[col.field] }}
            </template>
          </td>
        </tr>
      </tbody>
    </table>

    <div class="print-footer">
      Totale commissioni: {{ orders.length }}
    </div>
  </div>
</template>

<script setup>
import { formatEuro } from '~/utils/formatters'
const props = defineProps({
  orders: { type: Array, default: () => [] },
  fields: { type: Array, default: () => [] }
})

const allColumns = [
  { field: 'commNum',       label: 'N. Comm.' },
  { field: 'date',          label: 'Data' },
  { field: 'agent',         label: 'Venditore' },
  { field: 'clientLastname',label: 'Cognome' },
  { field: 'clientFirstname',label: 'Nome' },
  { field: 'clientCompany', label: 'Ditta' },
  { field: 'clientState',   label: 'Paese' },
  { field: 'clientCity',    label: 'Città' },
  { field: 'position',      label: 'Posizione' },
  { field: 'ca',            label: 'CA' },
  { field: 'rd',            label: 'RD' },
  { field: 'balance',       label: 'Saldo' },
  { field: 'shipDate',      label: 'Data Sped.' },
  { field: 'courier',       label: 'Corriere' },
]

const visibleColumns = computed(() =>
  props.fields.length > 0
    ? allColumns.filter(c => props.fields.includes(c.field))
    : allColumns
)

const formatDate = (d) => d ? new Date(d).toLocaleDateString('it-IT') : ''

</script>

<style scoped>
.print-container { font-family: Arial, sans-serif; font-size: 11px; padding: 10px; }
.print-header { margin-bottom: 10px; }
.print-header h2 { margin: 0; font-size: 16px; }
.print-date { color: #666; margin: 2px 0; }
.print-table { width: 100%; border-collapse: collapse; }
.print-table th, .print-table td { border: 1px solid #ccc; padding: 3px 6px; text-align: left; }
.print-table th { background: #f0f0f0; font-weight: bold; }
.print-table tr:nth-child(even) { background: #fafafa; }
.print-footer { margin-top: 8px; font-weight: bold; }
</style>
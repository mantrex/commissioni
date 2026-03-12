<template>
  <q-card flat bordered class="items-card">
    <q-card-section class="section-header">
      <div class="header-left-items">
        <q-icon name="inventory_2" size="18px" />
        <span>Voci Fattura</span>
        <q-chip v-if="items.length > 0" dense color="primary" text-color="white" size="sm">
          {{ items.length }}
        </q-chip>
      </div>
      <q-btn color="primary" icon="add" label="Aggiungi" unelevated dense size="sm" @click="handleAdd" />
    </q-card-section>
    <q-card-section class="q-pa-none">
      <q-table flat :rows="items" :columns="columns" row-key="_id" dense :rows-per-page-options="[0]" hide-pagination
        class="items-table">

        <template v-slot:body-cell-actions="props">
          <q-td :props="props">
            <q-btn flat dense round icon="edit" size="sm" color="primary" @click="handleEdit(props.row, props.rowIndex)" />
            <q-btn flat dense round icon="delete" size="sm" color="negative" @click="handleRemove(props.rowIndex)" />
          </q-td>
        </template>

        <template v-slot:body-cell-unitPrice="props">
          <q-td :props="props" class="text-right">
            {{ formatCurrency(props.row.unitPrice) }}
          </q-td>
        </template>

        <template v-slot:body-cell-total="props">
          <q-td :props="props" class="text-right text-weight-bold">
            {{ formatCurrency((props.row.quantity || 0) * (props.row.unitPrice || 0)) }}
          </q-td>
        </template>

        <template v-slot:no-data>
          <div class="full-width row flex-center q-pa-md text-grey-7">
            <q-icon size="2em" name="inventory_2" class="q-mr-sm" />
            <span>Nessuna voce</span>
          </div>
        </template>
      </q-table>
    </q-card-section>

    <!-- Dialog -->
    <ComponentDialog v-model="dialog.show" :side="true" :custom-style="'min-width: 200px; width: 700px; max-width: 900px'"
      title="Voce Fattura" :component-name="InvoiceItemDialog" :component-props="{ item: dialog.data }"
      @close="handleDialogClose" />
  </q-card>
</template>

<script setup>
import { reactive, watch } from 'vue'
import ComponentDialog from '~/components/common/ComponentDialog.vue'
import InvoiceItemDialog from '~/components/invoice-edit/InvoiceItemDialog.vue'

const items = defineModel('items', {
  type: Array,
  required: true
})

// ✅ Emit per aggiornare l'imponibile nel parent
const emit = defineEmits(['update:taxable','auto-save'])

const dialog = reactive({
  show: false,
  data: null,
  index: null
})

const columns = [
  { name: 'code', label: 'Cod. Art.', align: 'left', field: 'code', style: 'width: 120px' },
  { name: 'description', label: 'Descrizione', align: 'left', field: 'description', style: 'min-width: 250px' },
  { name: 'quantity', label: 'Q.', align: 'center', field: 'quantity', style: 'width: 80px' },
  { name: 'unitPrice', label: 'Prezzo Un.', align: 'right', field: 'unitPrice', style: 'width: 120px' },
  { name: 'total', label: 'Totale', align: 'right', field: row => (row.quantity || 0) * (row.unitPrice || 0), style: 'width: 120px' },
  { name: 'actions', label: 'Azioni', align: 'center', style: 'width: 100px' }
]

const formatCurrency = (value) => {
  if (value === null || value === undefined) return '€ 0,00'
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value)
}

const handleAdd = () => {
  dialog.data = { code: '', description: '', quantity: 0, unitPrice: 0 }
  dialog.index = null
  dialog.show = true
}

const handleEdit = (item, index) => {
  dialog.data = { ...item }
  dialog.index = index
  dialog.show = true
}

const handleRemove = (index) => {
  items.value.splice(index, 1)
}

const handleDialogClose = (result) => {
  if (result) {
    if (dialog.index !== null) {
      items.value[dialog.index] = result
    } else {
      items.value.push(result)
    }
  }
  dialog.show = false
}

// ✅ WATCH automatico per calcolare e aggiornare l'imponibile
watch(
  () => items.value,
  () => {
    const totalTaxable = items.value.reduce((sum, item) => {
      return sum + ((item.quantity || 0) * (item.unitPrice || 0))
    }, 0)
    emit('update:taxable', Math.round(totalTaxable * 100) / 100)
    emit('auto-save')
  },
  { deep: true }
)


</script>

<style scoped lang="scss">
.items-card {
  background: $contrast;
}


 

  .header-left-items {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 1;
  }


.items-table {
  :deep(th) {
    font-weight: 600;
    font-size: 12px;
    padding: 6px 8px;
    background: $bg-light;
  }

  :deep(td) {
    font-size: 12px;
    padding: 4px 8px;
  }

  :deep(tbody tr:hover) {
    background-color: rgba($primary, 0.05);
  }
}
</style>

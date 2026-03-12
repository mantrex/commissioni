<template>
  <q-card flat bordered class="items-section">
    <q-card-section class="section-header">
      <div class="header-left">
        <q-icon name="inventory_2" size="20px" />
        <span>Voci Fattura</span>
        <q-chip v-if="items.length > 0" dense color="primary" text-color="white" size="sm" class="q-ml-sm">
          {{ items.length }}
        </q-chip>
      </div>

      <q-btn color="primary" icon="add" label="Aggiungi" unelevated dense @click="emit('addItem')" />
    </q-card-section>

    <q-card-section class="section-content">
      <q-table flat bordered :rows="items" :columns="columns" row-key="_id" class="items-table"
        :rows-per-page-options="[0]" hide-pagination>

        <template v-slot:body-cell-code="props">
          <q-td :props="props">
            {{ props.row.code }}
          </q-td>
        </template>

        <template v-slot:body-cell-description="props">
          <q-td :props="props">
            {{ props.row.description }}
          </q-td>
        </template>

        <template v-slot:body-cell-quantity="props">
          <q-td :props="props" class="text-center">
            {{ props.row.quantity }}
          </q-td>
        </template>

        <template v-slot:body-cell-unitPrice="props">
          <q-td :props="props" class="text-right">
            {{ formatCurrency(props.row.unitPrice) }}
          </q-td>
        </template>

        <template v-slot:body-cell-total="props">
          <q-td :props="props" class="text-right">
            {{ formatCurrency((props.row.quantity || 0) * (props.row.unitPrice || 0)) }}
          </q-td>
        </template>

        <template v-slot:body-cell-actions="props">
          <q-td :props="props" class="text-center">
            <q-btn flat dense round icon="edit" size="sm" color="primary"
              @click="emit('editItem', props.row, props.rowIndex)">
              <q-tooltip>Modifica</q-tooltip>
            </q-btn>
            <q-btn flat dense round icon="delete" size="sm" color="negative"
              @click="emit('removeItem', props.rowIndex)">
              <q-tooltip>Rimuovi</q-tooltip>
            </q-btn>
          </q-td>
        </template>

        <template v-slot:no-data>
          <div class="full-width row flex-center q-gutter-sm q-pa-lg">
            <q-icon size="2em" name="inventory_2" color="grey-5" />
            <span class="text-grey-7">
              Nessuna voce. Clicca "Aggiungi" per inserirne una.
            </span>
          </div>
        </template>
      </q-table>
    </q-card-section>
  </q-card>
</template>

<script setup>
const items = defineModel('items', {
  type: Array,
  default: () => []
})

const emit = defineEmits(['addItem', 'editItem', 'removeItem'])

const columns = [
  {
    name: 'code',
    label: 'Cod. Art.',
    align: 'left',
    field: 'code',
    style: 'width: 120px'
  },
  {
    name: 'description',
    label: 'Descrizione',
    align: 'left',
    field: 'description',
    style: 'min-width: 200px'
  },
  {
    name: 'quantity',
    label: 'Q.',
    align: 'center',
    field: 'quantity',
    style: 'width: 80px'
  },
  {
    name: 'unitPrice',
    label: 'Prezzo Un.',
    align: 'right',
    field: 'unitPrice',
    style: 'width: 100px'
  },
  {
    name: 'total',
    label: 'Totale',
    align: 'right',
    field: row => (row.quantity || 0) * (row.unitPrice || 0),
    style: 'width: 100px'
  },
  {
    name: 'actions',
    label: 'Azioni',
    align: 'center',
    style: 'width: 100px'
  }
]

const formatCurrency = (value) => {
  if (value === null || value === undefined) return '€ 0,00'
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR'
  }).format(value)
}
</script>

<style scoped lang="scss">
.items-section {
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
  padding: 0;
}

.items-table {
  :deep(th) {
    font-weight: 600;
    color: $text-primary;
    background: $bg-light;
  }

  :deep(tbody tr:hover) {
    background-color: rgba($primary, 0.05);
  }
}
</style>
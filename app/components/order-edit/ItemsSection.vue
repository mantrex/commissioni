<template>
  <q-card flat bordered class="items-section">
    <q-card-section class="section-header">
      <div class="header-title">
        <q-icon name="inventory_2" size="20px" />
        <span>Articoli</span>
      </div>
      <q-btn color="primary" icon="add" label="Aggiungi" unelevated dense @click="emit('addItem')" />
    </q-card-section>

    <q-separator />

    <q-card-section class="section-content">
      <q-table flat bordered :rows="localItems" :columns="columns" row-key="_id" class="items-table"
        :rows-per-page-options="[0]" hide-pagination>
        <!-- Colonna Quantità -->
        <template v-slot:body-cell-quantity="props">
          <q-td :props="props">
            <q-input v-model.number="props.row.quantity" type="number" dense borderless min="0"
              class="quantity-input" />
          </q-td>
        </template>

        <!-- Colonna Codice Articolo -->
        <template v-slot:body-cell-code="props">
          <q-td :props="props">
            {{ props.row.productId?.code || props.row.code || '' }}
          </q-td>
        </template>

        <!-- Colonna Descrizione -->
        <template v-slot:body-cell-description="props">
          <q-td :props="props">
            {{ props.row.productId?.name || props.row.description || '' }}
          </q-td>
        </template>

        <!-- Colonna Pronto -->
        <template v-slot:body-cell-ready="props">
          <q-td :props="props" class="text-center">
            <q-checkbox v-model="props.row.ready" dense />
          </q-td>
        </template>

        <!-- Colonna Ordinato -->
        <template v-slot:body-cell-ordered="props">
          <q-td :props="props" class="text-center">
            <q-checkbox v-model="props.row.ordered" dense />
          </q-td>
        </template>

        <!-- Colonna Nota -->
        <template v-slot:body-cell-note="props">
          <q-td :props="props">
            <q-input v-model="props.row.note" dense borderless placeholder="Nota..." class="note-input" />
          </q-td>
        </template>

        <!-- Colonna Fatturato -->
        <template v-slot:body-cell-invoiced="props">
          <q-td :props="props" class="text-center">
            <q-select v-model.number="props.row.invoiced" :options="invoicedOptions" dense borderless
              class="invoiced-select" />
          </q-td>
        </template>

        <!-- Colonna Azioni -->
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

        <!-- Nessun articolo -->
        <template v-slot:no-data>
          <div class="full-width row flex-center q-gutter-sm q-pa-lg">
            <q-icon size="2em" name="inventory_2" color="grey-5" />
            <span class="text-grey-7">
              Nessun articolo. Clicca "Aggiungi" per inserirne uno.
            </span>
          </div>
        </template>
      </q-table>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  items: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:items', 'addItem', 'editItem', 'removeItem'])

const localItems = ref([...props.items])

// Opzioni per campo "Fatturato"
const invoicedOptions = [
  { label: '0', value: 0 },
  { label: '1', value: 1 },
  { label: '2', value: 2 },
  { label: '3', value: 3 }
]

// Colonne tabella
const columns = [
  {
    name: 'quantity',
    label: 'Q.',
    align: 'center',
    field: 'quantity',
    style: 'width: 80px'
  },
  {
    name: 'code',
    label: 'Cod. Art.',
    align: 'left',
    field: row => row.productId?.code || row.code,
    style: 'width: 120px'
  },
  {
    name: 'description',
    label: 'Des. Art.',
    align: 'left',
    field: row => row.productId?.name || row.description,
    style: 'min-width: 200px'
  },
  {
    name: 'ready',
    label: 'Pronto',
    align: 'center',
    field: 'ready',
    style: 'width: 80px'
  },
  {
    name: 'ordered',
    label: 'Ord.',
    align: 'center',
    field: 'ordered',
    style: 'width: 80px'
  },
  {
    name: 'note',
    label: 'Nota',
    align: 'left',
    field: 'note',
    style: 'min-width: 150px'
  },
  {
    name: 'invoiced',
    label: 'F.',
    align: 'center',
    field: 'invoiced',
    style: 'width: 60px'
  },
  {
    name: 'actions',
    label: 'Azioni',
    align: 'center',
    style: 'width: 100px'
  }
]

// Watch
watch(() => props.items, (newVal) => {
  localItems.value = [...newVal]
}, { deep: true })

watch(localItems, (newVal) => {
  emit('update:items', newVal)
}, { deep: true })
</script>

<style scoped lang="scss">
.items-section {
  background: $contrast;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: $bg-light;

  .header-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
    color: $text-primary;
  }
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

.quantity-input {
  max-width: 70px;

  :deep(input) {
    text-align: center;
  }
}

.note-input {
  :deep(input) {
    font-size: 13px;
  }
}

.invoiced-select {
  max-width: 50px;
}
</style>
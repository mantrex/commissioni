<template>
  <q-card flat bordered class="items-section">
    <q-card-section class="section-header">
      <div class="header-left">
        <q-btn flat dense round :icon="collapsed ? 'expand_more' : 'expand_less'" size="sm"
          @click="collapsed = !collapsed" class="collapse-btn">
          <q-tooltip>{{ collapsed ? 'Espandi' : 'Comprimi' }}</q-tooltip>
        </q-btn>

        <q-icon name="inventory_2" size="20px" />
        <span>Articoli</span>
        <q-chip v-if="localItems.length > 0" dense color="primary" text-color="white" size="sm" class="q-ml-sm">
          {{ localItems.length }}
        </q-chip>
      </div>

      <q-btn color="primary" icon="add" label="Aggiungi" unelevated dense @click="emit('addItem')" />
    </q-card-section>

    <q-slide-transition>
      <q-card-section v-show="!collapsed" class="section-content">
        <q-table flat bordered :rows="localItems" :columns="columns" row-key="_id" class="items-table"
          :rows-per-page-options="[0]" hide-pagination>

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

          <!-- Colonna Quantità -->
          <template v-slot:body-cell-quantity="props">
            <q-td :props="props">
              {{ props.row.quantity }}
            </q-td>
          </template>

          <!-- Colonna Pronto -->
          <template v-slot:body-cell-ready="props">
            <q-td :props="props" class="text-center">
              <q-icon v-if="props.row.ready" name="check_circle" color="positive" size="sm" />
              <q-icon v-else name="cancel" color="grey-5" size="sm" />
            </q-td>
          </template>

          <!-- Colonna Ordinato -->
          <template v-slot:body-cell-ordered="props">
            <q-td :props="props" class="text-center">
              <q-icon v-if="props.row.ordered" name="check_circle" color="positive" size="sm" />
              <q-icon v-else name="cancel" color="grey-5" size="sm" />
            </q-td>
          </template>

          <!-- Colonna Fatturato -->
          <template v-slot:body-cell-invoiced="props">
            <q-td :props="props" class="text-center">
              {{ props.row.invoiced || 0 }}
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
    </q-slide-transition>
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

const collapsed = ref(false)
const localItems = ref([])
const isUpdating = ref(false)

// Colonne tabella
const columns = [
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
    name: 'quantity',
    label: 'Q.',
    align: 'center',
    field: 'quantity',
    style: 'width: 80px'
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

// ✅ Watch sicuro: props -> local (riceve dati da parent)
watch(() => props.items, (newVal) => {
  if (!isUpdating.value && newVal) {
    console.log('📦 ItemsSection riceve items:', newVal.length)
    localItems.value = [...newVal]
  }
}, { deep: true, immediate: true })

// ✅ Watch sicuro: local -> emit (invia modifiche a parent)
watch(localItems, (newVal) => {
  if (!isUpdating.value) {
    isUpdating.value = true
    emit('update:items', newVal)
    setTimeout(() => {
      isUpdating.value = false
    }, 50)
  }
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

  .header-left {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
    color: $text-primary;
  }

  .collapse-btn {
    margin-right: 4px;
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
</style>
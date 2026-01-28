<template>
  <q-card flat bordered class="packing-section">
    <q-card-section class="section-header">
      <div class="header-left">
        <q-icon name="inventory" size="20px" />
        <span>Imballo e Pacchi</span>
      </div>
    </q-card-section>

    <q-card-section class="section-content">
      <!-- Dati imballo -->
      <div class="subsection">
        <div class="subsection-title">Dati Imballo</div>
        <div class="row q-col-gutter-sm">
          <div class="col-12 col-md-6">
            <q-input v-model="packing.made" label="Made" outlined dense />
          </div>
          <div class="col-12 col-md-6">
            <q-input v-model="packing.whoMakes" label="Chi Fa" outlined dense />
          </div>
          <div class="col-12 col-md-4">
            <q-input v-model.number="packing.numPackages" label="Num Pacchi" type="number" outlined dense />
          </div>
          <div class="col-12 col-md-4">
            <q-input v-model="packing.packageSize" label="Mis Pacchi" outlined dense />
          </div>
          <div class="col-12 col-md-4">
            <q-input v-model="packing.conai" label="Conai" outlined dense />
          </div>
          <div class="col-12 col-md-6">
            <q-input v-model.number="packing.grossWeight" label="Peso Lordo" type="number" outlined dense step="0.01" />
          </div>
          <div class="col-12 col-md-6">
            <q-input v-model.number="packing.netWeight" label="Peso Netto" type="number" outlined dense step="0.01" />
          </div>
        </div>
      </div>

      <q-separator class="q-my-md" />

      <!-- Lista Pacchi -->
      <div class="subsection">
        <div class="subsection-header">
          <div class="subsection-title">Pacchi</div>
          <q-btn color="primary" icon="add" label="Aggiungi Pacco" unelevated dense size="sm"
            @click="emit('addPackage')" />
        </div>

        <q-table v-if="packages.length > 0" flat bordered :rows="packages" :columns="packageColumns" row-key="_id"
          class="packages-table" :rows-per-page-options="[0]" hide-pagination>

          <template v-slot:body-cell-size="props">
            <q-td :props="props">
              {{ props.row.size1 }} x {{ props.row.size2 }} x {{ props.row.size3 }}
            </q-td>
          </template>

          <template v-slot:body-cell-grossWeight="props">
            <q-td :props="props" class="text-right">
              {{ props.row.grossWeight }}
            </q-td>
          </template>

          <template v-slot:body-cell-netWeight="props">
            <q-td :props="props" class="text-right">
              {{ props.row.netWeight }}
            </q-td>
          </template>

          <template v-slot:body-cell-actions="props">
            <q-td :props="props" class="text-center">
              <q-btn flat dense round icon="edit" size="sm" color="primary"
                @click="emit('editPackage', props.row, props.rowIndex)">
                <q-tooltip>Modifica</q-tooltip>
              </q-btn>
              <q-btn flat dense round icon="delete" size="sm" color="negative"
                @click="emit('removePackage', props.rowIndex)">
                <q-tooltip>Rimuovi</q-tooltip>
              </q-btn>
            </q-td>
          </template>
        </q-table>

        <div v-else class="no-packages">
          <q-icon name="inventory" size="48px" color="grey-5" />
          <span class="text-grey-7">Nessun pacco inserito</span>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
const packing = defineModel('packing', {
  type: Object,
  required: true
})

const packages = defineModel('packages', {
  type: Array,
  default: () => []
})

const emit = defineEmits(['addPackage', 'editPackage', 'removePackage'])

const packageColumns = [
  {
    name: 'size',
    label: 'Misure (cm)',
    align: 'left',
    field: row => `${row.size1} x ${row.size2} x ${row.size3}`
  },
  {
    name: 'grossWeight',
    label: 'Peso Lordo',
    align: 'right',
    field: 'grossWeight'
  },
  {
    name: 'netWeight',
    label: 'Peso Netto',
    align: 'right',
    field: 'netWeight'
  },
  {
    name: 'actions',
    label: 'Azioni',
    align: 'center',
    style: 'width: 100px'
  }
]
</script>

<style scoped lang="scss">
.packing-section {
  background: $contrast;
}

.section-header {
  padding: 12px 16px;
  background: $bg-light;

  .header-left {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
    color: $text-primary;
  }
}

.section-content {
  padding: 16px;
}

.subsection {
  .subsection-title {
    font-weight: 600;
    color: $text-primary;
    margin-bottom: 12px;
    font-size: 14px;
  }

  .subsection-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }
}

.packages-table {
  :deep(th) {
    font-weight: 600;
    color: $text-primary;
    background: $bg-light;
  }
}

.no-packages {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 32px;
  background: $bg-light;
  border-radius: 4px;
}
</style>
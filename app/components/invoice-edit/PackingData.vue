<template>
  <q-card flat bordered class="packing-card">
    <q-card-section class="section-header">
      <q-icon name="inventory" size="18px" />
      <span>Imballo e Pacchi</span>
    </q-card-section>
    <q-card-section class="compact-section">
      <!--
      <div class="compact-grid">
        <q-input v-model="packing.made" label="Made" outlined dense />
        <q-input v-model="packing.whoMakes" label="Chi Fa" outlined dense />
        <q-input v-model.number="packing.numPackages" label="N.Pacchi" type="number" outlined dense />
        <q-input v-model="packing.packageSize" label="Mis" outlined dense />
        <q-input v-model.number="packing.grossWeight" label="P.Lordo" type="number" outlined dense step="0.01" />
        <q-input v-model.number="packing.netWeight" label="P.Netto" type="number" outlined dense step="0.01" />
        <q-input v-model="packing.conai" label="Conai" outlined dense class="span-2" />
      </div>-->

      <!-- Lista Pacchi -->
      <div class="packages-list q-mt-sm" v-if="packages.length > 0">
        <div class="packages-header">
          <span class="text-caption text-weight-medium">Pacchi ({{ packages.length }})</span>
          <q-btn flat dense size="sm" icon="add" color="primary" @click="handleAdd">
            <q-tooltip>Aggiungi pacco</q-tooltip>
          </q-btn>
        </div>
        <div class="package-item" v-for="(pkg, index) in packages" :key="index">
          <span class="text-caption">{{ pkg.size1 }}x{{ pkg.size2 }}x{{ pkg.size3 }} cm - {{ pkg.grossWeight }}kg</span>
          <div>
            <q-btn flat dense size="xs" round icon="edit" @click="handleEdit(pkg, index)" />
            <q-btn flat dense size="xs" round icon="delete" color="negative" @click="handleRemove(index)" />
          </div>
        </div>
      </div>
      <q-btn v-else flat dense size="sm" icon="add" label="Aggiungi pacco" color="primary" @click="handleAdd"
        class="full-width q-mt-sm" />
    </q-card-section>

    <!-- Dialog -->
    <ComponentDialog v-model="dialog.show" :side="true" :custom-style="'min-width: 200px; width: 600px; max-width: 800px'"
      title="Dati Pacco" :component-name="PackageDialog" :component-props="{ package: dialog.data }"
      @close="handleDialogClose" />
  </q-card>
</template>

<script setup>
import { reactive } from 'vue'
import ComponentDialog from '~/components/common/ComponentDialog.vue'
import PackageDialog from '~/components/invoice-edit/PackageDialog.vue'

const packing = defineModel('packing', {
  type: Object,
  required: true
})

const packages = defineModel('packages', {
  type: Array,
  required: true
})

const dialog = reactive({
  show: false,
  data: null,
  index: null
})

const handleAdd = () => {
  dialog.data = { size1: 0, size2: 0, size3: 0, grossWeight: 0, netWeight: 0 }
  dialog.index = null
  dialog.show = true
}

const handleEdit = (pkg, index) => {
  dialog.data = { ...pkg }
  dialog.index = index
  dialog.show = true
}

const handleRemove = (index) => {
  packages.value.splice(index, 1)
}

const handleDialogClose = (result) => {
  if (result) {
    if (dialog.index !== null) {
      packages.value[dialog.index] = result
    } else {
      packages.value.push(result)
    }
  }
  dialog.show = false
}
</script>

<style scoped lang="scss">
@use "sass:color";

.packing-card {
  background: $contrast;
}

.section-header {
  padding: 6px 12px !important;
  background: $bg-light;
  border-bottom: 1px solid $border;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 13px;
  color: $text-primary;
  min-height: 32px;
}

.compact-section {
  padding: 8px !important;
}

.compact-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 6px;

  .span-2 {
    grid-column: span 2;
  }

  :deep(.q-field) {
    margin-bottom: 0;
  }

  :deep(.q-field__control) {
    min-height: 40px;
  }

  :deep(.q-field__label) {
    font-size: 12px;
  }

  :deep(input) {
    font-size: 12px;
  }
}

.packages-list {

  padding-top: 8px;

  .packages-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 4px;
  }

  .package-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 4px 8px;
    background: $bg-light;
    border-radius: 4px;
    margin-bottom: 4px;

    &:hover {
      background: color.adjust($bg-light, $lightness: -5%);
    }
  }
}
</style>

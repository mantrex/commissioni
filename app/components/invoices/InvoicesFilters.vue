<template>
  <q-card flat bordered class="filters-card">
    <q-card-section class="filters-section">
      <div class="row q-col-gutter-sm">
        <!-- Ricerca Fattura -->
        <div class="col-12 col-md-3">
          <q-input v-model="localFilters.invoiceId" outlined dense label="Cerca Fattura" clearable
            @update:model-value="emit('search')">
            <template v-slot:prepend>
              <q-icon name="receipt" />
            </template>
          </q-input>
        </div>

        <!-- Ricerca Nome/Cognome Intestatario -->
        <div class="col-12 col-md-3">
          <q-input v-model="localFilters.clientName" outlined dense label="Intestatario" clearable
            @update:model-value="emit('search')">
            <template v-slot:prepend>
              <q-icon name="person" />
            </template>
          </q-input>
        </div>

        <!-- Ricerca Commissione -->
        <div class="col-12 col-md-2">
          <q-input v-model="localFilters.commNum" outlined dense label="Codice Comm." clearable
            @update:model-value="emit('search')">
            <template v-slot:prepend>
              <q-icon name="tag" />
            </template>
          </q-input>
        </div>

        <!-- Stato Emissione -->
        <div class="col-12 col-md-2">
          <q-select v-model="localFilters.issued" :options="issuedOptions" label="Stato" option-label="label"
            option-value="value" emit-value map-options outlined dense clearable @update:model-value="emit('search')">
            <template v-slot:prepend>
              <q-icon name="check_circle" />
            </template>
          </q-select>
        </div>

        <!-- Reset -->
        <div class="col-12 col-md-2">
          <q-btn flat color="negative" icon="clear" label="Reset" @click="emit('reset')" class="full-width" />
        </div>
      </div>

      <!-- Filtri Avanzati (Espandibile) -->
      <div v-if="showAdvanced" class="row q-col-gutter-sm q-mt-sm">
        <div class="col-12 col-md-3">
          <q-input v-model="localFilters.dateFrom" outlined dense label="Data Da" type="date"
            @update:model-value="emit('search')">
            <template v-slot:prepend>
              <q-icon name="event" />
            </template>
          </q-input>
        </div>

        <div class="col-12 col-md-3">
          <q-input v-model="localFilters.dateTo" outlined dense label="Data A" type="date"
            @update:model-value="emit('search')">
            <template v-slot:prepend>
              <q-icon name="event" />
            </template>
          </q-input>
        </div>
      </div>

      <!-- Info risultati -->
      <div class="row q-mt-sm">
        <div class="col-12">
          <q-chip v-if="totalInvoices > 0" color="primary" text-color="white" icon="info">
            {{ totalInvoices }} fatture trovate
          </q-chip>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  filters: {
    type: Object,
    required: true
  },
  showAdvanced: {
    type: Boolean,
    default: false
  },
  totalInvoices: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['update:filters', 'update:showAdvanced', 'search', 'reset'])

const localFilters = computed({
  get: () => props.filters,
  set: (val) => emit('update:filters', val)
})

const issuedOptions = [
  { label: 'Emesse', value: true },
  { label: 'Non Emesse', value: false }
]
</script>

<style scoped lang="scss">
.filters-card {
  background: $contrast;
  border-radius: 8px;
}

.filters-section {
  padding: 12px !important;
}
</style>
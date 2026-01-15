<template>
  <div class="filters-container">
    <q-card flat bordered class="filters-card">
      <!-- Filtri base sempre visibili -->
      <q-card-section class="q-pa-md">
        <div class="row q-col-gutter-md items-center">
          <!-- Ricerca numero commissione -->
          <div class="col-12 col-md-3">
            <q-input v-model="localFilters.commNum" outlined dense label="Num Commissione"
              placeholder="Cerca per numero..." clearable @keyup.enter="emit('search')">
              <template v-slot:prepend>
                <q-icon name="search" />
              </template>
            </q-input>
          </div>

          <!-- Filtro scadenza -->
          <div class="col-12 col-md-3">
            <q-select v-model="localFilters.expiredFilter" outlined dense :options="expiredOptions"
              label="Filtra per scadenza" emit-value map-options>
              <template v-slot:prepend>
                <q-icon name="event" />
              </template>
            </q-select>
          </div>

          <!-- Giorni personalizzati (se custom) -->
          <div class="col-12 col-md-2" v-if="localFilters.expiredFilter === 'custom'">
            <q-input v-model.number="localFilters.customDays" outlined dense type="number" label="Giorni" min="0">
              <template v-slot:append>
                gg
              </template>
            </q-input>
          </div>

          <!-- Pulsanti azione -->
          <div class="col-12 col-md-4 row q-gutter-sm justify-end">
            <q-btn color="primary" icon="search" label="Cerca" unelevated @click="emit('search')" />

            <q-btn flat color="secondary" :icon="showAdvanced ? 'expand_less' : 'expand_more'"
              :label="showAdvanced ? 'Meno filtri' : 'Ricerca avanzata'"
              @click="emit('update:showAdvanced', !showAdvanced)" />

            <q-btn flat color="negative" icon="clear" label="Reset" @click="emit('reset')" />
          </div>
        </div>

        <!-- Info risultati -->
        <div class="row q-mt-sm" v-if="totalOrders > 0">
          <div class="col-12">
            <q-chip color="primary" text-color="white" icon="info">
              {{ totalOrders }} {{ totalOrders === 1 ? 'ordine trovato' : 'ordini trovati' }}
            </q-chip>
          </div>
        </div>
      </q-card-section>

      <!-- Filtri avanzati collassabili -->
      <q-slide-transition>
        <div v-show="showAdvanced">
          <q-separator />
          <q-card-section class="q-pa-md bg-grey-1">
            <div class="text-subtitle2 q-mb-md">
              <q-icon name="tune" class="q-mr-sm" />
              Filtri avanzati
            </div>

            <div class="row q-col-gutter-md">
              <!-- Cliente -->
              <div class="col-12">
                <div class="text-caption text-grey-7 q-mb-sm">Cliente</div>
                <div class="row q-col-gutter-sm">
                  <div class="col-12 col-md-3">
                    <q-input v-model="localFilters.clientLastname" outlined dense label="Cognome" clearable />
                  </div>
                  <div class="col-12 col-md-3">
                    <q-input v-model="localFilters.clientFirstname" outlined dense label="Nome" clearable />
                  </div>
                  <div class="col-12 col-md-2">
                    <q-input v-model="localFilters.clientCity" outlined dense label="Città" clearable />
                  </div>
                  <div class="col-12 col-md-2">
                    <q-input v-model="localFilters.clientCountry" outlined dense label="Paese" clearable />
                  </div>
                  <div class="col-12 col-md-2">
                    <q-select v-model="localFilters.clientVip" outlined dense :options="vipOptions" label="VIP"
                      emit-value map-options clearable />
                  </div>
                </div>
              </div>

              <!-- Agente -->
              <div class="col-12 col-md-4">
                <q-select v-model="localFilters.agentId" outlined dense :options="agentOptions" label="Agente"
                  option-label="label" option-value="value" emit-value map-options clearable use-input
                  @filter="filterAgents">
                  <template v-slot:prepend>
                    <q-icon name="person" />
                  </template>
                </q-select>
              </div>

              <!-- Articolo/Prodotto -->
              <div class="col-12 col-md-4">
                <q-input v-model="localFilters.productCode" outlined dense label="Codice Articolo" clearable>
                  <template v-slot:prepend>
                    <q-icon name="inventory_2" />
                  </template>
                </q-input>
              </div>

              <!-- Stato (Posizione) -->
              <div class="col-12 col-md-4">
                <q-select v-model="localFilters.status" outlined dense :options="statusOptions" label="Posizione"
                  option-label="label" option-value="value" emit-value map-options clearable use-input
                  @filter="filterStatuses">
                  <template v-slot:prepend>
                    <q-icon name="flag" />
                  </template>
                </q-select>
              </div>

              <!-- Date commissione -->
              <div class="col-12 col-md-6">
                <div class="text-caption text-grey-7 q-mb-sm">Data Commissione</div>
                <div class="row q-col-gutter-sm">
                  <div class="col-6">
                    <q-input v-model="localFilters.dateFrom" outlined dense label="Dal" type="date" clearable>
                      <template v-slot:prepend>
                        <q-icon name="event" />
                      </template>
                    </q-input>
                  </div>
                  <div class="col-6">
                    <q-input v-model="localFilters.dateTo" outlined dense label="Al" type="date" clearable>
                      <template v-slot:prepend>
                        <q-icon name="event" />
                      </template>
                    </q-input>
                  </div>
                </div>
              </div>

              <!-- Date scadenza -->
              <div class="col-12 col-md-6">
                <div class="text-caption text-grey-7 q-mb-sm">Data Scadenza</div>
                <div class="row q-col-gutter-sm">
                  <div class="col-6">
                    <q-input v-model="localFilters.dueDateFrom" outlined dense label="Dal" type="date" clearable>
                      <template v-slot:prepend>
                        <q-icon name="event" />
                      </template>
                    </q-input>
                  </div>
                  <div class="col-6">
                    <q-input v-model="localFilters.dueDateTo" outlined dense label="Al" type="date" clearable>
                      <template v-slot:prepend>
                        <q-icon name="event" />
                      </template>
                    </q-input>
                  </div>
                </div>
              </div>
            </div>
          </q-card-section>
        </div>
      </q-slide-transition>
    </q-card>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
const { statuses: allStatuses, loadStatuses } = useStatuses()
const statusOptions = ref([])


// Props
const props = defineProps({
  filters: {
    type: Object,
    required: true
  },
  showAdvanced: {
    type: Boolean,
    default: false
  },
  totalOrders: {
    type: Number,
    default: 0
  }
})

// Emits
const emit = defineEmits(['update:filters', 'update:showAdvanced', 'search', 'reset'])

// Local state
const localFilters = computed({
  get: () => props.filters,
  set: (val) => emit('update:filters', val)
})

const showAdvanced = computed({
  get: () => props.showAdvanced,
  set: (val) => emit('update:showAdvanced', val)
})

// Config
const config = useRuntimeConfig()
const defaultExpiredDays = config.public.expiredDays || 30

// Options
const expiredOptions = [
  { label: `Scaduti (${defaultExpiredDays} giorni)`, value: 'expired' },
  { label: 'Tutti', value: 'all' },
  { label: 'Non scaduti', value: 'notExpired' },
  { label: 'Scaduti personalizzati', value: 'custom' }
]

const vipOptions = [
  { label: 'Tutti', value: null },
  { label: 'Solo VIP', value: true },
  { label: 'Solo non VIP', value: false }
]



const filterStatuses = (val, update) => {
  if (val === '') {
    update(() => {
      statusOptions.value = allStatuses.value
    })
    return
  }

  update(() => {
    const needle = val.toLowerCase()
    statusOptions.value = allStatuses.value.filter(
      s => s.label.toLowerCase().indexOf(needle) > -1
    )
  })
}


onMounted(async () => {
  await loadStatuses()
  statusOptions.value = allStatuses.value
})

</script>
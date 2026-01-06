<template>
  <q-card flat bordered class="client-section">
    <q-card-section class="section-header">
      <div class="header-title">
        <q-icon name="person" size="20px" />
        <span>Cliente</span>
        <q-checkbox v-model="localClient.vip" label="VIP" dense class="q-ml-md" />
      </div>
      <q-btn flat dense round icon="edit" color="primary" @click="emit('editClient')">
        <q-tooltip>Modifica Cliente</q-tooltip>
      </q-btn>
    </q-card-section>

    <q-separator />

    <q-card-section class="section-content">
      <!-- Autocomplete Cliente -->
      <div class="client-autocomplete">
        <q-select v-model="selectedClientOption" :options="clientOptions" option-label="label" option-value="value"
          label="Cerca o aggiungi cliente" outlined dense use-input clearable @filter="filterClients"
          @update:model-value="handleClientSelect">
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>

          <template v-slot:option="scope">
            <q-item v-bind="scope.itemProps">
              <q-item-section avatar v-if="scope.opt.isNew">
                <q-icon name="add_circle" color="primary" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ scope.opt.label }}</q-item-label>
                <q-item-label caption v-if="scope.opt.caption">
                  {{ scope.opt.caption }}
                </q-item-label>
              </q-item-section>
            </q-item>
          </template>
        </q-select>
      </div>

      <!-- Dati Cliente (read-only quando selezionato) -->
      <div class="client-data" v-if="localClient._id || showEmptyForm">
        <div class="row q-col-gutter-sm">
          <div class="col-6">
            <q-input v-model="localClient.lastname" label="Cognome" outlined dense readonly />
          </div>
          <div class="col-6">
            <q-input v-model="localClient.firstname" label="Nome" outlined dense readonly />
          </div>
        </div>

        <q-input v-model="localClient.address" label="Indirizzo" outlined dense readonly class="q-mt-sm" />

        <div class="row q-col-gutter-sm q-mt-sm">
          <div class="col-4">
            <q-input v-model="localClient.cap" label="CAP" outlined dense readonly />
          </div>
          <div class="col-8">
            <q-input v-model="localClient.city" label="Città" outlined dense readonly />
          </div>
        </div>

        <div class="row q-col-gutter-sm q-mt-sm">
          <div class="col-6">
            <q-input v-model="localClient.state" label="Paese" outlined dense readonly />
          </div>
          <div class="col-6">
            <q-input v-model="localClient.tel" label="Telefono" outlined dense readonly />
          </div>
        </div>

        <div class="row q-col-gutter-sm q-mt-sm">
          <div class="col-6">
            <q-input v-model="localClient.email" label="Email" outlined dense readonly />
          </div>
          <div class="col-6">
            <q-input v-model="localClient.piva" label="P.IVA" outlined dense readonly />
          </div>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  client: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:client', 'editClient'])

const localClient = ref(props.client || {})
const selectedClientOption = ref(null)
const allClients = ref([])
const clientOptions = ref([])
const showEmptyForm = ref(false)

// Carica lista clienti
const loadClients = async () => {
  try {
    const { data } = await useFetch('/api/clients')
    if (data.value) {
      allClients.value = data.value.clients.map(c => ({
        label: `${c.lastname || ''} ${c.firstname || ''}`.trim() || c.company || 'N/A',
        caption: c.city && c.state ? `${c.city}, ${c.state}` : (c.city || c.state || ''),
        value: c._id,
        client: c,
        isNew: false
      }))

      clientOptions.value = [
        { label: '➕ Crea nuovo cliente', value: 'new', isNew: true },
        ...allClients.value
      ]
    }
  } catch (err) {
    console.error('Errore caricamento clienti:', err)
  }
}

// Filtra clienti
const filterClients = (val, update) => {
  if (val === '') {
    update(() => {
      clientOptions.value = [
        { label: '➕ Crea nuovo cliente', value: 'new', isNew: true },
        ...allClients.value
      ]
    })
    return
  }

  update(() => {
    const needle = val.toLowerCase()
    const filtered = allClients.value.filter(
      c => c.label.toLowerCase().indexOf(needle) > -1 ||
        (c.caption && c.caption.toLowerCase().indexOf(needle) > -1)
    )
    clientOptions.value = [
      { label: '➕ Crea nuovo cliente', value: 'new', isNew: true },
      ...filtered
    ]
  })
}

// Gestisce selezione cliente
const handleClientSelect = (option) => {
  if (!option) {
    localClient.value = {}
    showEmptyForm.value = false
    return
  }

  if (option.isNew) {
    // Crea nuovo cliente
    emit('editClient')
    selectedClientOption.value = null
  } else {
    // Carica cliente esistente
    localClient.value = { ...option.client }
    showEmptyForm.value = false
  }
}

// Watch per sincronizzare con parent
watch(() => props.client, (newVal) => {
  if (newVal) {
    localClient.value = { ...newVal }
  }
}, { deep: true })

watch(localClient, (newVal) => {
  emit('update:client', newVal)
}, { deep: true })

// Load on mount
loadClients()
</script>

<style scoped lang="scss">
.client-section {
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
  padding: 16px;
}

.client-autocomplete {
  margin-bottom: 16px;
}

.client-data {
  padding: 16px;
  background: $bg-light;
  border-radius: 8px;
}
</style>
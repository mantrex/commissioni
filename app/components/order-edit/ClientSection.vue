<template>
  <div class="client-section-content">
    <!-- Header interno solo con VIP e pulsante modifica -->
    <div class="client-mini-header">
      <div class="header-left">
        <q-icon name="person" size="18px" />
        <span class="section-label">Cliente</span>
        <q-checkbox v-model="localClient.vip" label="VIP" dense class="q-ml-sm" />
      </div>
      <q-btn flat dense round icon="edit" size="sm" color="primary" @click="emit('editClient')">
        <q-tooltip>Modifica Cliente</q-tooltip>
      </q-btn>
    </div>

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

      <!-- Campo Ditta -->
      <q-input v-model="localClient.company" label="Ditta" outlined dense readonly class="q-mt-sm" />

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
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  client: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:client', 'editClient'])

// ✅ FIX: Usa computed con getter/setter invece di ref + watch
const localClient = computed({
  get: () => props.client || {},
  set: (val) => emit('update:client', val)
})

const selectedClientOption = ref(null)
const allClients = ref([])
const clientOptions = ref([])
const showEmptyForm = ref(false)

// Carica lista clienti
const loadClients = async () => {
  try {
    const { data } = await useFetch('/api/clients')
    if (data.value) {
      allClients.value = data.value.clients.map(c => {
        let label = ''
        const fullName = `${c.lastname || ''} ${c.firstname || ''}`.trim()

        if (fullName) {
          label = fullName
        } else if (c.company) {
          label = c.company
        } else {
          label = 'N/A'
        }

        return {
          label,
          caption: c.city && c.state ? `${c.city}, ${c.state}` : (c.city || c.state || ''),
          value: c._id,
          client: c,
          isNew: false
        }
      })

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
        (c.caption && c.caption.toLowerCase().indexOf(needle) > -1) ||
        (c.client.company && c.client.company.toLowerCase().indexOf(needle) > -1)
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
    emit('editClient')
    selectedClientOption.value = null
  } else {
    localClient.value = { ...option.client }
    showEmptyForm.value = false
  }
}

// Load on mount
loadClients()
</script>

<style scoped lang="scss">
.client-section-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.client-mini-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: rgba($primary, 0.05);
  border-radius: 4px;

  .header-left {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .section-label {
    font-weight: 600;
    color: $text-primary;
    font-size: 14px;
  }
}

.client-autocomplete {
  // nessuno stile particolare
}

.client-data {
  padding: 12px;
  background: $bg-light;
  border-radius: 4px;
}
</style>
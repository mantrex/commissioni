<template>
  <div class="client-dialog-content">
    <q-form @submit.prevent="handleSave" class="client-form">
      <!-- Autocomplete per selezionare cliente esistente o nuovo -->
      <div class="form-section">
        <div class="section-title">Seleziona Cliente</div>
        <q-select v-model="selectedClientOption" :options="clientOptions" option-label="label" option-value="value"
          label="Cerca cliente esistente" outlined dense use-input clearable @filter="filterClients"
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

      <q-separator class="q-my-md" />

      <!-- Form dati cliente -->
      <div class="form-section">
        <div class="section-title">Dati Anagrafici</div>

        <!-- FIX: Cognome e Nome non più obbligatori -->
        <div class="row q-col-gutter-sm">
          <div class="col-12 col-sm-6">
            <q-input v-model="localClient.lastname" label="Cognome" outlined dense />
          </div>
          <div class="col-12 col-sm-6">
            <q-input v-model="localClient.firstname" label="Nome" outlined dense />
          </div>
        </div>

        <q-input v-model="localClient.company" label="Ditta" outlined dense class="q-mt-sm" />

        <div class="q-mt-sm">
          <q-checkbox v-model="localClient.vip" label="Cliente VIP" dense />
        </div>
      </div>

      <q-separator class="q-my-md" />

      <!-- Indirizzo -->
      <div class="form-section">
        <div class="section-title">Indirizzo</div>

        <q-input v-model="localClient.address" label="Indirizzo" outlined dense />

        <div class="row q-col-gutter-sm q-mt-sm">
          <div class="col-12 col-sm-4">
            <q-input v-model="localClient.cap" label="CAP" outlined dense />
          </div>
          <div class="col-12 col-sm-8">
            <q-input v-model="localClient.city" label="Città" outlined dense />
          </div>
        </div>

        <div class="row q-col-gutter-sm q-mt-sm">
          <div class="col-12 col-sm-6">
            <q-input v-model="localClient.region" label="Provincia" outlined dense />
          </div>
          <div class="col-12 col-sm-6">
            <q-input v-model="localClient.state" label="Paese" outlined dense />
          </div>
        </div>
      </div>

      <q-separator class="q-my-md" />

      <!-- Contatti -->
      <div class="form-section">
        <div class="section-title">Contatti</div>

        <div class="row q-col-gutter-sm">
          <div class="col-12 col-sm-6">
            <q-input v-model="localClient.tel" label="Telefono" outlined dense />
          </div>
          <div class="col-12 col-sm-6">
            <q-input v-model="localClient.fax" label="Fax" outlined dense />
          </div>
        </div>

        <q-input v-model="localClient.email" label="Email" type="email" outlined dense class="q-mt-sm" />

        <q-input v-model="localClient.piva" label="P.IVA" outlined dense class="q-mt-sm" />
      </div>

      <!-- Azioni -->
      <div class="form-actions">
        <q-btn flat label="Annulla" color="negative" @click="emit('close')" />
        <q-btn type="submit" label="Salva" color="primary" unelevated :loading="saving" />
      </div>
    </q-form>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useQuasar } from 'quasar'

const props = defineProps({
  client: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['close'])

const $q = useQuasar()
const saving = ref(false)
const localClient = ref({ ...props.client })
const selectedClientOption = ref(null)
const allClients = ref([])
const clientOptions = ref([])

// Carica lista clienti
const loadClients = async () => {
  try {
    const { data } = await $fetch('/api/clients')
    if (data) {
      allClients.value = data.clients.map(c => {
        // Costruisci label: priorità a cognome+nome, poi ditta, poi "N/A"
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
    return
  }

  if (option.isNew) {
    // Nuovo cliente - pulisce form
    localClient.value = {}
    selectedClientOption.value = null
  } else {
    // Carica cliente esistente
    localClient.value = { ...option.client }
  }
}

// FIX: Validazione - almeno cognome O ditta devono essere presenti
const handleSave = async () => {
  const hasLastname = localClient.value.lastname && localClient.value.lastname.trim()
  const hasCompany = localClient.value.company && localClient.value.company.trim()

  if (!hasLastname && !hasCompany) {
    $q.notify({
      type: 'negative',
      message: 'Inserisci almeno il cognome o la ditta'
    })
    return
  }

  saving.value = true

  try {
    const endpoint = localClient.value._id
      ? `/api/clients/${localClient.value._id}`
      : '/api/clients'
    const method = localClient.value._id ? 'PUT' : 'POST'

    const { data, error } = await $fetch(endpoint, {
      method,
      body: localClient.value
    })

    if (error) {
      throw new Error(error.message)
    }

    $q.notify({
      type: 'positive',
      message: 'Cliente salvato con successo'
    })

    emit('close', data.client)

  } catch (err) {
    $q.notify({
      type: 'negative',
      message: 'Errore nel salvataggio',
      caption: err.message
    })
  } finally {
    saving.value = false
  }
}

// Load on mount
loadClients()
</script>

<style scoped lang="scss">
.client-dialog-content {
  padding: 16px;
}

.client-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-section {
  .section-title {
    font-weight: 600;
    color: $text-primary;
    margin-bottom: 12px;
    font-size: 15px;
  }
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 16px;
  margin-top: 16px;
  border-top: 1px solid $border;
}
</style>
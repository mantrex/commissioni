<template>
  <div class="agent-dialog-content">
    <q-form @submit.prevent="handleSave" class="agent-form">
      <!-- Autocomplete per selezionare agente esistente o nuovo -->
      <div class="form-section">
        <div class="section-title">Seleziona Agente</div>
        <q-select v-model="selectedAgentOption" :options="agentOptions" option-label="label" option-value="value"
          label="Cerca agente esistente" outlined dense use-input clearable @filter="filterAgents"
          @update:model-value="handleAgentSelect">
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
              </q-item-section>
            </q-item>
          </template>
        </q-select>
      </div>

      <q-separator class="q-my-md" />

      <!-- Form dati agente -->
      <div class="form-section">
        <div class="section-title">Dati Agente</div>

        <div class="row q-col-gutter-sm">
          <div class="col-12 col-sm-6">
            <q-input v-model="localAgent.lastname" label="Cognome *" outlined dense
              :rules="[val => !!val || 'Campo obbligatorio']" />
          </div>
          <div class="col-12 col-sm-6">
            <q-input v-model="localAgent.firstname" label="Nome" outlined dense />
          </div>
        </div>
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
import { ref } from 'vue'
import { useQuasar } from 'quasar'

const props = defineProps({
  agent: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['close'])

const $q = useQuasar()
const saving = ref(false)
const localAgent = ref({ ...props.agent })
const selectedAgentOption = ref(null)
const allAgents = ref([])
const agentOptions = ref([])

// Carica lista agenti
const loadAgents = async () => {
  try {
    const { data } = await $fetch('/api/agents')
    if (data) {
      allAgents.value = data.agents.map(a => ({
        label: a.label,
        value: a.value,
        agent: { _id: a.value, lastname: a.label.split(' ')[0], firstname: a.label.split(' ')[1] || '' },
        isNew: false
      }))

      agentOptions.value = [
        { label: '➕ Crea nuovo agente', value: 'new', isNew: true },
        ...allAgents.value
      ]
    }
  } catch (err) {
    console.error('Errore caricamento agenti:', err)
  }
}

// Filtra agenti
const filterAgents = (val, update) => {
  if (val === '') {
    update(() => {
      agentOptions.value = [
        { label: '➕ Crea nuovo agente', value: 'new', isNew: true },
        ...allAgents.value
      ]
    })
    return
  }

  update(() => {
    const needle = val.toLowerCase()
    const filtered = allAgents.value.filter(
      a => a.label.toLowerCase().indexOf(needle) > -1
    )
    agentOptions.value = [
      { label: '➕ Crea nuovo agente', value: 'new', isNew: true },
      ...filtered
    ]
  })
}

// Gestisce selezione agente
const handleAgentSelect = (option) => {
  if (!option) {
    localAgent.value = {}
    return
  }

  if (option.isNew) {
    // Nuovo agente - pulisce form
    localAgent.value = {}
    selectedAgentOption.value = null
  } else {
    // Carica agente esistente
    localAgent.value = { ...option.agent }
  }
}

// Salva agente
const handleSave = async () => {
  if (!localAgent.value.lastname && !localAgent.value.firstname) {
    $q.notify({
      type: 'negative',
      message: 'Cognome o Nome obbligatori'
    })
    return
  }

  saving.value = true

  try {
    const endpoint = localAgent.value._id
      ? `/api/agents/${localAgent.value._id}`
      : '/api/agents'
    const method = localAgent.value._id ? 'PUT' : 'POST'

    const { data, error } = await $fetch(endpoint, {
      method,
      body: localAgent.value
    })

    if (error) {
      throw new Error(error.message)
    }

    $q.notify({
      type: 'positive',
      message: 'Agente salvato con successo'
    })

    emit('close', data.agent)

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
loadAgents()
</script>

<style scoped lang="scss">
.agent-dialog-content {
  padding: 16px;
}

.agent-form {
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
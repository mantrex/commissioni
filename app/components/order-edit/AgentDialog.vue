<template>
  <div class="agent-dialog-content">
    <q-form @submit.prevent="handleSave" class="agent-form">

      <!-- Selezione agente esistente -->
      <div class="form-section">
        <div class="section-title">Seleziona agente esistente</div>
        <q-select
          v-model="selectedAgentOption"
          :options="agentOptions"
          option-label="label"
          option-value="value"
          label="Cerca agente"
          outlined dense use-input clearable
          @filter="filterAgents"
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

      <!-- Dati agente -->
      <div class="form-section">
        <div class="section-title">Dati agente</div>
        <div class="row q-col-gutter-sm">
          <div class="col-12 col-sm-6">
            <q-input
              v-model="localAgent.lastname"
              label="Cognome *"
              outlined dense
              :rules="[val => !!val || 'Campo obbligatorio']" />
          </div>
          <div class="col-12 col-sm-6">
            <q-input
              v-model="localAgent.firstname"
              label="Nome"
              outlined dense />
          </div>
        </div>
      </div>

      <!-- Azioni -->
      <div class="form-actions">
        <q-btn type="submit" label="Salva" color="primary" unelevated :loading="saving" />
      </div>

    </q-form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useQuasar } from 'quasar'

const props = defineProps({
  agent: { type: Object, default: () => ({}) }
})

const emit = defineEmits(['close'])

const $q = useQuasar()
const saving = ref(false)
const localAgent = ref({ ...props.agent })
const selectedAgentOption = ref(null)
const allAgents = ref([])
const agentOptions = ref([])

const loadAgents = async () => {
  try {
    const result = await $fetch('/api/agents')
    allAgents.value = (result.agents || []).map(a => ({
      label: a.label,
      value: a.value,
      agent: { _id: a.value, lastname: a.lastname || '', firstname: a.firstname || '' },
      isNew: false
    }))
    agentOptions.value = [
      { label: '➕ Crea nuovo agente', value: 'new', isNew: true },
      ...allAgents.value
    ]
  } catch (err) {
    console.error('Errore caricamento agenti:', err)
  }
}

const filterAgents = (val, update) => {
  update(() => {
    if (!val) {
      agentOptions.value = [
        { label: '➕ Crea nuovo agente', value: 'new', isNew: true },
        ...allAgents.value
      ]
    } else {
      const needle = val.toLowerCase()
      agentOptions.value = [
        { label: '➕ Crea nuovo agente', value: 'new', isNew: true },
        ...allAgents.value.filter(a => a.label.toLowerCase().includes(needle))
      ]
    }
  })
}

const handleAgentSelect = (option) => {
  if (!option) {
    localAgent.value = {}
    return
  }
  if (option.isNew) {
    localAgent.value = {}
    selectedAgentOption.value = null
  } else {
    localAgent.value = { ...option.agent }
  }
}

const handleSave = async () => {
  if (!localAgent.value.lastname?.trim() && !localAgent.value.firstname?.trim()) {
    $q.notify({ type: 'negative', message: 'Cognome o Nome obbligatori' })
    return
  }

  saving.value = true
  try {
    const endpoint = localAgent.value._id
      ? `/api/agents/${localAgent.value._id}`
      : '/api/agents'
    const method = localAgent.value._id ? 'PUT' : 'POST'

    const result = await $fetch(endpoint, { method, body: localAgent.value })

    $q.notify({ type: 'positive', message: 'Agente salvato con successo' })

    // Ricarica lista agenti
    await loadAgents()

    // Seleziona automaticamente l'agente salvato nella dropdown
    const saved = result.agent || result.item
    if (saved) {
      const match = allAgents.value.find(a => a.value === saved._id.toString())
      if (match) {
        selectedAgentOption.value = match
        localAgent.value = { ...match.agent }
      }
    }

    emit('close', saved)

  } catch (err) {
    $q.notify({
      type: 'negative',
      message: err.data?.message || err.message || 'Errore nel salvataggio'
    })
  } finally {
    saving.value = false
  }
}

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
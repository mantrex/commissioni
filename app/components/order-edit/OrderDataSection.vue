<template>
  <div class="order-data-content">
    <!-- Header interno -->
    <div class="data-mini-header">
      <q-icon name="assignment" size="18px" />
      <span class="section-label">Dati Ordine</span>
    </div>

    <div class="row q-col-gutter-sm">
      <!-- Numero Commissione -->
      <div class="col-12 col-sm-6">
        <q-input v-model="commNum" label="Comm. n." outlined dense readonly :bg-color="'grey-3'">
          <template v-slot:prepend>
            <q-icon name="tag" />
          </template>
        </q-input>
      </div>

      <!-- Data -->
      <div class="col-12 col-sm-6">
        <q-input v-model="date" label="Data" type="date" outlined dense>
          <template v-slot:prepend>
            <q-icon name="event" />
          </template>
        </q-input>
      </div>

      <!-- Scadenza -->
      <div class="col-12 col-sm-6">
        <q-input v-model="dueDate" label="Scad" type="date" outlined dense>
          <template v-slot:prepend>
            <q-icon name="event_available" />
          </template>
        </q-input>
      </div>

      <!-- Agente -->
      <div class="col-12 col-sm-6">
        <div class="agent-field-wrapper">
          <q-select v-model="agentId" :options="agentOptions" label="Agente" option-label="label" option-value="value"
            emit-value map-options outlined dense clearable use-input @filter="filterAgents" class="agent-select">
            <template v-slot:prepend>
              <q-icon name="person" />
            </template>
          </q-select>
          <q-btn flat dense round icon="edit" size="sm" color="primary" @click="emit('editAgent')"
            class="agent-edit-btn">
            <q-tooltip>Gestisci Agenti</q-tooltip>
          </q-btn>
        </div>
      </div>

      <!-- Pos Pratica (Status) -->
      <div class="col-12">
        <q-select v-model="status" :options="statusOptions" label="Pos Pratica" option-label="label"
          option-value="value" emit-value map-options outlined dense use-input @filter="filterStatuses">
          <template v-slot:prepend>
            <q-icon name="flag" />
          </template>
        </q-select>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
const { statuses: allStatuses, loadStatuses } = useStatuses()
const statusOptions = ref([])



const props = defineProps({
  data: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update:data', 'editAgent'])

// Uso computed getter/setter per evitare loop ricorsivi
const commNum = computed({
  get: () => props.data.commNum,
  set: (val) => emit('update:data', { ...props.data, commNum: val })
})

const date = computed({
  get: () => props.data.date,
  set: (val) => emit('update:data', { ...props.data, date: val })
})

const dueDate = computed({
  get: () => props.data.dueDate,
  set: (val) => emit('update:data', { ...props.data, dueDate: val })
})

const agentId = computed({
  get: () => props.data.agentId,
  set: (val) => emit('update:data', { ...props.data, agentId: val })
})

const status = computed({
  get: () => props.data.status,
  set: (val) => emit('update:data', { ...props.data, status: val })
})

// Stati


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

// Agenti
const allAgents = ref([])
const agentOptions = ref([])

const loadAgents = async () => {
  try {
    const { data } = await useFetch('/api/agents')
    if (data.value) {
      allAgents.value = data.value.agents
      agentOptions.value = allAgents.value
    }
  } catch (err) {
    console.error('Errore caricamento agenti:', err)
  }
}

const filterAgents = (val, update) => {
  if (val === '') {
    update(() => {
      agentOptions.value = allAgents.value
    })
    return
  }

  update(() => {
    const needle = val.toLowerCase()
    agentOptions.value = allAgents.value.filter(
      a => a.label.toLowerCase().indexOf(needle) > -1
    )
  })
}

// Mount
onMounted(async() => {
  await loadStatuses()
  statusOptions.value = allStatuses.value
  loadAgents()
})
</script>

<style scoped lang="scss">
.order-data-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.data-mini-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: rgba($primary, 0.05);
  border-radius: 4px;

  .section-label {
    font-weight: 600;
    color: $text-primary;
    font-size: 14px;
  }
}

.agent-field-wrapper {
  display: flex;
  align-items: flex-start;
  gap: 8px;

  .agent-select {
    flex: 1;
  }

  .agent-edit-btn {
    margin-top: 4px;
  }
}
</style>
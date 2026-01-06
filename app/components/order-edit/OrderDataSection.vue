<template>
  <q-card flat bordered class="order-data-section">
    <q-card-section class="section-header">
      <div class="header-title">
        <q-icon name="assignment" size="20px" />
        <span>Dati Ordine</span>
      </div>
    </q-card-section>

    <q-separator />

    <q-card-section class="section-content">
      <div class="row q-col-gutter-sm">
        <!-- Numero Commissione -->
        <div class="col-12 col-sm-6">
          <q-input v-model="localData.commNum" label="Comm. n." outlined dense readonly :bg-color="'grey-3'">
            <template v-slot:prepend>
              <q-icon name="tag" />
            </template>
          </q-input>
        </div>

        <!-- Data -->
        <div class="col-12 col-sm-6">
          <q-input v-model="localData.date" label="Data" type="date" outlined dense>
            <template v-slot:prepend>
              <q-icon name="event" />
            </template>
          </q-input>
        </div>

        <!-- Scadenza -->
        <div class="col-12 col-sm-6">
          <q-input v-model="localData.dueDate" label="Scad" type="date" outlined dense>
            <template v-slot:prepend>
              <q-icon name="event_available" />
            </template>
          </q-input>
        </div>

        <!-- Agente -->
        <div class="col-12 col-sm-6">
          <q-select v-model="localData.agentId" :options="agentOptions" label="Agente" option-label="label"
            option-value="value" emit-value map-options outlined dense clearable use-input @filter="filterAgents">
            <template v-slot:prepend>
              <q-icon name="person" />
            </template>
          </q-select>
        </div>

        <!-- Pos Pratica (Status) -->
        <div class="col-12">
          <q-select v-model="localData.status" :options="statusOptions" label="Pos Pratica" option-label="label"
            option-value="value" emit-value map-options outlined dense use-input @filter="filterStatuses">
            <template v-slot:prepend>
              <q-icon name="flag" />
            </template>
          </q-select>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { getSelectableStatuses } from '~~/utils/statuses'

const props = defineProps({
  data: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update:data'])

const localData = ref({ ...props.data })

// Stati
const allStatuses = ref(getSelectableStatuses())
const statusOptions = ref(allStatuses.value)

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

// Watch
watch(() => props.data, (newVal) => {
  localData.value = { ...newVal }
}, { deep: true })

watch(localData, (newVal) => {
  emit('update:data', newVal)
}, { deep: true })

// Mount
onMounted(() => {
  loadAgents()
})
</script>

<style scoped lang="scss">
.order-data-section {
  background: $contrast;
}

.section-header {
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
</style>
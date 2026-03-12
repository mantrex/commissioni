<template>
  <div class="order-data-content">
    <!-- Header interno -->
    <div class="data-mini-header sub-header">
      <q-icon name="assignment" size="18px" />
      <span class="section-label">Dati Ordine</span>
    </div>

    <div class="row q-col-gutter-sm">
      <!-- Numero Commissione: readonly + penna per modifica -->
      <div class="col-12 col-sm-6">
        <div class="commnum-wrapper">
          <q-input
            v-model="commNum"
            label="Comm. n."
            outlined
            dense
            readonly
            :bg-color="'readonly'"
            input-style="font-family: monospace; font-weight: 600;"
            class="commnum-input">
            <template v-slot:prepend>
              <q-icon name="tag" />
            </template>
          </q-input>
          <q-btn
            flat
            dense
            round
            icon="edit"
            size="sm"
            color="primary"
            class="commnum-edit-btn"
            @click="emit('editCommNum')">
            <q-tooltip>Modifica numero commissione</q-tooltip>
          </q-btn>
        </div>
      </div>

      <!-- Data -->
      <div class="col-12 col-sm-6">
        <q-input
          v-model="data.date"
          label="Data"
          type="date"
          class="is-important"
          outlined
          dense>
          <template v-slot:prepend>
            <q-icon name="event" />
          </template>
        </q-input>
      </div>

      <!-- Scadenza -->
      <div class="col-12 col-sm-6">
        <q-input v-model="data.dueDate" label="Scad" type="date" outlined dense>
          <template v-slot:prepend>
            <q-icon name="event_available" />
          </template>
        </q-input>
      </div>

      <!-- Agente -->
      <div class="col-12 col-sm-6">
        <div class="agent-field-wrapper">
          <q-select
            v-model="data.agentId"
            :options="agentOptions"
            label="Agente"
            option-label="label"
            option-value="value"
            emit-value
            map-options
            outlined
            dense
            clearable
            use-input
            @filter="filterAgents"
            class="agent-select">
            <template v-slot:prepend>
              <q-icon name="person" />
            </template>
          </q-select>
          <q-btn
            flat
            dense
            round
            icon="edit"
            size="sm"
            color="primary"
            @click="emit('editAgent')"
            class="agent-edit-btn">
            <q-tooltip>Gestisci Agenti</q-tooltip>
          </q-btn>
        </div>
      </div>

      <!-- Pos Pratica (Status) -->
      <div class="col-12">
        <q-select
          v-model="data.status"
          class="is-important"
          :options="statusOptions"
          label="Pos Pratica"
          option-label="label"
          option-value="value"
          emit-value
          map-options
          outlined
          dense
          use-input
          @filter="filterStatuses">
          <template v-slot:prepend>
            <q-icon name="flag" />
          </template>
        </q-select>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { getConfigValue } from "#shared/config";

const deadline = getConfigValue("DEADLINE", 30);

// Data oggi
const today = new Date().toISOString().split("T")[0];

// Data scadenza = oggi + DEADLINE giorni
const dueDate = new Date();
dueDate.setDate(dueDate.getDate() + deadline);
const dueDateStr = dueDate.toISOString().split("T")[0];

const { statuses: allStatuses, loadStatuses } = useStatuses();

const data = defineModel("data", {
  type: Object,
  required: true,
});

const commNum = defineModel("commNum", {
  type: String,
  default: "",
});

const emit = defineEmits(["editAgent", "editCommNum"]);

const statusOptions = ref([]);
const allAgents = ref([]);
const agentOptions = ref([]);

const filterStatuses = (val, update) => {
  if (val === "") {
    update(() => {
      statusOptions.value = allStatuses.value;
    });
    return;
  }
  update(() => {
    const needle = val.toLowerCase();
    statusOptions.value = allStatuses.value.filter((s) =>
      s.label.toLowerCase().includes(needle),
    );
  });
};

const loadAgents = async () => {
  try {
    const agentsData = await $fetch("/api/agents");
    if (agentsData?.agents) {
      allAgents.value = agentsData.agents;
      agentOptions.value = agentsData.agents;
    }
  } catch (err) {
    console.error("Errore caricamento agenti:", err);
  }
};

const filterAgents = (val, update) => {
  if (val === "") {
    update(() => {
      agentOptions.value = allAgents.value;
    });
    return;
  }
  update(() => {
    const needle = val.toLowerCase();
    agentOptions.value = allAgents.value.filter((a) =>
      a.label.toLowerCase().includes(needle),
    );
  });
};

onMounted(async () => {
  await loadStatuses();
  statusOptions.value = allStatuses.value;
  await loadAgents();

  if (!data.value.date) {
    data.value.date = today;
  }
  if (!data.value.dueDate) {
    data.value.dueDate = dueDateStr;
  }
});
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

 

  .section-label {
    font-weight: 600;
    color: $text-primary;
    font-size: 14px;
  }
}

.commnum-wrapper {
  display: flex;
  align-items: flex-start;
  gap: 8px;

  .commnum-input {
    flex: 1;
  }

  .commnum-edit-btn {
    margin-top: 4px;
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

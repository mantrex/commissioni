<template>
  <q-page class="lists-page">
    <div class="sidebar">
      <q-btn class="menu-btn" color="primary" icon="arrow_back" label="Commissioni" unelevated @click="router.push('/')" />
      <q-btn class="menu-btn" color="accent" icon="receipt" label="Fatture" unelevated @click="router.push('/invoices')" />
    </div>

    <div class="main-content">
      <q-card flat bordered class="filter-card">
        <q-card-section class="row items-center q-gutter-md">
          <q-icon name="list_alt" size="24px" color="primary" />
          <span class="text-h6 text-primary">Gestione Liste</span>
          <q-separator vertical />
          <q-select v-model="selectedListType" :options="listTypeOptions" label="Seleziona lista da gestire"
            outlined dense emit-value map-options style="min-width: 260px" @update:model-value="loadList" />
          <q-space />
          <q-btn v-if="selectedListType" color="primary" icon="add" label="Crea Nuovo" unelevated @click="handleCreate" />
        </q-card-section>
      </q-card>

      <q-card v-if="selectedListType" flat bordered class="table-card">
        <q-card-section class="section-header">
          <q-icon name="format_list_bulleted" size="18px" />
          <span>{{ currentListLabel }}</span>
          <q-chip dense color="primary" text-color="white" size="sm" class="q-ml-sm">{{ filteredItems.length }}</q-chip>
          <q-space />
          <q-checkbox v-model="showDeleted" label="Mostra disattivati" dense size="sm" />
        </q-card-section>
        <q-card-section class="q-pa-none">
          <q-table flat :rows="filteredItems" :columns="currentColumns" row-key="_id"
            :loading="loading" dense :rows-per-page-options="[0]" hide-pagination class="list-table">

            <template v-slot:body-cell-selectable="props">
              <q-td :props="props" class="text-center">
                <q-badge :color="props.row.selectable ? 'positive' : 'grey-5'" :label="props.row.selectable ? 'Attivo' : 'Disattivo'" />
              </q-td>
            </template>

            <template v-slot:body-cell-deleted="props">
              <q-td :props="props" class="text-center">
                <q-badge :color="!props.row.deleted ? 'positive' : 'grey-5'" :label="!props.row.deleted ? 'Attivo' : 'Disattivo'" />
              </q-td>
            </template>

            <template v-slot:body-cell-actions="props">
              <q-td :props="props" class="text-center">
                <q-btn flat dense round icon="edit" size="sm" color="primary" @click="handleEdit(props.row)">
                  <q-tooltip>Modifica</q-tooltip>
                </q-btn>
                <q-btn v-if="isAgents ? !props.row.deleted : props.row.selectable"
                  flat dense round icon="visibility_off" size="sm" color="warning" @click="handleDelete(props.row)">
                  <q-tooltip>Disattiva</q-tooltip>
                </q-btn>
                <q-btn v-else flat dense round icon="visibility" size="sm" color="positive" @click="handleRestore(props.row)">
                  <q-tooltip>Riattiva</q-tooltip>
                </q-btn>
              </q-td>
            </template>

            <template v-slot:no-data>
              <div class="full-width row flex-center q-pa-lg text-grey-7">
                <q-icon size="2em" name="list_alt" class="q-mr-sm" /><span>Nessun elemento trovato</span>
              </div>
            </template>
          </q-table>
        </q-card-section>
      </q-card>

      <q-card v-else flat bordered class="placeholder-card">
        <q-card-section class="text-center q-pa-xl">
          <q-icon name="list_alt" size="64px" color="grey-4" />
          <div class="text-h6 text-grey-6 q-mt-md">Seleziona una lista da gestire</div>
          <div class="text-caption text-grey-5 q-mt-sm">Usa il menu a tendina in alto per scegliere quale lista modificare</div>
        </q-card-section>
      </q-card>
    </div>

    <!-- Dialog form: liste standard -->
    <ComponentDialog v-model="formDialog.show"
      :title="formDialog.isNew ? 'Nuovo Elemento' : 'Modifica Elemento'"
      :component-name="ListItemForm"
      :component-props="{ item: formDialog.data, isNew: formDialog.isNew, listType: selectedListType }"
      custom-style="width: 420px"
      @close="handleFormClose" />

    <!-- Dialog form: agenti -->
    <ComponentDialog v-model="agentDialog.show"
      :title="agentDialog.isNew ? 'Nuovo Agente' : 'Modifica Agente'"
      :component-name="AgentForm"
      :component-props="{ item: agentDialog.data, isNew: agentDialog.isNew }"
      custom-style="width: 420px"
      @close="handleFormClose" />

    <!-- Dialog conferma disattivazione -->
    <ComponentDialog v-model="deleteDialog.show"
      title="Conferma disattivazione"
      :component-name="GenericWarning"
      :component-props="{
        message: 'Stai per disattivare il seguente elemento. Non verrà eliminato ma nascosto dalle selezioni.',
        detail: deleteDialog.label,
        icon: 'visibility_off',
        iconColor: 'warning',
        confirmLabel: 'Disattiva',
        confirmColor: 'negative',
        confirmIcon: 'visibility_off',
        cancelLabel: 'Annulla'
      }"
      custom-style="width: 420px"
      @close="handleDeleteConfirm" />
  </q-page>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import ComponentDialog from '~/components/common/ComponentDialog.vue'
import GenericWarning from '~/components/common/GenericWarning.vue'
import ListItemForm from '~/components/lists/ListItemForm.vue'
import AgentForm from '~/components/lists/AgentForm.vue'

const router = useRouter()
const $q = useQuasar()

const selectedListType = ref(null)
const items = ref([])
const loading = ref(false)
const showDeleted = ref(false)

const listTypeOptions = [
  { label: 'Agenti di vendita', value: 'agents' },
  { label: 'Assicurazioni', value: 'insurances' },
  { label: 'Corrieri', value: 'couriers' },
  { label: 'Pagamenti', value: 'payments' },
  { label: 'Spedizioni', value: 'shipments' },
  { label: 'Stati commissione', value: 'statuses' }
]

const isAgents = computed(() => selectedListType.value === 'agents')
const currentListLabel = computed(() => listTypeOptions.find(o => o.value === selectedListType.value)?.label || '')
const filteredItems = computed(() => {
  if (showDeleted.value) return items.value
  if (isAgents.value) return items.value.filter(i => !i.deleted)
  return items.value.filter(i => i.selectable)
})

const columnsStandard = [
  { name: 'code', label: 'Codice', align: 'left', field: 'code', style: 'width: 160px; font-family: monospace' },
  { name: 'label', label: 'Etichetta', align: 'left', field: 'label' },
  { name: 'selectable', label: 'Stato', align: 'center', field: 'selectable', style: 'width: 120px' },
  { name: 'actions', label: 'Azioni', align: 'center', style: 'width: 100px' }
]
const columnsAgents = [
  { name: 'lastname', label: 'Cognome', align: 'left', field: 'lastname' },
  { name: 'firstname', label: 'Nome', align: 'left', field: 'firstname' },
  { name: 'deleted', label: 'Stato', align: 'center', field: 'deleted', style: 'width: 120px' },
  { name: 'actions', label: 'Azioni', align: 'center', style: 'width: 100px' }
]
const currentColumns = computed(() => isAgents.value ? columnsAgents : columnsStandard)

const formDialog = reactive({ show: false, isNew: true, data: {} })
const agentDialog = reactive({ show: false, isNew: true, data: {} })
const deleteDialog = reactive({ show: false, item: null, label: '' })

const loadList = async () => {
  if (!selectedListType.value) return
  loading.value = true
  items.value = []
  try {
    const result = await $fetch(`/api/lists/${selectedListType.value}`)
    items.value = result?.items || result?.[selectedListType.value] || []
  } catch (err) {
    $q.notify({ type: 'negative', message: 'Errore nel caricamento', caption: err.message })
  } finally {
    loading.value = false
  }
}

const handleCreate = () => {
  if (isAgents.value) {
    agentDialog.isNew = true
    agentDialog.data = {}
    agentDialog.show = true
  } else {
    formDialog.isNew = true
    formDialog.data = {}
    formDialog.show = true
  }
}

const handleEdit = (item) => {
  if (isAgents.value) {
    agentDialog.isNew = false
    agentDialog.data = { ...item }
    agentDialog.show = true
  } else {
    formDialog.isNew = false
    formDialog.data = { ...item }
    formDialog.show = true
  }
}

const handleDelete = (item) => {
  deleteDialog.item = item
  deleteDialog.label = isAgents.value
    ? `${item.lastname || ''} ${item.firstname || ''}`.trim()
    : item.label
  deleteDialog.show = true
}

const handleRestore = async (item) => {
  try {
    if (isAgents.value) {
      await $fetch(`/api/lists/agents/${item._id}`, { method: 'PUT', body: { ...item, deleted: false } })
    } else {
      await $fetch(`/api/lists/${selectedListType.value}/${item._id}`, { method: 'PUT', body: { ...item, selectable: true } })
    }
    $q.notify({ type: 'positive', message: 'Elemento riattivato' })
    await loadList()
  } catch (err) {
    $q.notify({ type: 'negative', message: 'Errore nella riattivazione', caption: err.message })
  }
}

const handleFormClose = async (saved) => {
  if (saved) await loadList()
}

const handleDeleteConfirm = async (confirmed) => {
  if (!confirmed) return
  try {
    if (isAgents.value) {
      await $fetch(`/api/lists/agents/${deleteDialog.item._id}`, {
        method: 'PUT', body: { ...deleteDialog.item, deleted: true }
      })
    } else {
      await $fetch(`/api/lists/${selectedListType.value}/${deleteDialog.item._id}`, { method: 'DELETE' })
    }
    $q.notify({ type: 'positive', message: 'Elemento disattivato' })
    await loadList()
  } catch (err) {
    $q.notify({ type: 'negative', message: 'Errore nella disattivazione', caption: err.message })
  }
}
</script>

<style scoped lang="scss">
.lists-page {
  display: flex;
  height: calc(100vh - 50px);
  background: $bg-light;
}
.sidebar {
  width: 160px;
  background: $contrast;
  border-right: 1px solid $border;
  padding: 16px 8px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  .menu-btn {
    width: 100%;
    justify-content: flex-start;
    font-size: 13px;
    padding: 12px 16px;
  }
}
.main-content {
  flex: 1;
  padding: 16px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.filter-card { background: $contrast; flex-shrink: 0; }
.table-card { background: $contrast; flex: 1; overflow: hidden; display: flex; flex-direction: column; }
.placeholder-card { background: $contrast; flex: 1; }
.section-header {
  padding: 6px 12px !important;
  background: $bg-light;
  border-bottom: 1px solid $border;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 13px;
  color: $text-primary;
  min-height: 36px;
  flex-shrink: 0;
}
.list-table {
  height: 100%;
  :deep(tbody tr) {
    transition: background-color 0.15s;
    &:hover { background-color: rgba($primary, 0.05); }
  }
  :deep(th) {
    font-weight: 600;
    color: $text-primary;
    background: $bg-light;
    position: sticky;
    top: 0;
    z-index: 1;
  }
}
@media (max-width: 960px) {
  .lists-page { flex-direction: column; }
  .sidebar {
    width: 100%;
    flex-direction: row;
    overflow-x: auto;
    padding: 8px;
    .menu-btn { white-space: nowrap; }
  }
}
</style>
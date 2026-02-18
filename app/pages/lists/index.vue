<template>
  <q-page class="lists-page">
    <!-- Sidebar -->
    <div class="sidebar">
      <q-btn class="menu-btn" color="primary" icon="arrow_back" label="Commissioni" unelevated
        @click="router.push('/')" />
      <q-btn class="menu-btn" color="accent" icon="receipt" label="Fatture" unelevated
        @click="router.push('/invoices')" />
    </div>

    <!-- Contenuto principale -->
    <div class="main-content">
      <!-- Header con select lista -->
      <q-card flat bordered class="filter-card">
        <q-card-section class="row items-center q-gutter-md">
          <q-icon name="list_alt" size="24px" color="primary" />
          <span class="text-h6 text-primary">Gestione Liste</span>
          <q-separator vertical />
          <q-select
            v-model="selectedListType"
            :options="listTypeOptions"
            label="Seleziona lista da gestire"
            outlined
            dense
            emit-value
            map-options
            style="min-width: 260px"
            @update:model-value="loadList"
          />
          <q-space />
          <q-btn
            v-if="selectedListType"
            color="primary"
            icon="add"
            label="Crea Nuovo"
            unelevated
            @click="handleCreate"
          />
        </q-card-section>
      </q-card>

      <!-- Tabella elementi lista -->
      <q-card v-if="selectedListType" flat bordered class="table-card">
        <q-card-section class="section-header">
          <q-icon name="format_list_bulleted" size="18px" />
          <span>{{ currentListLabel }}</span>
          <q-chip dense color="primary" text-color="white" size="sm" class="q-ml-sm">
            {{ filteredItems.length }}
          </q-chip>
          <q-space />
          <q-checkbox
            v-model="showDeleted"
            label="Mostra disattivati"
            dense
            size="sm"
          />
        </q-card-section>

        <q-card-section class="q-pa-none">
          <q-table
            flat
            :rows="filteredItems"
            :columns="currentColumns"
            row-key="_id"
            :loading="loading"
            dense
            :rows-per-page-options="[0]"
            hide-pagination
            class="list-table"
          >
            <!-- Badge stato liste standard -->
            <template v-slot:body-cell-selectable="props">
              <q-td :props="props">
                <q-badge
                  :color="props.row.selectable ? 'positive' : 'negative'"
                  :label="props.row.selectable ? 'Attivo' : 'Disattivato'"
                />
              </q-td>
            </template>

            <!-- Badge stato agenti -->
            <template v-slot:body-cell-deleted="props">
              <q-td :props="props">
                <q-badge
                  :color="props.row.deleted ? 'negative' : 'positive'"
                  :label="props.row.deleted ? 'Disattivato' : 'Attivo'"
                />
              </q-td>
            </template>

            <!-- Azioni -->
            <template v-slot:body-cell-actions="props">
              <q-td :props="props">
                <q-btn flat dense round icon="edit" size="sm" color="primary" @click="handleEdit(props.row)">
                  <q-tooltip>Modifica</q-tooltip>
                </q-btn>
                <template v-if="!isAgents">
                  <q-btn v-if="props.row.selectable" flat dense round icon="delete" size="sm" color="negative"
                    @click="handleDelete(props.row)">
                    <q-tooltip>Disattiva</q-tooltip>
                  </q-btn>
                  <q-btn v-else flat dense round icon="restore" size="sm" color="positive"
                    @click="handleRestore(props.row)">
                    <q-tooltip>Riattiva</q-tooltip>
                  </q-btn>
                </template>
                <template v-else>
                  <q-btn v-if="!props.row.deleted" flat dense round icon="delete" size="sm" color="negative"
                    @click="handleDelete(props.row)">
                    <q-tooltip>Disattiva</q-tooltip>
                  </q-btn>
                  <q-btn v-else flat dense round icon="restore" size="sm" color="positive"
                    @click="handleRestore(props.row)">
                    <q-tooltip>Riattiva</q-tooltip>
                  </q-btn>
                </template>
              </q-td>
            </template>

            <template v-slot:no-data>
              <div class="full-width row flex-center q-pa-md text-grey-7">
                <q-icon size="2em" name="list_alt" class="q-mr-sm" />
                <span>Nessun elemento trovato</span>
              </div>
            </template>
          </q-table>
        </q-card-section>
      </q-card>

      <!-- Placeholder se nessuna lista selezionata -->
      <q-card v-else flat bordered class="placeholder-card">
        <q-card-section class="text-center q-pa-xl">
          <q-icon name="list_alt" size="64px" color="grey-4" />
          <div class="text-h6 text-grey-6 q-mt-md">Seleziona una lista da gestire</div>
          <div class="text-caption text-grey-5 q-mt-sm">
            Usa il menu a tendina in alto per scegliere quale lista modificare
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- Dialog crea/modifica - LISTE STANDARD -->
    <q-dialog v-if="!isAgents" v-model="dialog.show" persistent>
      <q-card style="min-width: 400px">
        <q-bar class="dialog-header">
          <div class="dialog-title">{{ dialog.isNew ? 'Nuovo Elemento' : 'Modifica Elemento' }}</div>
          <q-space />
          <q-btn dense flat icon="close" @click="dialog.show = false" />
        </q-bar>
        <q-card-section class="q-pa-md q-gutter-sm">
          <q-input v-if="dialog.isNew" v-model="dialog.data.code" label="Codice *" outlined dense
            hint="Verrà convertito in maiuscolo" />
          <div v-else class="q-mb-sm">
            <span class="text-caption text-grey-6">Codice: </span>
            <span class="text-weight-medium">{{ dialog.data.code }}</span>
          </div>
          <q-input v-model="dialog.data.label" label="Etichetta *" outlined dense autofocus />
          <q-toggle v-model="dialog.data.selectable" label="Attivo (visibile nelle selezioni)" />
        </q-card-section>
        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Annulla" color="negative" @click="dialog.show = false" />
          <q-btn label="Salva" color="primary" unelevated :loading="saving" @click="handleSave" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog crea/modifica - AGENTI -->
    <q-dialog v-if="isAgents" v-model="dialog.show" persistent>
      <q-card style="min-width: 400px">
        <q-bar class="dialog-header">
          <div class="dialog-title">{{ dialog.isNew ? 'Nuovo Agente' : 'Modifica Agente' }}</div>
          <q-space />
          <q-btn dense flat icon="close" @click="dialog.show = false" />
        </q-bar>
        <q-card-section class="q-pa-md q-gutter-sm">
          <q-input v-model="dialog.data.lastname" label="Cognome *" outlined dense autofocus />
          <q-input v-model="dialog.data.firstname" label="Nome" outlined dense />
          <q-toggle v-model="dialog.data.active" label="Attivo (visibile nelle selezioni)" />
        </q-card-section>
        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Annulla" color="negative" @click="dialog.show = false" />
          <q-btn label="Salva" color="primary" unelevated :loading="saving" @click="handleSave" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog conferma eliminazione -->
    <q-dialog v-model="deleteDialog.show" persistent>
      <q-card style="min-width: 360px">
        <q-bar style="background-color: var(--q-warning)" class="text-white">
          <q-icon name="warning" />
          <div class="q-ml-sm" style="font-weight:500;font-size:16px">Attenzione</div>
          <q-space />
          <q-btn dense flat icon="close" @click="deleteDialog.show = false" />
        </q-bar>
        <q-card-section class="q-pa-md">
          <div class="text-body1">Stai per disattivare:</div>
          <div class="text-weight-bold text-primary q-mt-sm q-mb-sm" style="font-size: 16px;">
            {{ deleteDialog.label }}
          </div>
          <div class="text-body2 text-grey-7">
            L'elemento non verrà eliminato definitivamente, ma sarà nascosto dalle selezioni
            (soft delete per compatibilità con i dati storici).
          </div>
        </q-card-section>
        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Annulla" color="primary" @click="deleteDialog.show = false" />
          <q-btn label="Disattiva" color="negative" unelevated icon="delete" :loading="deleting"
            @click="confirmDelete" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'

const router = useRouter()
const $q = useQuasar()

const selectedListType = ref(null)
const items = ref([])
const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)
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

const currentListLabel = computed(() =>
  listTypeOptions.find(o => o.value === selectedListType.value)?.label || ''
)

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

const dialog = reactive({ show: false, isNew: false, data: {} })
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
  dialog.isNew = true
  dialog.data = isAgents.value
    ? { firstname: '', lastname: '', active: true }
    : { code: '', label: '', selectable: true }
  dialog.show = true
}

const handleEdit = (item) => {
  dialog.isNew = false
  dialog.data = isAgents.value
    ? { ...item, active: !item.deleted }
    : { ...item }
  dialog.show = true
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
      await $fetch(`/api/lists/agents/${item._id}`, {
        method: 'PUT',
        body: { ...item, deleted: false }
      })
    } else {
      await $fetch(`/api/lists/${selectedListType.value}/${item._id}`, {
        method: 'PUT',
        body: { ...item, selectable: true }
      })
    }
    $q.notify({ type: 'positive', message: 'Elemento riattivato con successo' })
    await loadList()
  } catch (err) {
    $q.notify({ type: 'negative', message: 'Errore nella riattivazione', caption: err.message })
  }
}

const confirmDelete = async () => {
  deleting.value = true
  try {
    await $fetch(`/api/lists/${selectedListType.value}/${deleteDialog.item._id}`, { method: 'DELETE' })
    $q.notify({ type: 'positive', message: 'Elemento disattivato con successo' })
    deleteDialog.show = false
    await loadList()
  } catch (err) {
    $q.notify({ type: 'negative', message: 'Errore nella disattivazione', caption: err.message })
  } finally {
    deleting.value = false
  }
}

const handleSave = async () => {
  saving.value = true
  try {
    if (isAgents.value) {
      if (!dialog.data.lastname?.trim() && !dialog.data.firstname?.trim()) {
        $q.notify({ type: 'warning', message: 'Almeno cognome o nome sono obbligatori' })
        return
      }
      const body = {
        firstname: dialog.data.firstname || '',
        lastname: dialog.data.lastname || '',
        deleted: !dialog.data.active
      }
      if (dialog.isNew) {
        await $fetch('/api/lists/agents', { method: 'POST', body })
      } else {
        await $fetch(`/api/lists/agents/${dialog.data._id}`, { method: 'PUT', body })
      }
    } else {
      if (!dialog.data.label?.trim()) {
        $q.notify({ type: 'warning', message: "L'etichetta è obbligatoria" })
        return
      }
      if (dialog.isNew && !dialog.data.code?.trim()) {
        $q.notify({ type: 'warning', message: 'Il codice è obbligatorio' })
        return
      }
      if (dialog.isNew) {
        await $fetch(`/api/lists/${selectedListType.value}`, { method: 'POST', body: dialog.data })
      } else {
        await $fetch(`/api/lists/${selectedListType.value}/${dialog.data._id}`, { method: 'PUT', body: dialog.data })
      }
    }
    $q.notify({ type: 'positive', message: dialog.isNew ? 'Elemento creato' : 'Elemento aggiornato' })
    dialog.show = false
    await loadList()
  } catch (err) {
    $q.notify({ type: 'negative', message: 'Errore nel salvataggio', caption: err.message })
  } finally {
    saving.value = false
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

.dialog-header {
  background-color: $modal-header;
  color: $contrast;

  .dialog-title {
    font-weight: 500;
    font-size: 16px;
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
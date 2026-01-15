<template>
  <q-page class="order-edit-page">
    <div class="order-edit-container">
      <!-- Header con azioni -->
      <div class="order-header">
        <div class="order-title">
          <q-btn flat dense icon="arrow_back" @click="handleBack" />
          <h5>{{ isNew ? 'Nuova Commissione' : `Commissione ${orderData.commNum}` }}</h5>
        </div>

        <div class="order-actions">
          <q-btn color="negative" flat label="Annulla" @click="handleCancel" />
          <q-btn color="primary" unelevated label="Salva" icon="save" @click="handleSave" :loading="saving" />
        </div>
      </div>

      <!-- Griglia responsiva principale -->
      <div class="order-grid">
        <!-- ✅ SEZIONE CLIENTE + DATI ORDINE CON HEADER UNICO COLLASSABILE -->
        <q-card flat bordered class="top-section-card">
          <!-- Header unico collassabile -->
          <q-card-section class="section-header">
            <div class="header-left">
              <q-btn flat dense round :icon="topSectionCollapsed ? 'expand_more' : 'expand_less'" size="sm"
                @click="topSectionCollapsed = !topSectionCollapsed" class="collapse-btn">
                <q-tooltip>{{ topSectionCollapsed ? 'Espandi' : 'Comprimi' }}</q-tooltip>
              </q-btn>
              <q-icon name="assignment" size="20px" />
              <span>Cliente e Dati Ordine</span>
            </div>
          </q-card-section>

          <!-- Contenuto collassabile -->
          <q-slide-transition>
            <div v-show="!topSectionCollapsed" class="top-section">
              <ClientSection v-model:client="orderData.client" @edit-client="handleEditClient" />
              <OrderDataSection v-model:data="orderData.orderData" @edit-agent="handleEditAgent" />
            </div>
          </q-slide-transition>
        </q-card>

        <!-- Sezione Corrieri + Note + Finanziari (collassabile separata) -->
        <ShipmentsNotesSection v-model:shipments="orderData.shipments" v-model:notes="orderData.notes"
          v-model:financial="orderData.financial" />

        <!-- Sezione Articoli (collassabile separata) -->
        <ItemsSection v-model:items="orderData.items" @add-item="handleAddItem" @edit-item="handleEditItem"
          @remove-item="handleRemoveItem" />
      </div>
    </div>

    <!-- Dialog Cliente -->
    <ComponentDialog v-model="dialogs.client.show" :side="true"
      :custom-style="'min-width: 200px; width: 900px; max-width: 1200px'"
      :title="dialogs.client.isNew ? 'Nuovo Cliente' : 'Modifica Cliente'" :component-name="ClientDialog"
      :component-props="{ client: dialogs.client.data }" @close="handleClientDialogClose" />

    <!-- Dialog Articolo -->
    <ComponentDialog v-model="dialogs.item.show" :side="true"
      :custom-style="'min-width: 200px; width: 800px; max-width: 1000px'"
      :title="dialogs.item.isNew ? 'Nuovo Articolo' : 'Modifica Articolo'" :component-name="ItemDialog"
      :component-props="{ item: dialogs.item.data }" @close="handleItemDialogClose" />

    <!-- Dialog Agente -->
    <ComponentDialog v-model="dialogs.agent.show" :side="true"
      :custom-style="'min-width: 200px; width: 600px; max-width: 800px'"
      :title="dialogs.agent.isNew ? 'Nuovo Agente' : 'Modifica Agente'" :component-name="AgentDialog"
      :component-props="{ agent: dialogs.agent.data }" @close="handleAgentDialogClose" />
  </q-page>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import ComponentDialog from '~/components/common/ComponentDialog.vue'
import ClientSection from './ClientSection.vue'
import OrderDataSection from './OrderDataSection.vue'
import ShipmentsNotesSection from './ShipmentsNotesSection.vue'
import ItemsSection from './ItemsSection.vue'
import ClientDialog from './ClientDialog.vue'
import ItemDialog from './ItemDialog.vue'
import AgentDialog from './AgentDialog.vue'

const router = useRouter()
const route = useRoute()
const $q = useQuasar()

const orderId = route.params.id
const isNew = !orderId || orderId === 'new'
const saving = ref(false)

// ✅ Stato per collassare la sezione top (Cliente + Dati Ordine)
const topSectionCollapsed = ref(false)

// Dati ordine
const orderData = reactive({
  commNum: '',
  client: null,
  orderData: {
    date: new Date().toISOString().split('T')[0],
    dueDate: null,
    agentId: null,
    status: 'APERTA'
  },
  shipments: Array(3).fill(null).map(() => ({ date: null, courier: '' })),
  notes: Array(5).fill(null).map(() => ({ text: '' })),
  financial: {
    ca: 0,
    rd: 0,
    ric: 0,
    balance: 0,
    pay: 0
  },
  items: []
})

// Dialogs state
const dialogs = reactive({
  client: {
    show: false,
    isNew: false,
    data: null
  },
  item: {
    show: false,
    isNew: false,
    data: null,
    index: null
  },
  agent: {
    show: false,
    isNew: false,
    data: null
  }
})

// ✅ FIX: Load order data SENZA Object.assign per evitare loop ricorsivi
const loadOrder = async () => {
  if (isNew) return

  try {
    const { data, error } = await useFetch(`/api/orders/${orderId}`)

    if (error.value) {
      throw new Error(error.value.message)
    }

    // ✅ Assegna proprietà individualmente per evitare loop ricorsivi
    const order = data.value.order

    orderData.commNum = order.commNum || ''
    orderData.client = order.clientId || null

    // Dati ordine
    orderData.orderData.date = order.date ? new Date(order.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
    orderData.orderData.dueDate = order.dueDate ? new Date(order.dueDate).toISOString().split('T')[0] : null
    orderData.orderData.agentId = order.agentId?._id || null
    orderData.orderData.status = order.status || 'APERTA'

    // ✅ Spedizioni (assicurati di avere almeno 3 righe vuote)
    if (order.shipments && order.shipments.length > 0) {
      orderData.shipments = order.shipments.map(s => ({
        date: s.date ? new Date(s.date).toISOString().split('T')[0] : null,
        courier: s.courier || ''
      }))
      // Aggiungi righe vuote fino a 3
      //while (orderData.shipments.length < 3) {
      //  orderData.shipments.push({ date: null, courier: '' })
      //}
    }

    // ✅ Note (assicurati di avere almeno 5 righe vuote)
    if (order.notes && order.notes.length > 0) {
      orderData.notes = order.notes.map(n => ({ text: n.text || '' }))

      // Aggiungi righe vuote fino a 5
      //while (orderData.notes.length < 5) {
      //  orderData.notes.push({ text: '' })
      //}
    }

    // Dati finanziari
    orderData.financial.ca = order.ca || 0
    orderData.financial.rd = order.rd || 0
    orderData.financial.ric = order.ric || 0
    orderData.financial.balance = order.balance || 0
    orderData.financial.pay = order.pay || 0

    // ✅ Articoli
    orderData.items = order.items || []

    console.log('✅ Ordine caricato:', {
      items: orderData.items.length,
      notes: orderData.notes.filter(n => n.text).length,
      shipments: orderData.shipments.filter(s => s.courier).length
    })

  } catch (err) {
    $q.notify({
      type: 'negative',
      message: 'Errore nel caricamento',
      caption: err.message
    })
    router.push('/')
  }
}

// Handlers
const handleBack = () => {
  router.push('/')
}

const handleCancel = () => {
  $q.dialog({
    title: 'Conferma',
    message: 'Vuoi annullare le modifiche?',
    cancel: true,
    persistent: true
  }).onOk(() => {
    router.push('/')
  })
}

const handleSave = async () => {
  saving.value = true

  try {
    const endpoint = isNew ? '/api/orders' : `/api/orders/${orderId}`
    const method = isNew ? 'POST' : 'PUT'

    const { data, error } = await useFetch(endpoint, {
      method,
      body: orderData
    })

    if (error.value) {
      throw new Error(error.value.message)
    }

    $q.notify({
      type: 'positive',
      message: 'Ordine salvato con successo'
    })

    router.push('/')

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

const handleEditClient = () => {
  dialogs.client.isNew = !orderData.client
  dialogs.client.data = orderData.client || {}
  dialogs.client.show = true
}

const handleClientDialogClose = (savedClient) => {
  if (savedClient) {
    orderData.client = savedClient
  }
  dialogs.client.show = false
}

const handleAddItem = () => {
  dialogs.item.isNew = true
  dialogs.item.data = {}
  dialogs.item.index = null
  dialogs.item.show = true
}

const handleEditItem = (item, index) => {
  dialogs.item.isNew = false
  dialogs.item.data = { ...item }
  dialogs.item.index = index
  dialogs.item.show = true
}

const handleItemDialogClose = (savedItem) => {
  console.log('🔵 handleItemDialogClose chiamato')
  console.log('📦 savedItem ricevuto:', savedItem)

  if (!savedItem) {
    console.log('⚠️ Nessun item da salvare')
    dialogs.item.show = false
    dialogs.item.data = null
    dialogs.item.index = null
    return
  }

  if (dialogs.item.isNew) {
    // ✅ NUOVO ITEM
    console.log('➕ Aggiunta nuovo item')
    orderData.items.push(savedItem)
  } else {
    // ✅ MODIFICA ITEM ESISTENTE
    console.log('✏️ Modifica item all\'indice:', dialogs.item.index)
    console.log('📊 Item PRIMA:', JSON.stringify(orderData.items[dialogs.item.index]))

    // METODO 1: Splice (il più sicuro per la reattività)
    orderData.items.splice(dialogs.item.index, 1, savedItem)

    console.log('📊 Item DOPO:', JSON.stringify(orderData.items[dialogs.item.index]))
  }

  // ✅ FORZARE LA REATTIVITÀ: ricrea completamente l'array
  console.log('🔄 Forzo aggiornamento reattività')
  const itemsBackup = [...orderData.items]
  orderData.items = []
  nextTick(() => {
    orderData.items = itemsBackup
    console.log('✅ Items aggiornati, totale:', orderData.items.length)
  })

  // Notifica successo
  $q.notify({
    type: 'positive',
    message: dialogs.item.isNew ? 'Articolo aggiunto' : 'Articolo modificato',
    timeout: 1500
  })

  // Reset dialog state
  dialogs.item.show = false
  dialogs.item.data = null
  dialogs.item.index = null
}


const handleRemoveItem = (index) => {
  $q.dialog({
    title: 'Conferma',
    message: 'Vuoi rimuovere questo articolo?',
    cancel: true,
    persistent: true
  }).onOk(() => {
    orderData.items.splice(index, 1)
  })
}

const handleEditAgent = () => {
  dialogs.agent.isNew = true
  dialogs.agent.data = {}
  dialogs.agent.show = true
}

const handleAgentDialogClose = (savedAgent) => {
  if (savedAgent) {
    orderData.orderData.agentId = savedAgent._id

    $q.notify({
      type: 'positive',
      message: 'Agente aggiornato',
      timeout: 1500
    })
  }
  dialogs.agent.show = false
}

// Mount
onMounted(() => {
  loadOrder()
})
</script>

<style scoped lang="scss">
.order-edit-page {
  background: $bg-light;
}

.order-edit-container {
  max-width: 1600px;
  margin: 0 auto;
  padding: 16px;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 16px;
  background: $contrast;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  .order-title {
    display: flex;
    align-items: center;
    gap: 12px;

    h5 {
      margin: 0;
      color: $text-primary;
      font-size: 20px;
      font-weight: 600;
    }
  }

  .order-actions {
    display: flex;
    gap: 12px;
  }
}

.order-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

// ✅ Card per la sezione top
.top-section-card {
  background: $contrast;

  .section-header {
    padding: 12px 16px;
    background: $bg-light;

    .header-left {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 600;
      color: $text-primary;
    }

    .collapse-btn {
      margin-right: 4px;
    }
  }
}

.top-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  padding: 16px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
}

// Rimuovo i bordi dalle sotto-sezioni
.top-section :deep(.q-card) {
  border: none;
  box-shadow: none;
}

// Responsive
@media (max-width: 768px) {
  .order-header {
    flex-direction: column;
    gap: 16px;

    .order-title {
      width: 100%;
    }

    .order-actions {
      width: 100%;
      justify-content: flex-end;
    }
  }
}
</style>
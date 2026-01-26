<template>
  <q-page class="order-edit-page">
    <div class="order-edit-container">
      <!-- ✅ HEADER ULTRA-COMPATTO -->
      <div class="order-header-sticky">
        <div class="header-content">
          <div class="header-left">
            <q-btn flat dense round icon="arrow_back" @click="handleBack" size="sm" class="back-btn">
              <q-tooltip>Torna alla lista</q-tooltip>
            </q-btn>

            <span class="commission-info">
              Commissione {{ isNew ? 'Nuova' : orderData.commNum }}
              <span v-if="!isNew && orderData.client" class="separator">•</span>
              <span v-if="!isNew && orderData.client" class="client-name">
                {{ getClientName(orderData.client) }}
              </span>
            </span>
          </div>

          <div class="header-actions">
            <q-btn flat dense label="Fattura" icon="receipt" @click="handleInvoice" :disable="!canCreateInvoice"
              class="action-btn invoice-btn">
              <q-tooltip v-if="!canCreateInvoice">
                Nessun articolo fatturato
              </q-tooltip>
              <q-tooltip v-else>
                Crea fattura da questa commissione
              </q-tooltip>
            </q-btn>

            <q-btn flat dense label="Annulla" @click="handleCancel" class="action-btn cancel-btn" />

            <q-btn flat dense label="Salva" icon="save" @click="handleSave" :loading="saving"
              class="action-btn save-btn" />
          </div>
        </div>
      </div>

      <!-- ✅ SPACER ridotto -->
      <div class="header-spacer"></div>

      <!-- Griglia responsiva principale -->
      <div class="order-grid">
        <!-- SEZIONE CLIENTE + DATI ORDINE CON HEADER UNICO COLLASSABILE -->
        <q-card flat bordered class="top-section-card">
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

          <q-slide-transition>
            <div v-show="!topSectionCollapsed" class="top-section">
              <ClientSection v-model:client="orderData.client" @edit-client="handleEditClient" />
              <OrderDataSection v-model:data="orderData.orderData" @edit-agent="handleEditAgent" />
            </div>
          </q-slide-transition>
        </q-card>

        <!-- Sezione Corrieri + Note + Finanziari -->
        <ShipmentsNotesSection v-model:shipments="orderData.shipments" v-model:notes="orderData.notes"
          v-model:financial="orderData.financial" />

        <!-- Sezione Articoli -->
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
import { ref, reactive, computed, onMounted } from 'vue'
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

// ✅ COMPUTED: Verifica se si può creare fattura
const canCreateInvoice = computed(() => {
  if (!orderData.items || orderData.items.length === 0) {
    return false
  }

  // Controlla se almeno un item ha invoiced > 0
  return orderData.items.some(item => item.invoiced && item.invoiced > 0)
})

// Funzione per mostrare il nome cliente
const getClientName = (client) => {
  if (!client) return ''
  const parts = []
  if (client.lastname) parts.push(client.lastname)
  if (client.firstname) parts.push(client.firstname)
  if (parts.length > 0) return parts.join(' ')
  if (client.company) return client.company
  return ''
}

const loadOrder = async () => {
  if (isNew) return

  try {
    const { data, error } = await useFetch(`/api/orders/${orderId}`)

    if (error.value) {
      throw new Error(error.value.message)
    }

    const order = data.value.order

    orderData.commNum = order.commNum || ''
    orderData.client = order.clientId || null
    orderData.orderData.date = order.date ? new Date(order.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
    orderData.orderData.dueDate = order.dueDate ? new Date(order.dueDate).toISOString().split('T')[0] : null
    orderData.orderData.agentId = order.agentId?._id || null
    orderData.orderData.status = order.status || 'APERTA'

    if (order.shipments && order.shipments.length > 0) {
      orderData.shipments = order.shipments.map(s => ({
        date: s.date ? new Date(s.date).toISOString().split('T')[0] : null,
        courier: s.courier || ''
      }))
    }

    if (order.notes && order.notes.length > 0) {
      orderData.notes = order.notes.map(n => ({ text: n.text || '' }))
    }

    orderData.financial.ca = order.ca || 0
    orderData.financial.rd = order.rd || 0
    orderData.financial.ric = order.ric || 0
    orderData.financial.balance = order.balance || 0
    orderData.financial.pay = order.pay || 0
    orderData.items = order.items || []

  } catch (err) {
    $q.notify({
      type: 'negative',
      message: 'Errore nel caricamento',
      caption: err.message
    })
    router.push('/')
  }
}

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

// ✅ NUOVO: Handler per creare fattura
const handleInvoice = () => {
  if (!canCreateInvoice.value) {
    $q.notify({
      type: 'warning',
      message: 'Nessun articolo fatturato in questa commissione'
    })
    return
  }

  // Naviga alla pagina fattura con il numero commissione
  router.push(`/invoices/edit?commNum=${orderData.commNum}`)
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

const handleItemDialogClose = async (savedItem) => {
  if (!savedItem) {
    dialogs.item.show = false
    dialogs.item.data = null
    dialogs.item.index = null
    return
  }

  if (!orderData.client || !orderData.client._id) {
    $q.notify({
      type: 'negative',
      message: 'Seleziona prima un cliente prima di aggiungere articoli'
    })
    dialogs.item.show = false
    return
  }

  const editIndex = dialogs.item.index

  if (dialogs.item.isNew) {
    orderData.items.push(savedItem)
  } else {
    orderData.items.splice(editIndex, 1, savedItem)
  }

  try {
    saving.value = true

    const endpoint = isNew ? '/api/orders' : `/api/orders/${orderId}`
    const method = isNew ? 'POST' : 'PUT'

    const bodyToSend = {
      commNum: orderData.commNum,
      client: {
        _id: orderData.client._id
      },
      orderData: {
        date: orderData.orderData.date,
        dueDate: orderData.orderData.dueDate,
        agentId: orderData.orderData.agentId,
        status: orderData.orderData.status
      },
      shipments: orderData.shipments,
      notes: orderData.notes,
      items: orderData.items.map(item => ({
        productId: item.productId?._id || item.productId || null,
        code: item.code || '',
        description: item.description || '',
        quantity: item.quantity || 0,
        ready: item.ready || false,
        invoiced: item.invoiced || 0,
        ordered: item.ordered || false,
        note: item.note || ''
      })),
      financial: {
        ca: orderData.financial.ca || 0,
        rd: orderData.financial.rd || 0,
        ric: orderData.financial.ric || 0,
        balance: orderData.financial.balance || 0,
        pay: orderData.financial.pay || 0
      }
    }

    const { data, error } = await useFetch(endpoint, {
      method,
      body: bodyToSend
    })

    if (error.value) {
      throw new Error(error.value.message)
    }

    if (data.value?.order?.items) {
      orderData.items = [...data.value.order.items]
    }

    if (isNew && data.value?.order?._id) {
      const newOrderId = data.value.order._id
      router.replace(`/orders/${newOrderId}`)
      if (data.value.order.commNum) {
        orderData.commNum = data.value.order.commNum
      }
    }

    $q.notify({
      type: 'positive',
      message: dialogs.item.isNew ? 'Articolo aggiunto' : 'Aggiornamento effettuato',
      timeout: 1500
    })

  } catch (err) {
    $q.notify({
      type: 'negative',
      message: 'Errore nel salvataggio automatico',
      caption: err.message
    })

    if (dialogs.item.isNew) {
      orderData.items.pop()
    } else {
      await loadOrder()
    }
  } finally {
    saving.value = false
  }

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

onMounted(() => {
  loadOrder()
})
</script>

<style scoped lang="scss">
.order-edit-page {
  background: $bg-light;
  min-height: 100vh;
}

.order-edit-container {
  max-width: 1600px;
  margin: 0 auto;
  position: relative;
}

// ✅ HEADER ULTRA-COMPATTO (altezza ~40px)
.order-header-sticky {
  position: fixed;
  top: 50px;
  left: 0;
  right: 0;
  z-index: 999;
  background: $sticky-menu;
  border-bottom: 1px solid $border;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);

  .header-content {
    max-width: 1600px;
    margin: 0 auto;
    padding: 8px 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    min-height: 40px;
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 12px;
    flex: 1;
    min-width: 0;

    .back-btn {
      color: $text-primary;
      flex-shrink: 0;
    }

    .commission-info {
      font-size: 15px;
      font-weight: 600;
      color: $text-primary;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      display: flex;
      align-items: center;
      gap: 8px;

      .separator {
        color: $text-secondary;
        font-weight: 400;
      }

      .client-name {
        font-weight: 400;
        color: $text-secondary;
      }
    }
  }

  .header-actions {
    display: flex;
    gap: 4px; // ✅ RIDOTTO da 8px a 4px
    flex-shrink: 0;

    .action-btn {
      font-size: 13px;
      font-weight: 500;
      padding: 6px 16px;
      text-transform: none;
      min-height: 32px;
    }

    .invoice-btn {
      color: $accent;
    }

    .cancel-btn {
      color: $negative;
    }

    .save-btn {
      color: $primary;
    }
  }
}

.header-spacer {
  height: 90px;
}

.order-grid {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

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

.top-section :deep(.q-card) {
  border: none;
  box-shadow: none;
}

@media (max-width: 768px) {
  .order-header-sticky {
    .header-content {
      padding: 6px 12px;
      gap: 8px;
    }

    .header-left {
      gap: 8px;

      .commission-info {
        font-size: 14px;
        flex-direction: column;
        align-items: flex-start;
        gap: 2px;

        .separator {
          display: none;
        }
      }
    }

    .header-actions {
      gap: 3px;

      .action-btn {
        font-size: 12px;
        padding: 5px 12px;
        min-height: 28px;
      }
    }
  }

  .header-spacer {
    height: 100px;
  }
}

@media (max-width: 480px) {
  .order-header-sticky {
    .header-left {
      .commission-info {
        font-size: 13px;

        .client-name {
          font-size: 12px;
        }
      }
    }

    .header-actions {
      flex-wrap: wrap;
      gap: 4px;

      .action-btn {
        min-width: 65px;
      }
    }
  }
}
</style>
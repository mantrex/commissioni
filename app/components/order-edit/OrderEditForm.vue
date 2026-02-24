<template>
  <q-page class="order-edit-page">
    <div class="order-edit-container">
      <!-- HEADER STICKY -->
      <div class="order-header-sticky" @click="handleHeaderClick">
        <div class="header-content">
          <!-- SINISTRA: back + info commissione -->
          <div class="header-left">
            <q-btn
              flat
              dense
              round
              icon="arrow_back"
              @click.stop="handleBack"
              size="sm"
              class="back-btn">
              <q-tooltip>Torna alla lista</q-tooltip>
            </q-btn>
            <span class="order-number-badge">
              <span class="commission-label">Comm.</span>
              {{ orderData.commNum }}
              <span
                v-if="orderData.client || orderData.company"
                class="separator"
                >•</span
              >
              <span v-if="orderData.client" class="client-name">
                {{ getClientName(orderData.client) }}
              </span>
              <span v-else-if="orderData.company" class="client-name">
                {{ orderData.company }}
              </span>
            </span>
          </div>

          <!-- CENTRO: QuickNav sempre visibile -->
          <div class="header-center">
            <QuickNav
              ref="quickNavRef"
              v-model:status="orderData.orderData.status"
              :comm-num="orderData.commNum"
              :status-options="statusOptions"
              :loading="saving"
              @prev="handleNavPrev"
              @next="handleNavNext"
              @jump="handleNavJump"
              @status-change="handleStatusChange" />
          </div>

          <!-- DESTRA: azioni -->
          <div class="header-actions">
            <q-btn
              flat
              dense
              icon="receipt"
              @click.stop="handleInvoice"
              :disable="!canCreateInvoice"
              class="action-btn invoice-btn">
              <span class="btn-label">Fattura</span>
              <q-tooltip>{{
                canCreateInvoice
                  ? "Crea fattura da questa commissione"
                  : "Nessun articolo fatturato"
              }}</q-tooltip>
            </q-btn>
            <q-btn
              flat
              dense
              icon="cancel"
              @click.stop="handleCancel"
              class="action-btn cancel-btn">
              <span class="btn-label">Annulla</span>
            </q-btn>
            <q-btn
              flat
              dense
              icon="save"
              @click.stop="handleSave"
              :loading="saving"
              class="action-btn save-btn">
              <span class="btn-label">Salva</span>
            </q-btn>
          </div>
        </div>
      </div>

      <div class="header-spacer"></div>

      <!-- GRIGLIA PRINCIPALE -->
      <div class="order-grid">
        <!-- Sezione Cliente + Dati Ordine collassabile -->
        <q-card flat bordered class="top-section-card">
          <q-card-section class="section-header">
            <div class="header-left">
              <q-btn
                flat
                dense
                round
                :icon="topSectionCollapsed ? 'expand_more' : 'expand_less'"
                size="sm"
                @click="topSectionCollapsed = !topSectionCollapsed"
                class="collapse-btn">
                <q-tooltip>{{
                  topSectionCollapsed ? "Espandi" : "Comprimi"
                }}</q-tooltip>
              </q-btn>
              <q-icon name="assignment" size="20px" />
              <span>Cliente e Dati Ordine</span>
            </div>
          </q-card-section>

          <q-slide-transition>
            <div v-show="!topSectionCollapsed" class="top-section">
              <ClientSection
                v-model:client="orderData.client"
                @edit-client="handleEditClient" />
              <OrderDataSection
                v-model:data="orderData.orderData"
                v-model:commNum="orderData.commNum"
                @edit-agent="handleEditAgent"
                @edit-comm-num="handleEditCommNum" />
            </div>
          </q-slide-transition>
        </q-card>

        <!-- Spedizioni + Note + Finanziari -->
        <ShipmentsNotesSection
          v-model:shipments="orderData.shipments"
          v-model:notes="orderData.notes"
          v-model:financial="orderData.financial" />

        <!-- Articoli -->
        <ItemsSection
          v-model:items="orderData.items"
          @add-item="handleAddItem"
          @edit-item="handleEditItem"
          @remove-item="handleRemoveItem" />
      </div>
    </div>

    <!-- Dialog Cliente -->
    <ComponentDialog
      v-model="dialogs.client.show"
      :side="true"
      :custom-style="'min-width: 200px; width: 900px; max-width: 1200px'"
      :title="dialogs.client.isNew ? 'Nuovo Cliente' : 'Modifica Cliente'"
      :component-name="ClientDialog"
      :component-props="{ client: dialogs.client.data }"
      @close="handleClientDialogClose" />

    <!-- Dialog Articolo -->
    <ComponentDialog
      v-model="dialogs.item.show"
      :side="true"
      :custom-style="'min-width: 200px; width: 800px; max-width: 1000px'"
      :title="dialogs.item.isNew ? 'Nuovo Articolo' : 'Modifica Articolo'"
      :component-name="ItemDialog"
      :component-props="{ item: dialogs.item.data }"
      @close="handleItemDialogClose" />

    <!-- Dialog Agente -->
    <ComponentDialog
      v-model="dialogs.agent.show"
      :side="true"
      :custom-style="'min-width: 200px; width: 600px; max-width: 800px'"
      :title="dialogs.agent.isNew ? 'Nuovo Agente' : 'Modifica Agente'"
      :component-name="AgentDialog"
      :component-props="{ agent: dialogs.agent.data }"
      @close="handleAgentDialogClose" />

    <!-- Dialog Modifica Numero Commissione -->
    <ComponentDialog
      :side="true"
      v-model="dialogs.commNum.show"
      title="Modifica Numero Commissione"
      :component-name="NewOrderDialog"
      :component-props="{}"
      custom-style="width: 440px"
      @close="handleCommNumDialogClose" />

    <!-- Dialog conferma rimozione articolo -->
    <ComponentDialog
      v-model="dialogs.removeItem.show"
      title="Conferma rimozione"
      :component-name="GenericWarning"
      :component-props="{
        message: 'Vuoi rimuovere questo articolo dalla commissione?',
        icon: 'delete',
        iconColor: 'negative',
        confirmLabel: 'Rimuovi',
        confirmColor: 'negative',
        confirmIcon: 'delete',
        cancelLabel: 'Annulla',
      }"
      custom-style="width: 400px"
      @close="handleRemoveItemConfirm" />

    <!-- Dialog conferma annulla modifiche -->
    <ComponentDialog
      v-model="dialogs.cancel.show"
      title="Annulla modifiche"
      :component-name="GenericWarning"
      :component-props="{
        message: 'Vuoi annullare le modifiche e tornare alla lista?',
        icon: 'warning',
        iconColor: 'warning',
        confirmLabel: 'Sì, esci',
        confirmColor: 'negative',
        cancelLabel: 'Rimani',
      }"
      custom-style="width: 400px"
      @close="handleCancelConfirm" />
    <ComponentDialog
      :side="true"
      v-model="dialogs.invoices.show"
      title="Fatture Commissione"
      :component-name="OrderInvoicesDialog"
      :component-props="{ commNum: orderData.commNum, orderId: orderId }"
      custom-style="width: 500px"
      @close="handleInvoiceDialogClose" />
  </q-page>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, nextTick } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useQuasar } from "quasar";
import ComponentDialog from "~/components/common/ComponentDialog.vue";
import GenericWarning from "~/components/common/GenericWarning.vue";
import QuickNav from "~/components/common/QuickNav.vue";
import ClientSection from "./ClientSection.vue";
import OrderDataSection from "./OrderDataSection.vue";
import ShipmentsNotesSection from "./ShipmentsNotesSection.vue";
import ItemsSection from "./ItemsSection.vue";
import ClientDialog from "./ClientDialog.vue";
import ItemDialog from "./ItemDialog.vue";
import AgentDialog from "./AgentDialog.vue";
import NewOrderDialog from "~/components/orders/NewOrderDialog.vue";
import { getConfigValue, isConfigActive } from "#shared/config";
import OrderInvoicesDialog from "~/components/invoices/OrderInvoicesDialog.vue";

// ─── Autosave ───
const autosaveEnabled = isConfigActive("AUTOSAVE_ORDERS");
const autosaveSeconds = getConfigValue("AUTOSAVE_ORDERS");
let autosaveTimer = null;

const router = useRouter();
const route = useRoute();
const $q = useQuasar();

const orderId = route.params.id;
const isNew = !orderId || orderId === "new";
const saving = ref(false);
const topSectionCollapsed = ref(false);
const quickNavRef = ref(null);

const presetCommNum = route.query.commNum || "";

// Statuses
const statusOptions = ref([]);
const { statuses: allStatuses, loadStatuses } = useStatuses();

// Dati ordine
const orderData = reactive({
  commNum: presetCommNum,
  client: null,
  invoices: { show: false },
  orderData: {
    date: new Date().toISOString().split("T")[0],
    dueDate: null,
    agentId: null,
    status: "APERTA",
  },
  shipments: Array(3)
    .fill(null)
    .map(() => ({ date: null, courier: "" })),
  notes: Array(5)
    .fill(null)
    .map(() => ({ text: "" })),
  financial: { ca: 0, rd: 0, ric: 0, balance: 0, pay: 0 },
  items: [],
});

// Dialogs
const dialogs = reactive({
  client: { show: false, isNew: false, data: null },
  item: { show: false, isNew: false, data: null, index: null },
  agent: { show: false, isNew: false, data: null },
  commNum: { show: false },
  removeItem: { show: false, pendingIndex: null },
  cancel: { show: false },
  invoices: {show:false},
});

// ─── Computed ───
const canCreateInvoice = computed(() =>
  orderData.items?.some((item) => item.invoiced && item.invoiced > 0),
);

const getClientName = (client) => {
  if (!client) return "";
  const parts = [];
  if (client.lastname) parts.push(client.lastname);
  if (client.firstname) parts.push(client.firstname);
  return parts.length > 0 ? parts.join(" ") : client.company || "";
};

// ─── Click header → focus QuickNav ───
const handleHeaderClick = () => {
  quickNavRef.value?.focus();
};

// ─── Build body (condiviso) ───
const buildBody = () => ({
  commNum: orderData.commNum,
  client: orderData.client?._id ? { _id: orderData.client._id } : undefined,
  orderData: {
    date: orderData.orderData.date,
    dueDate: orderData.orderData.dueDate,
    agentId: orderData.orderData.agentId,
    status: orderData.orderData.status,
  },
  shipments: orderData.shipments,
  notes: orderData.notes,
  items: orderData.items.map((item) => ({
    productId: item.productId?._id || item.productId || null,
    code: item.code || "",
    description: item.description || "",
    quantity: item.quantity || 0,
    ready: item.ready ?? false,
    invoiced: item.invoiced ?? 0,
    ordered: item.ordered ?? false,
    note: item.note || "",
  })),
  financial: {
    ca: orderData.financial.ca || 0,
    rd: orderData.financial.rd || 0,
    ric: orderData.financial.ric || 0,
    balance: orderData.financial.balance || 0,
    pay: orderData.financial.pay || 0,
  },
});

// ─── Load ───
const loadOrder = async () => {
  if (isNew) return;
  try {
    const { data, error } = await useFetch(`/api/orders/${orderId}`);
    if (error.value) throw new Error(error.value.message);

    const order = data.value.order;
    orderData.commNum = order.commNum || "";
    orderData.client = order.clientId || null;
    orderData.orderData.date = order.date
      ? new Date(order.date).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0];
    orderData.orderData.dueDate = order.dueDate
      ? new Date(order.dueDate).toISOString().split("T")[0]
      : null;
    orderData.orderData.agentId = order.agentId?._id || null;
    orderData.orderData.status = order.status || "APERTA";

    if (order.shipments?.length > 0) {
      orderData.shipments = order.shipments.map((s) => ({
        date: s.date ? new Date(s.date).toISOString().split("T")[0] : null,
        courier: s.courier || "",
      }));
    }
    if (order.notes?.length > 0) {
      orderData.notes = order.notes.map((n) => ({ text: n.text || "" }));
    }
    orderData.financial.ca = order.ca || 0;
    orderData.financial.rd = order.rd || 0;
    orderData.financial.ric = order.ric || 0;
    orderData.financial.balance = order.balance || 0;
    orderData.financial.pay = order.pay || 0;
    orderData.items = order.items || [];
  } catch (err) {
    $q.notify({
      type: "negative",
      message: "Errore nel caricamento",
      caption: err.message,
    });
    router.push("/");
  }
};

// ─── Save (silent = niente notify, usato dalla nav) ───
const handleSave = async (silent = false) => {
  saving.value = true;
  try {
    const endpoint = isNew ? "/api/orders" : `/api/orders/${orderId}`;
    const method = isNew ? "POST" : "PUT";

    const { data, error } = await useFetch(endpoint, {
      method,
      body: buildBody(),
    });
    if (error.value) throw new Error(error.value.message);

    if (isNew && data.value?.order?._id) {
      router.replace(`/orders/${data.value.order._id}`);
      if (data.value.order.commNum)
        orderData.commNum = data.value.order.commNum;
    }

    if (!silent) {
      $q.notify({ type: "positive", message: "Ordine salvato con successo" });
    }
  } catch (err) {
    $q.notify({
      type: "negative",
      message: "Errore nel salvataggio",
      caption: err.message,
    });
  } finally {
    saving.value = false;
  }
};

// ─── Nav handlers (ricevuti da QuickNav) ───
const saveAndNavigate = async (targetId) => {
  // Salva sempre, anche se nuovo (il commNum esiste già)
  await handleSave(true);
  router.push(`/orders/${targetId}`);
};

const handleNavPrev = async (prevOrder) => {
  await saveAndNavigate(prevOrder.id);
};

const handleNavNext = async (nextOrder) => {
  await saveAndNavigate(nextOrder.id);
};

const handleNavJump = async (commNumStr) => {
  try {
    const data = await $fetch(`/api/orders/by-commnum/${commNumStr}`);
    if (data?.order?._id) {
      await saveAndNavigate(data.order._id);
    } else {
      $q.notify({
        type: "warning",
        message: `Commissione "${commNumStr}" non trovata`,
      });
    }
  } catch {
    $q.notify({
      type: "warning",
      message: `Commissione "${commNumStr}" non trovata`,
    });
  }
};

const handleStatusChange = async () => {
  if (!isNew) {
    await handleSave(true);
    $q.notify({ type: "positive", message: "Stato aggiornato", timeout: 1000 });
  }
};

// ─── Navigation ───
const handleBack = () => router.push("/");
const handleCancel = () => {
  dialogs.cancel.show = true;
};
const handleCancelConfirm = (confirmed) => {
  if (confirmed) router.push("/");
};

// ─── Fattura ───
const handleInvoice = () => {
  dialogs.invoices.show = true;
};

const handleInvoiceDialogClose = (result) => {
  dialogs.invoices.show = false;
  if (!result) return;
  router.push({
    path: "/invoices/new",
    query: {
      invoiceId: result.invoiceId,
      invoiceType: result.invoiceType,
      invoiceNumber: result.invoiceNumber,
      invoiceYear: result.invoiceYear,
      commNum: result.commNum,
      orderId: result.orderId,
    },
  });
};

// ─── CommNum ───
const handleEditCommNum = () => {
  dialogs.commNum.show = true;
};
const handleCommNumDialogClose = (newCommNum) => {
  if (newCommNum) orderData.commNum = newCommNum;
};

// ─── Cliente ───
const handleEditClient = () => {
  dialogs.client.isNew = !orderData.client;
  dialogs.client.data = orderData.client || {};
  dialogs.client.show = true;
};
const handleClientDialogClose = (savedClient) => {
  if (savedClient) orderData.client = savedClient;
};

// ─── Articoli ───
const handleAddItem = () => {
  dialogs.item.isNew = true;
  dialogs.item.data = {};
  dialogs.item.index = null;
  dialogs.item.show = true;
};

const handleEditItem = (item, index) => {
  dialogs.item.isNew = false;
  dialogs.item.data = { ...item };
  dialogs.item.index = index;
  dialogs.item.show = true;
};

const handleItemDialogClose = async (savedItem) => {
  if (!savedItem) return;

  if (!orderData.client?._id) {
    $q.notify({
      type: "negative",
      message: "Seleziona prima un cliente prima di aggiungere articoli",
    });
    return;
  }

  const editIndex = dialogs.item.index;
  if (dialogs.item.isNew) {
    orderData.items.push(savedItem);
  } else {
    orderData.items.splice(editIndex, 1, savedItem);
  }

  try {
    saving.value = true;
    const endpoint = isNew ? "/api/orders" : `/api/orders/${orderId}`;
    const method = isNew ? "POST" : "PUT";

    const { data, error } = await useFetch(endpoint, {
      method,
      body: buildBody(),
    });
    if (error.value) throw new Error(error.value.message);

    if (data.value?.order?.items) orderData.items = [...data.value.order.items];
    if (isNew && data.value?.order?._id) {
      router.replace(`/orders/${data.value.order._id}`);
      if (data.value.order.commNum)
        orderData.commNum = data.value.order.commNum;
    }

    $q.notify({
      type: "positive",
      message: dialogs.item.isNew
        ? "Articolo aggiunto"
        : "Aggiornamento effettuato",
      timeout: 1500,
    });
  } catch (err) {
    $q.notify({
      type: "negative",
      message: "Errore nel salvataggio automatico",
      caption: err.message,
    });
    if (dialogs.item.isNew) {
      orderData.items.pop();
    } else {
      await loadOrder();
    }
  } finally {
    saving.value = false;
    dialogs.item.data = null;
    dialogs.item.index = null;
  }
};

const handleRemoveItem = (index) => {
  dialogs.removeItem.pendingIndex = index;
  dialogs.removeItem.show = true;
};

const handleRemoveItemConfirm = (confirmed) => {
  if (confirmed && dialogs.removeItem.pendingIndex !== null) {
    orderData.items.splice(dialogs.removeItem.pendingIndex, 1);
  }
  dialogs.removeItem.pendingIndex = null;
};

// ─── Agente ───
const handleEditAgent = () => {
  dialogs.agent.isNew = true;
  dialogs.agent.data = {};
  dialogs.agent.show = true;
};

const handleAgentDialogClose = (savedAgent) => {
  if (savedAgent) {
    orderData.orderData.agentId = savedAgent._id;
    $q.notify({
      type: "positive",
      message: "Agente aggiornato",
      timeout: 1500,
    });
  }
};

const startAutosave = () => {
  if (!autosaveEnabled) return;
  autosaveTimer = setInterval(async () => {
    const anyDialogOpen = Object.values(dialogs).some((d) => d.show);
    if (saving.value || !orderData.client?._id || anyDialogOpen) return;
    await handleSave(true);
    $q.notify({
      message: "",
      icon: "sync",
      color: "grey-7",
      position: "bottom-left",
      timeout: 1500,
    });
  }, autosaveSeconds * 1000);
};

const stopAutosave = () => {
  if (autosaveTimer) {
    clearInterval(autosaveTimer);
    autosaveTimer = null;
  }
};

onMounted(async () => {
  await loadOrder();
  await loadStatuses();
  statusOptions.value = allStatuses.value;
  startAutosave();
  await nextTick();
  quickNavRef.value?.focus();
});

onUnmounted(() => {
  stopAutosave();
});
</script>

<style scoped lang="scss">
.order-number-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 10px;
  background: $primary;
  color: white;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 1.5px;
}

.order-edit-page {
  background: $bg-light;
  min-height: 100vh;
}

.order-edit-container {
  max-width: 1600px;
  margin: 0 auto;
  position: relative;
}

.order-header-sticky {
  position: fixed;
  top: 50px;
  left: 0;
  right: 0;
  z-index: 999;
  background: $sticky-menu;
  border-bottom: 1px solid $border;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  cursor: default;

  .header-content {
    max-width: 1600px;
    margin: 0 auto;
    padding: 4px 16px;
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    gap: 12px;
    min-height: 40px;
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 12px;
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

      .commission-label {
        @media (max-width: 1100px) {
          display: none;
        }
      }
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

  .header-center {
    display: flex;
    justify-content: center;
  }

  .header-actions {
    display: flex;
    gap: 4px;
    justify-content: flex-end;

    .action-btn {
      font-size: 13px;
      font-weight: 500;
      padding: 4px 12px;
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

  // ── RESPONSIVE: sotto 750px ──
  // Layout diventa: [← N° · ] [icone a destra]
  // spariscono: client-name, commission-label, frecce nav, status
  @media (max-width: 750px) {
    .header-content {
      grid-template-columns: auto 1fr auto; // back+num | input | icone
    }

    .commission-info {
      .commission-label,
      .separator,
      .client-name {
        display: none;
      }
    }

    // Nasconde frecce e status dentro QuickNav
    :deep(.nav-only) {
      display: none !important;
    }

    // Icone azioni: solo icona, niente label
    .action-btn {
      padding: 4px 6px;
      .btn-label {
        display: none;
      }
    }
  }
}

.header-spacer {
  height: 40px;
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
      padding: 4px 8px;
      gap: 6px;
    }
    .commission-info {
      font-size: 13px;
    }
    .header-actions .action-btn {
      font-size: 12px;
      padding: 4px 6px;
      min-height: 28px;
    }
  }
  .header-spacer {
    height: 48px;
  }
}

@media (max-width: 600px) {
  .order-header-sticky .header-center {
    display: none;
  }
}
</style>

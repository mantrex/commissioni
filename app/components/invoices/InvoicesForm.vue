<template>
  <div class="invoice-edit-container">
    <!-- ✅ HEADER STICKY -->
    <div class="invoice-header-sticky">
      <div class="header-content">
        <div class="header-left">
          <div v-if="invoiceData.invoiceId" class="invoice-number-badge">
            <q-icon name="receipt_long" size="14px" />
            <span>{{ invoiceData.invoiceId }}</span>
          </div>
          <q-btn
            flat
            dense
            round
            icon="arrow_back"
            @click="handleBack"
            size="sm"
            class="back-btn">
            <q-tooltip>Torna indietro</q-tooltip>
          </q-btn>
          <span class="invoice-info">
            Fattura {{ isNew ? "Nuova" : invoiceData.invoiceId }}
            <span v-if="displayCommNum" class="separator">•</span>
            <span v-if="displayCommNum" class="comm-ref"
              >Comm. {{ displayCommNum }}</span
            >
          </span>
        </div>
        <div class="header-actions">
          <q-btn
            flat
            dense
            label="Stampa"
            icon="print"
            @click="handlePrint"
            :disable="isNew"
            class="action-btn print-btn">
            <q-tooltip v-if="isNew"
              >Salva prima la fattura per stamparla</q-tooltip
            >
          </q-btn>
          <q-btn
            flat
            dense
            label="Annulla"
            @click="handleCancel"
            class="action-btn cancel-btn" />
          <q-btn
            flat
            dense
            label="Salva"
            icon="save"
            @click="handleSave"
            :loading="saving"
            class="action-btn save-btn" />
        </div>
      </div>
    </div>

    <!-- Spacer -->
    <div class="header-spacer"></div>

    <!-- 
    ========================================
    🎯 LAYOUT: 3 COLONNE 
    ========================================
    Colonna 1: ClientData + PackingData
    Colonna 2: InvoiceData + Receipts + FinancialTotal
    Colonna 3: ShippingLabel
    Full-width: InvoiceItems
    ======================================== 
    -->
    <div class="top-section">
      <!-- COLONNA 1 -->
      <div class="left-column">
        <ClientData v-model:client="invoiceData.client" />
      </div>

      <!-- COLONNA 2 -->
      <div class="middle-column">
        <InvoiceData v-model:data="invoiceData.invoiceData" />
        <!--<Receipts v-model:receipts="invoiceData.receipts" />-->
        <FinancialTotal v-model:financial="invoiceData.financial" />
      </div>

      <div class="right-column">
        <!--<ShippingLabel v-model:label="invoiceData.shippingLabel" />-->
        <PackingData
          v-model:packing="invoiceData.packing"
          v-model:packages="invoiceData.packages" />
      </div>
    </div>

    <div class="q-mt-md">
      <InvoiceItems
        v-model:items="invoiceData.items"
        @update:taxable="handleTaxableUpdate"
        @auto-save="handleAutoSave" />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useQuasar } from "quasar";
import ClientData from "~/components/invoice-edit/ClientData.vue";
import InvoiceData from "~/components/invoice-edit/InvoiceData.vue";
import ShippingLabel from "~/components/invoice-edit/ShippingLabel.vue";
import PackingData from "~/components/invoice-edit/PackingData.vue";
import Receipts from "~/components/invoice-edit/Receipts.vue";
import FinancialTotal from "~/components/invoice-edit/FinancialTotal.vue";
import InvoiceItems from "~/components/invoice-edit/InvoiceItems.vue";

const props = defineProps({
  mode: {
    type: String,
    required: true,
    validator: (v) => ["new", "edit"].includes(v),
  },
  invoiceId: { type: String, default: null },
  commNum: { type: String, default: null },
  presetInvoiceId: { type: String, default: null },
  presetInvoiceType: { type: String, default: "E" },
  presetInvoiceNumber: { type: Number, default: null },
  presetInvoiceYear: { type: Number, default: null },
});

const router = useRouter();
const $q = useQuasar();
const saving = ref(false);

const isNew = computed(() => props.mode === "new");
const displayCommNum = computed(
  () => props.commNum || invoiceData.invoiceData.commNum,
);

const invoiceData = reactive({
  invoiceId: "",
  invoiceType: "E",
  invoiceNumber: null,
  invoiceYear: null,
  invoiceData: {
    invoiceDate: new Date().toISOString().split("T")[0],
    orderId: null,
    commNum: props.commNum || null,
    payment: "",
    shipping: "",
    insurance: "",
    notes: "",
    issued: false,
  },
  client: {
    clientId: null,
    firstname: "",
    lastname: "",
    title: "",
    company: "",
    address: "",
    cap: "",
    city: "",
    region: "",
    state: "",
    tel: "",
    piva: "",
  },
  receipts: [],
  items: [],
  financial: {
    taxable: 0,
    hasVat: true,
    vatRate: 22,
    vatAmount: 0,
    total: 0,
    deposit: 0,
    cod: 0,
  },
  packing: {
    made: "",
    whoMakes: "",
    numPackages: 0,
    packageSize: "",
    grossWeight: 0,
    netWeight: 0,
    conai: "",
  },
  packages: [],
  shippingLabel: {
    line1: "",
    line2: "",
    line3: "",
    line4: "",
    tel: "",
    content: "",
    netWeight: "",
    grossWeight: "",
  },
});

// ✅ Handler per aggiornare imponibile da InvoiceItems
const handleTaxableUpdate = (newTaxable) => {
  invoiceData.financial.taxable = newTaxable;
};

const loadInvoice = async () => {
  if (isNew.value && !props.commNum) return;
  if (isNew.value && props.presetInvoiceId) {
    invoiceData.invoiceId = props.presetInvoiceId;
    invoiceData.invoiceType = props.presetInvoiceType;
    invoiceData.invoiceNumber = props.presetInvoiceNumber;
    invoiceData.invoiceYear = props.presetInvoiceYear;
  }
  try {
    if (!isNew.value && props.invoiceId) {
      const { data, error } = await useFetch(
        `/api/invoices/${props.invoiceId}`,
      );
      if (error.value) throw new Error(error.value.message);
      populateInvoiceData(data.value.invoice);
    } else if (props.commNum) {
      const { data, error } = await useFetch(
        `/api/orders/by-commnum/${props.commNum}`,
      );
      if (error.value) throw new Error(error.value.message);
      populateFromOrder(data.value.order);
    }
  } catch (err) {
    $q.notify({
      type: "negative",
      message: "Errore caricamento",
      caption: err.message,
    });
  }
};

const populateInvoiceData = (invoice) => {
  invoiceData.invoiceId = invoice.invoiceId || "";
  invoiceData.invoiceType = invoice.invoiceType || "E";
  invoiceData.invoiceNumber = invoice.invoiceNumber || null;
  invoiceData.invoiceYear = invoice.invoiceYear || null;
  invoiceData.invoiceData.invoiceDate = invoice.invoiceDate
    ? new Date(invoice.invoiceDate).toISOString().split("T")[0]
    : new Date().toISOString().split("T")[0];
  invoiceData.invoiceData.orderId = invoice.orderId;
  invoiceData.invoiceData.commNum = invoice.commNum;
  invoiceData.invoiceData.payment = invoice.payment || "";
  invoiceData.invoiceData.shipping = invoice.shipping || "";
  invoiceData.invoiceData.insurance = invoice.insurance || "";
  invoiceData.invoiceData.notes = invoice.notes || "";
  invoiceData.invoiceData.issued = invoice.issued || false;
  invoiceData.client = { ...invoice.client };
  invoiceData.receipts =
    invoice.receipts && invoice.receipts.length > 0 ? invoice.receipts : [];
  invoiceData.items = invoice.items || [];
  invoiceData.financial = {
    taxable: invoice.taxable || 0,
    hasVat: invoice.hasVat ?? true,
    vatRate: invoice.vatRate || 22,
    vatAmount: invoice.vatAmount || 0,
    total: invoice.total || 0,
    deposit: invoice.deposit || 0,
    cod: invoice.cod || 0,
  };
  invoiceData.packing = invoice.packing || {};
  invoiceData.packages = invoice.packages || [];
  invoiceData.shippingLabel = invoice.shippingLabel || {};
};

const populateFromOrder = (order) => {
  if (order.clientId) {
    invoiceData.client = {
      clientId: order.clientId._id,
      firstname: order.clientId.firstname || "",
      lastname: order.clientId.lastname || "",
      title: "",
      company: order.clientId.company || "",
      address: order.clientId.address || "",
      cap: order.clientId.cap || "",
      city: order.clientId.city || "",
      region: order.clientId.region || "",
      state: order.clientId.state || "",
      tel: order.clientId.tel || "",
      piva: order.clientId.piva || "",
    };
  }

  invoiceData.invoiceData.orderId = order._id;
  invoiceData.invoiceData.commNum = order.commNum;

  if (order.items && order.items.length > 0) {
    invoiceData.items = order.items
      .filter((item) => item.invoiced)
      .map((item) => ({
        productId: item.productId?._id || item.productId || null,
        orderItemId: item._id,
        code: item.productId?.code || item.code || "",
        description: item.productId?.name || item.description || "",
        quantity: item.quantity || 0,
        unitPrice: 0,
      }));
  }
};

const handleBack = () => {
  // ✅ Controlla se orderId è un oggetto (populated) o una stringa
  const orderIdValue =
    invoiceData.invoiceData.orderId?._id || invoiceData.invoiceData.orderId;

  if (orderIdValue) {
    router.push(`/orders/${orderIdValue}`);
  } else {
    router.push("/invoices");
  }
};

const handleCancel = () => {
  $q.dialog({
    title: "Conferma",
    message: "Vuoi annullare le modifiche?",
    cancel: true,
    persistent: true,
  }).onOk(() => handleBack());
};

const handlePrint = async () => {
  await handleSave();
  if (!isNew.value && props.invoiceId) {
    router.push(`/invoices/print/${props.invoiceId}`);
  }
};

const handleSave = async () => {
  saving.value = true;
  try {
    const payload = {
      invoiceData: invoiceData.invoiceData,
      invoiceId: invoiceData.invoiceId,
      invoiceType: invoiceData.invoiceType,
      invoiceNumber: invoiceData.invoiceNumber,
      invoiceYear: invoiceData.invoiceYear,
      client: invoiceData.client,
      receipts: invoiceData.receipts.filter((r) => r.number),
      items: invoiceData.items,
      financial: invoiceData.financial,
      packing: invoiceData.packing,
      packages: invoiceData.packages,
      shippingLabel: invoiceData.shippingLabel,
    };

    if (isNew.value) {
      const { data, error } = await useFetch("/api/invoices", {
        method: "POST",
        body: payload,
      });

      if (error.value) throw new Error(error.value.message);

      $q.notify({ type: "positive", message: "Fattura creata" });

      if (data.value?.invoice?._id) {
        invoiceData.invoiceId = data.value.invoice.invoiceId;
        router.replace(`/invoices/edit?id=${data.value.invoice._id}`);
      }
    } else {
      const { data, error } = await useFetch(
        `/api/invoices/${props.invoiceId}`,
        {
          method: "PUT",
          body: payload,
        },
      );

      if (error.value) throw new Error(error.value.message);

      $q.notify({ type: "positive", message: "Fattura salvata" });

      if (data.value?.invoice) {
        populateInvoiceData(data.value.invoice);
      }
    }
  } catch (err) {
    $q.notify({
      type: "negative",
      message: "Errore salvataggio",
      caption: err.message,
    });
  } finally {
    saving.value = false;
  }
};

// Nello script
const handleAutoSave = async () => {
  if (isNew.value) return; // Non salvare se è nuova

  console.log("🔄 Auto-save items...");

  try {
    const payload = {
      invoiceData: invoiceData.invoiceData,
      client: invoiceData.client,
      receipts: invoiceData.receipts.filter((r) => r.number),
      items: invoiceData.items,
      financial: invoiceData.financial,
      packing: invoiceData.packing,
      packages: invoiceData.packages,
      shippingLabel: invoiceData.shippingLabel,
    };

    const { data, error } = await $fetch(`/api/invoices/${props.invoiceId}`, {
      method: "PUT",
      body: payload,
    });

    if (error) throw error;

    console.log("✅ Auto-save completato");
  } catch (err) {
    console.error("❌ Errore auto-save:", err);
  }
};

onMounted(async () => {
  await loadInvoice();
});
</script>

<style scoped lang="scss">
@use "sass:color";

.invoice-edit-container {
  max-width: 1600px;
  margin: 0 auto;
  position: relative;
}

.invoice-header-sticky {
  position: fixed;
  top: 50px;
  left: 0;
  right: 0;
  z-index: 999;
  background: $sticky-menu;
  border-bottom: 1px solid $border;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  .header-content {
    max-width: 1650px;
    margin: 0 auto;
    padding: 8px 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .header-left {
      display: flex;
      align-items: center;
      gap: 12px;

      .invoice-number-badge {
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
      
      .invoice-info {
        font-weight: 600;
        font-size: 16px;
        color: $text-primary;

        .separator {
          margin: 0 8px;
          color: $text-secondary;
        }

        .comm-ref {
          color: $primary;
        }
      }
    }

    .header-actions {
      display: flex;
      gap: 8px;

      .action-btn {
        font-size: 13px;
        padding: 6px 16px;
        text-transform: none; // ✅ AGGIUNGI: no uppercase
        font-weight: 500; // ✅ AGGIUNGI
      }

      .save-btn {
        color: $primary;

        &:hover {
          background: color.adjust($primary, $lightness: -10%);
        }
      }

      .cancel-btn {
        // ✅ AGGIUNGI QUESTA CLASSE
        color: $negative;

        &:hover {
          background: rgba($negative, 0.1);
        }
      }

      .print-btn {
        background: transparent;
        color: $accent;
        // ✅ RIMUOVI IL BORDER (non c'è già)

        &:hover:not(:disabled) {
          background: rgba($primary, 0.1);
        }

        &:disabled {
          opacity: 0.5;
        }
      }
    }
  }
}

.header-spacer {
  height: 60px;
}

.top-section {
  display: grid;
  grid-template-columns: 450px 1fr 1fr;
  gap: 8px;
  margin-bottom: 8px;
}

.left-column,
.middle-column,
.right-column {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

@media (max-width: 1400px) {
  .top-section {
    grid-template-columns: 1fr 1fr;
  }

  .right-column {
    grid-column: span 2;
  }
}

@media (max-width: 768px) {
  .top-section {
    grid-template-columns: 1fr;
  }

  .invoice-header-sticky .header-content {
    flex-direction: column;
    gap: 8px;

    .header-left,
    .header-actions {
      width: 100%;
    }

    .header-actions {
      justify-content: flex-end;
    }
  }

  .header-spacer {
    height: 100px;
  }
}
</style>

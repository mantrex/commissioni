<template>
  <div class="print-page">
    <!-- Barra azioni (solo schermo, non in stampa) -->
    <div class="print-toolbar no-print">
      <q-btn
        flat
        dense
        icon="arrow_back"
        label="Chiudi"
        @click="$router.back()" />
      <span class="toolbar-title">Commissione {{ order?.commNum }}</span>
      <q-btn
        color="primary"
        icon="print"
        label="Stampa"
        unelevated
        @click="handlePrint" />
    </div>

    <div v-if="loading" class="flex flex-center q-pa-xl">
      <q-spinner size="48px" color="primary" />
    </div>

    <div v-else-if="order" class="print-body">
      <!-- ══ HEADER ══ -->
      <div class="p-header">
        <div class="p-header-left">
          <div class="p-commnum">
            Commissione n. <strong>{{ order.commNum }}</strong>
          </div>
          <div class="p-status">{{ order.status || "—" }}</div>
        </div>
        <div class="p-header-right">
          <div class="p-date-row">
            <span class="p-label">Data:</span>
            <span class="p-value">{{ formatDate(order.date) }}</span>
          </div>
          <div class="p-date-row">
            <span class="p-label">Scadenza:</span>
            <span class="p-value p-bold">{{
              formatDate(order.dueDate) || "—"
            }}</span>
          </div>
          <div class="p-date-row" v-if="order.agentId">
            <span class="p-label">Agente:</span>
            <span class="p-value">{{ agentName }}</span>
          </div>
        </div>
      </div>

      <div class="p-divider"></div>

      <!-- ══ SEZIONE PRINCIPALE: Cliente + Note/Corrieri ══ -->
      <div class="p-main-section">
        <!-- Cliente -->
        <div class="p-client-box">
          <div class="p-section-title">Cliente</div>
          <div class="p-client-name">{{ clientFullName }}</div>
          <div v-if="order.clientId?.company" class="p-client-company">
            {{ order.clientId.company }}
          </div>
          <div v-if="order.clientId?.address" class="p-client-line">
            {{ order.clientId.address }}
          </div>
          <div
            v-if="order.clientId?.city || order.clientId?.state"
            class="p-client-line">
            <span v-if="order.clientId?.cap">{{ order.clientId.cap }} </span>
            <span v-if="order.clientId?.city">{{ order.clientId.city }}</span>
            <span v-if="order.clientId?.state">
              — {{ order.clientId.state }}</span
            >
          </div>
          <div v-if="order.clientId?.tel" class="p-client-line">
            Tel: {{ order.clientId.tel }}
          </div>
          <div v-if="order.clientId?.piva" class="p-client-line">
            P.IVA: {{ order.clientId.piva }}
          </div>
          <div v-if="order.clientId?.vip" class="p-vip-badge">★ VIP</div>
        </div>

        <!-- Note e Corrieri affiancati -->
        <div class="p-notes-shipping">
          <!-- Corrieri -->
          <div class="p-sub-box" v-if="activeShipments.length">
            <div class="p-section-title">Corrieri</div>
            <table class="p-shipments-table">
              <tr v-for="(s, i) in activeShipments" :key="i">
                <td class="p-ship-num">{{ i + 1 }}</td>
                <td class="p-ship-date">{{ formatDate(s.date) }}</td>
                <td class="p-ship-courier">{{ s.courier }}</td>
              </tr>
            </table>
          </div>

          <!-- Note -->
          <div class="p-sub-box p-notes-box" v-if="activeNotes.length">
            <div class="p-section-title">Note</div>
            <div v-for="(n, i) in activeNotes" :key="i" class="p-note-item">
              <span class="p-note-num">{{ i + 1 }}.</span>
              <span class="p-note-text">{{ n.text }}</span>
            </div>
          </div>
        </div>

        <!-- Dati Finanziari -->
        <div class="p-financial-box">
          <div class="p-section-title">Dati Finanziari</div>
          <table class="p-fin-table">
            <tbody>
              <tr>
                <td class="p-fin-label">C/A</td>
                <td class="p-fin-value">{{ formatNum(order.ca) }}</td>
              </tr>
              <tr>
                <td class="p-fin-label">RD</td>
                <td class="p-fin-value">{{ formatNum(order.rd) }}</td>
              </tr>
              <tr>
                <td class="p-fin-label">Ric.</td>
                <td class="p-fin-value">{{ formatNum(order.ric) }}</td>
              </tr>
              <tr class="p-fin-saldo-row">
                <td class="p-fin-label">Saldo</td>
                <td class="p-fin-value p-bold">
                  {{ formatNum(order.balance) }}
                </td>
              </tr>
              <tr>
                <td colspan="2" class="p-fin-sep"></td>
              </tr>
              <tr>
                <td class="p-fin-label">Pag.</td>
                <td class="p-fin-value">{{ formatNum(order.pay) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="p-divider"></div>

      <!-- ══ ARTICOLI ══ -->
      <div class="p-items-section" v-if="order.items?.length">
        <div class="p-section-title p-items-title">
          Articoli ({{ order.items.length }})
        </div>
        <table class="p-items-table">
          <thead>
            <tr>
              <th class="col-cod">Cod. Art.</th>
              <th class="col-desc">Descrizione</th>
              <th class="col-qty">Q.</th>
              <th class="col-flag">Pronto</th>
              <th class="col-flag">Ord.</th>
              <th class="col-flag">Fatt.</th>
              <th class="col-note">Nota</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(item, i) in order.items"
              :key="i"
              :class="i % 2 === 0 ? 'row-even' : 'row-odd'">
              <td class="col-cod">
                {{ item.productId?.code || item.code || "—" }}
              </td>
              <td class="col-desc">
                {{ item.productId?.name || item.description || "—" }}
              </td>
              <td class="col-qty text-center">{{ item.quantity }}</td>
              <td class="col-flag text-center">{{ item.ready ? "✓" : "" }}</td>
              <td class="col-flag text-center">
                {{ item.ordered ? "✓" : "" }}
              </td>
              <td class="col-flag text-center">
                {{ item.invoiced ? "✓" : "" }}
              </td>
              <td class="col-note">{{ item.note || "" }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else class="p-no-items">Nessun articolo</div>

      <!-- ══ FOOTER ══ -->
      <div class="p-footer">Stampato il {{ formatDate(new Date()) }}</div>
    </div>

    <div v-else class="flex flex-center q-pa-xl text-grey-6">
      Commissione non trovata
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();
const orderId = route.params.id;

const order = ref(null);
const loading = ref(true);

const handlePrint = () => window.print()

const formatDate = (d) => {
  if (!d) return "";
  return new Date(d).toLocaleDateString("it-IT");
};

const formatNum = (v) => {
  if (v == null) return "0";
  return new Intl.NumberFormat("it-IT").format(v);
};

const clientFullName = computed(() => {
  const c = order.value?.clientId;
  if (!c) return "—";
  const parts = [c.lastname, c.firstname].filter(Boolean);
  return parts.length ? parts.join(" ") : c.company || "—";
});

const agentName = computed(() => {
  const a = order.value?.agentId;
  if (!a) return "—";
  return [a.lastname, a.firstname].filter(Boolean).join(" ");
});

const activeShipments = computed(() =>
  (order.value?.shipments || []).filter((s) => s.date || s.courier),
);

const activeNotes = computed(() =>
  (order.value?.notes || []).filter((n) => n.text?.trim()),
);

onMounted(async () => {
  try {
    const data = await $fetch(`/api/orders/${orderId}`);
    order.value = data.order;
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
});
</script>

<style lang="scss">
/* ── Toolbar (solo schermo) ── */
.print-toolbar {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 10px 20px;
  background: #f5f5f5;
  border-bottom: 1px solid #ddd;
  position: sticky;
  top: 0;
  z-index: 10;

  .toolbar-title {
    flex: 1;
    font-weight: 600;
    font-size: 16px;
  }
}

/* ── Body stampa ── */
.print-body {
  max-width: 1100px;
  margin: 0 auto;
  padding: 24px 32px;
  font-family: Arial, sans-serif;
  font-size: 13px;
  color: #111;
}

/* ── Header ── */
.p-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.p-commnum {
  font-size: 22px;
  font-weight: 700;
  letter-spacing: 1px;
}

.p-status {
  font-size: 13px;
  margin-top: 4px;
  background: #e8f5e9;
  display: inline-block;
  padding: 2px 10px;
  border-radius: 12px;
  font-weight: 600;
  color: #2e7d32;
  border: 1px solid #a5d6a7;
}

.p-header-right {
  text-align: right;
}

.p-date-row {
  margin-bottom: 4px;
  .p-label {
    color: #666;
    margin-right: 6px;
    font-size: 12px;
  }
  .p-value {
    font-size: 13px;
  }
}

.p-bold {
  font-weight: 700;
}

.p-divider {
  border-top: 2px solid #ddd;
  margin: 12px 0;
}

/* ── Sezione principale ── */
.p-main-section {
  display: grid;
  grid-template-columns: 220px 1fr 140px;
  gap: 16px;
  align-items: start;
}

.p-section-title {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #888;
  border-bottom: 1px solid #eee;
  padding-bottom: 4px;
  margin-bottom: 8px;
}

/* Cliente */
.p-client-box {
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 10px;
  background: #fafafa;
}

.p-client-name {
  font-size: 15px;
  font-weight: 700;
  margin-bottom: 2px;
}

.p-client-company {
  font-size: 13px;
  font-style: italic;
  margin-bottom: 4px;
  color: #444;
}

.p-client-line {
  font-size: 12px;
  color: #333;
  margin-bottom: 2px;
}

.p-vip-badge {
  margin-top: 6px;
  font-size: 11px;
  font-weight: 700;
  color: #f57f17;
}

/* Note + Corrieri */
.p-notes-shipping {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.p-sub-box {
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 10px;
  background: #fafafa;
}

.p-shipments-table {
  width: 100%;
  font-size: 12px;
  border-collapse: collapse;

  td {
    padding: 2px 6px;
  }
  .p-ship-num {
    color: #999;
    width: 20px;
  }
  .p-ship-date {
    color: #555;
    width: 90px;
  }
  .p-ship-courier {
    font-weight: 600;
  }
}

.p-note-item {
  display: flex;
  gap: 6px;
  margin-bottom: 4px;
  font-size: 12px;
  .p-note-num {
    color: #999;
    min-width: 16px;
  }
  .p-note-text {
    flex: 1;
  }
}

/* Finanziari */
.p-financial-box {
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 10px;
  background: #fafafa;
}

.p-fin-table {
  width: 100%;
  font-size: 12px;
  border-collapse: collapse;

  td {
    padding: 3px 4px;
  }
  .p-fin-label {
    color: #666;
  }
  .p-fin-value {
    text-align: right;
    font-family: monospace;
  }
  .p-fin-sep {
    height: 6px;
    border-top: 1px solid #ddd;
  }
}

.p-fin-saldo-row {
  background: #fffde7;
  .p-fin-label {
    font-weight: 700;
  }
  .p-fin-value {
    font-weight: 700;
    font-size: 13px;
  }
}

/* Articoli */
.p-items-section {
  margin-top: 4px;
}

.p-items-title {
  margin-bottom: 8px;
}

.p-items-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;

  thead tr {
    background: #eceff1;
  }

  th,
  td {
    border: 1px solid #ccc;
    padding: 5px 8px;
    text-align: left;
  }

  th {
    font-weight: 700;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .row-even {
    background: #fff;
  }
  .row-odd {
    background: #f9f9f9;
  }

  .col-cod {
    width: 100px;
  }
  .col-desc {
    min-width: 200px;
  }
  .col-qty {
    width: 50px;
    text-align: center;
  }
  .col-flag {
    width: 55px;
    text-align: center;
  }
  .col-note {
    color: #555;
  }

  .text-center {
    text-align: center;
  }
}

.p-no-items {
  color: #999;
  font-style: italic;
  padding: 12px 0;
}

/* Footer */
.p-footer {
  margin-top: 24px;
  font-size: 11px;
  color: #aaa;
  text-align: right;
  border-top: 1px solid #eee;
  padding-top: 8px;
}

/* ══ REGOLE DI STAMPA ══ */
@media print {
  .no-print {
    display: none !important;
  }

  .print-body {
    max-width: 100%;
    padding: 10mm 12mm;
    font-size: 11px;
  }

  .p-commnum {
    font-size: 18px;
  }

  .p-main-section {
    grid-template-columns: 200px 1fr 130px;
  }

  .p-items-table th,
  .p-items-table td {
    padding: 3px 6px;
    font-size: 10px;
  }

  @page {
    size: A4 portrait;
    margin: 10mm;
  }
}
</style>

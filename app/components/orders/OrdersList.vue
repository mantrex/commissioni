<template>
  <q-page class="orders-page">
    <!-- Sidebar con menu principale -->
    <div class="sidebar">
      <q-btn
        class="menu-btn"
        color="primary"
        icon="add"
        label="Nuova"
        unelevated
        @click="handleNewOrder" />

      <q-btn
        class="menu-btn"
        color="secondary"
        icon="search"
        label="Ricerca"
        unelevated
        @click="toggleAdvancedFilters" />

      <q-btn
        class="menu-btn"
        color="accent"
        icon="receipt"
        label="Fattura"
        unelevated
        @click="handleInvoice" />

      <q-btn
        class="menu-btn"
        color="secondary"
        icon="list_alt"
        label="Liste"
        unelevated
        @click="router.push('/lists')" />

      <q-btn
        class="menu-btn"
        color="info"
        icon="logout"
        label="Esci"
        unelevated
        @click="handleExit" />
    </div>

    <!-- Contenuto principale -->
    <div class="main-content">
      <!-- Filtri -->
      <OrdersFilters
        :filters="filters"
        v-model:show-advanced="showAdvancedFilters"
        :total-orders="totalOrders"
        @search="handleSearch"
        @reset="handleReset"
        @print="handlePrint" />

      <!-- Tabella ordini -->
      <OrdersTable
        v-model:pagination="pagination"
        :orders="orders"
        :loading="loading"
        @request="onRequest"
        @row-click="handleRowClick" />
    </div>

    <!-- Dialog nuova commissione via ComponentDialog -->
    <ComponentDialog
      :side="true"
      v-model="newOrderDialogShow"
      title="Nuova Commissione"
      :component-name="NewOrderDialog"
      :component-props="{}"
      :custom-style="'width: 440px'"
      @close="handleNewOrderDialogClose" />
  </q-page>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useQuasar } from "quasar";
import OrdersFilters from "./OrdersFilters.vue";
import OrdersTable from "./OrdersTable.vue";
import ComponentDialog from "~/components/common/ComponentDialog.vue";
import NewOrderDialog from "./NewOrderDialog.vue";

const { printing, printOrders } = useOrderPrint();
const authStore = useAuthStore();
const router = useRouter();
const $q = useQuasar();

const loading = ref(false);
const orders = ref([]);
const totalOrders = ref(0);

const config = useRuntimeConfig();
const defaultExpiredDays = config.public.expiredDays || 30;

// ✅ Stato persistente tra navigazioni tramite useState di Nuxt
const { filters, pagination, showAdvancedFilters, resetFilters: resetFiltersState } = useOrdersState();

const loadOrders = async () => {
  loading.value = true;

  try {
    const params = new URLSearchParams({
      page: pagination.value.page,
      limit: pagination.value.rowsPerPage,
      sortBy: pagination.value.sortBy,
      sortDesc: pagination.value.descending ? "true" : "false",
    });

    if (filters.value.commNum) params.append("commNum", filters.value.commNum);
    if (filters.value.expiredFilter === "expired") {
      params.append("expiredDays", defaultExpiredDays);
    } else if (filters.value.expiredFilter === "custom") {
      params.append("expiredDays", filters.value.customDays);
    } else if (filters.value.expiredFilter === "notExpired") {
      params.append("notExpired", "true");
    } else if (filters.value.expiredFilter === "open") {
      // ✅ Filtro "Aperte": filtra per status APERTA
      params.append("status", "APERTA");
    }

    if (filters.value.clientLastname)
      params.append("clientLastname", filters.value.clientLastname);
    if (filters.value.clientFirstname)
      params.append("clientFirstname", filters.value.clientFirstname);
    if (filters.value.clientCity) params.append("clientCity", filters.value.clientCity);
    if (filters.value.clientCountry)
      params.append("clientCountry", filters.value.clientCountry);
    if (filters.value.clientVip !== null)
      params.append("clientVip", filters.value.clientVip);
    if (filters.value.agentId) params.append("agentId", filters.value.agentId);
    if (filters.value.productCode) params.append("productCode", filters.value.productCode);
    // Evita conflitto: se expiredFilter === 'open' lo status è già aggiunto sopra
    if (filters.value.status && filters.value.expiredFilter !== "open")
      params.append("status", filters.value.status);
    if (filters.value.dateFrom) params.append("dateFrom", filters.value.dateFrom);
    if (filters.value.dateTo) params.append("dateTo", filters.value.dateTo);
    if (filters.value.dueDateFrom) params.append("dueDateFrom", filters.value.dueDateFrom);
    if (filters.value.dueDateTo) params.append("dueDateTo", filters.value.dueDateTo);

    const data = await $fetch(`/api/orders?${params.toString()}`);

    if (!data) return;

    orders.value = data.orders || [];
    totalOrders.value = data.total || 0;
    pagination.value.rowsNumber = totalOrders.value;
  } catch (err) {
    $q.notify({
      type: "negative",
      message: "Errore nel caricamento degli ordini",
      caption: err.message,
    });
  } finally {
    loading.value = false;
  }
};

const onRequest = (props) => {
  const { page, rowsPerPage, sortBy, descending } = props.pagination;
  pagination.value.page = page;
  pagination.value.rowsPerPage = rowsPerPage;
  pagination.value.sortBy = sortBy;
  pagination.value.descending = descending;
  loadOrders();
};

const handleSearch = () => {
  pagination.value.page = 1;
  loadOrders();
};

const handleReset = () => {
  resetFiltersState();
  loadOrders();
};

const toggleAdvancedFilters = () => {
  showAdvancedFilters.value = !showAdvancedFilters.value;
};

const handleRowClick = (row) => {
  router.push(`/orders/${row._id}`);
};

const handleInvoice = () => {
  router.push("/invoices");
};

const handleExit = () => {
  authStore.logout();
};

const handlePrint = () => {
  printOrders(filters.value, defaultExpiredDays);
};

// =============================================
// Dialog: nuova commissione
// =============================================
const newOrderDialogShow = ref(false);

const handleNewOrder = () => {
  newOrderDialogShow.value = true;
};

const handleNewOrderDialogClose = (commNum) => {
  // commNum è null se l'utente ha annullato, altrimenti è il numero scelto
  if (commNum) {
    router.push(`/orders/new?commNum=${encodeURIComponent(commNum)}`);
  }
};

onMounted(() => {
  loadOrders();
});
</script>

<style scoped lang="scss">
.orders-page {
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

@media (max-width: 960px) {
  .orders-page {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    flex-direction: row;
    overflow-x: auto;
    padding: 8px;

    .menu-btn {
      white-space: nowrap;
    }
  }
}
</style>
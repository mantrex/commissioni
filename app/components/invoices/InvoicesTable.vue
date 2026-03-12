<template>
  <div class="table-container">
    <q-table
      flat
      bordered
      :rows="invoices"
      :columns="columns"
      row-key="_id"
      :loading="loading"
      v-model:pagination="localPagination"
      @request="emit('request', $event)"
      @row-click="(evt, row) => emit('rowClick', row)"
      class="invoices-table"
      :rows-per-page-options="[10, 25, 50, 100]"
      style="height:100%">
      <!-- Loading -->
      <template v-slot:loading>
        <q-inner-loading showing color="primary" />
      </template>

      <!-- Colonna ID Fattura -->
      <template v-slot:body-cell-invoiceId="props">
        <q-td
          :props="props"
          class="text-bold cursor-pointer"
          @click.stop="emit('edit', props.row)">
          {{ props.row.invoiceId }}
        </q-td>
      </template>

      <!-- Colonna Data -->
      <template v-slot:body-cell-invoiceDate="props">
        <q-td :props="props">
          {{ formatDate(props.row.invoiceDate) }}
        </q-td>
      </template>

      <!-- Colonna Intestatario -->
      <template v-slot:body-cell-client="props">
        <q-td :props="props">
          {{ getClientName(props.row.client) }}
        </q-td>
      </template>

      <!-- Colonna Commissione -->
      <template v-slot:body-cell-commNum="props">
        <q-td :props="props" class="text-center">
          <q-chip
            v-if="props.row.commNum"
            dense
            color="primary"
            text-color="white"
            size="sm">
            {{ props.row.commNum }}
          </q-chip>
          <span v-else class="text-grey-5">—</span>
        </q-td>
      </template>

      <!-- Colonna Corriere -->
      <template v-slot:body-cell-shipping="props">
        <q-td :props="props">
          {{ props.row.shipping || "—" }}
        </q-td>
      </template>

      <!-- Colonna Totale -->
      <template v-slot:body-cell-total="props">
        <q-td :props="props" class="text-right">
          {{ formatCurrency(props.row.total) }}
        </q-td>
      </template>

      <!-- Colonna Emessa -->
      <template v-slot:body-cell-issued="props">
        <q-td :props="props" class="text-center">
          <q-icon
            v-if="props.row.issued"
            name="check_circle"
            color="positive"
            size="sm">
            <q-tooltip>Fattura Emessa</q-tooltip>
          </q-icon>
          <q-icon v-else name="schedule" color="warning" size="sm">
            <q-tooltip>Da Emettere</q-tooltip>
          </q-icon>
        </q-td>
      </template>

      <!-- Colonna Azioni -->
      <template v-slot:body-cell-actions="props">
        <q-td :props="props" class="text-center">
          <q-btn
            flat
            dense
            round
            icon="edit"
            size="sm"
            color="primary"
            @click.stop="emit('edit', props.row)">
            <q-tooltip>Modifica Fattura</q-tooltip>
          </q-btn>
        </q-td>
      </template>

      <!-- Nessun risultato -->
      <template v-slot:no-data>
        <div class="full-width row flex-center q-gutter-sm q-pa-lg">
          <q-icon size="2em" name="info" color="grey-5" />
          <span class="text-grey-7">
            Nessuna fattura trovata con i filtri selezionati
          </span>
        </div>
      </template>
    </q-table>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  invoices: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  pagination: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["update:pagination", "request", "rowClick", "edit"]);

const localPagination = computed({
  get: () => props.pagination,
  set: (val) => emit("update:pagination", val),
});

const columns = [
  {
    name: "invoiceId",
    required: true,
    label: "ID Fattura",
    align: "left",
    field: "invoiceId",
    sortable: true,
  },
  {
    name: "invoiceDate",
    label: "Data",
    align: "left",
    field: "invoiceDate",
    sortable: true,
  },
  {
    name: "client",
    label: "Intestatario",
    align: "left",
    field: (row) => row.client,
  },
  {
    name: "commNum",
    label: "Comm.",
    align: "center",
    field: "commNum",
    sortable: true,
  },
  {
    name: "shipping",
    label: "Corriere",
    align: "left",
    field: "shipping",
  },
  {
    name: "total",
    label: "Totale",
    align: "right",
    field: "total",
    sortable: true,
  },
  {
    name: "issued",
    label: "Emessa",
    align: "center",
    field: "issued",
    sortable: true,
  },
  {
    name: "actions",
    label: "Azioni",
    align: "center",
  },
];

const formatDate = (date) => {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("it-IT");
};

const formatCurrency = (value) => {
  if (value === null || value === undefined) return "€ 0,00";
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
  }).format(value);
};

const getClientName = (client) => {
  if (!client) return "N/A";

  if (client.company) {
    return client.company;
  }

  const parts = [];
  if (client.lastname) parts.push(client.lastname);
  if (client.firstname) parts.push(client.firstname);

  return parts.length > 0 ? parts.join(" ") : "N/A";
};
</script>

<style scoped lang="scss">
.table-container {
  flex: 1;
  overflow: hidden;
  background: $contrast;
  border-radius: 8px;
}

.invoices-table {
  height: 100%;

  :deep(thead tr th) {
    position: sticky;
    top: 0;
    z-index: 1;

    font-weight: 600;
    font-size: 13px;
    color: $text-primary;
    padding: 8px 12px;
  }

  :deep(thead th) {
    background: $bg-light2;

  }

  :deep(tbody tr) {
    cursor: pointer;

    &:hover {
      background: rgba($primary, 0.05);
    }

    td {
      padding: 8px 12px;
      font-size: 13px;
    }
  }
}
</style>
// app/stores/ordersState.js
import { defineStore } from "pinia";

export const useOrdersStateStore = defineStore("ordersState", {
  state: () => ({
    filters: {
      commNum: "",
      expiredFilter: "expired",
      customDays: 30,
      clientLastname: "",
      clientFirstname: "",
      clientCity: "",
      clientCountry: "",
      clientVip: null,
      agentId: null,
      productCode: "",
      status: null,
      dateFrom: null,
      dateTo: null,
      dueDateFrom: null,
      dueDateTo: null,
    },
    pagination: {
      sortBy: "dueDate",
      descending: false,
      page: 1,
      rowsPerPage: 25,
      rowsNumber: 0,
    },
    showAdvancedFilters: true,
  }),

  actions: {
    resetFilters() {
      const config = useRuntimeConfig();
      const defaultExpiredDays = config.public.expiredDays || 30;

      this.filters.commNum = "";
      this.filters.expiredFilter = "expired";
      this.filters.customDays = defaultExpiredDays;
      this.filters.clientLastname = "";
      this.filters.clientFirstname = "";
      this.filters.clientCity = "";
      this.filters.clientCountry = "";
      this.filters.clientVip = null;
      this.filters.agentId = null;
      this.filters.productCode = "";
      this.filters.status = null;
      this.filters.dateFrom = null;
      this.filters.dateTo = null;
      this.filters.dueDateFrom = null;
      this.filters.dueDateTo = null;
      this.pagination.page = 1;
    },
  },

  // ✅ Persiste tutto su localStorage — sopravvive al reload
  persist: true,
});

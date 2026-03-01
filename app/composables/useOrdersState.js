// app/composables/useOrdersState.js
// Usa useState di Nuxt per persistere i filtri tra navigazioni (SPA mode)

export const useOrdersState = () => {
  const config = useRuntimeConfig();
  const defaultExpiredDays = config.public.expiredDays || 30;

  const filters = useState("orders-filters", () => ({
    commNum: "",
    expiredFilter: "expired",
    customDays: defaultExpiredDays,
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
  }));

  const pagination = useState("orders-pagination", () => ({
    sortBy: "dueDate",
    descending: false,
    page: 1,
    rowsPerPage: 25,
    rowsNumber: 0,
  }));

  const showAdvancedFilters = useState("orders-show-advanced", () => false);

  const resetFilters = () => {
    filters.value.commNum = "";
    filters.value.expiredFilter = "expired";
    filters.value.customDays = defaultExpiredDays;
    filters.value.clientLastname = "";
    filters.value.clientFirstname = "";
    filters.value.clientCity = "";
    filters.value.clientCountry = "";
    filters.value.clientVip = null;
    filters.value.agentId = null;
    filters.value.productCode = "";
    filters.value.status = null;
    filters.value.dateFrom = null;
    filters.value.dateTo = null;
    filters.value.dueDateFrom = null;
    filters.value.dueDateTo = null;
    pagination.value.page = 1;
  };

  return {
    filters,
    pagination,
    showAdvancedFilters,
    resetFilters,
  };
};

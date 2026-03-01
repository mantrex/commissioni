// app/composables/useOrdersState.js
// Wrapper sul Pinia store — i dati persistono su localStorage tra reload

export const useOrdersState = () => {
  const store = useOrdersStateStore();

  // storeToRefs mantiene la reattività dei ref estratti dallo store
  const { filters, pagination, showAdvancedFilters } = storeToRefs(store);

  return {
    filters,
    pagination,
    showAdvancedFilters,
    resetFilters: store.resetFilters,
  };
};

// app/composables/useStatuses.js
import { ref } from 'vue'

export const useStatuses = () => {
  const statuses = ref([]);
  const loading = ref(false);
  const error = ref(null);

  // app/composables/useStatuses.js
  const loadStatuses = async (selectable = true) => {
    loading.value = true;
    error.value = null;
    try {
      const data = await $fetch("/api/lists/statuses", {
        params: { selectable: selectable ? "true" : "false" },
      });
      statuses.value = data?.statuses || [];
    } catch (err) {
      error.value = err.message;
      console.error("Errore loadStatuses:", err);
      statuses.value = [];
    } finally {
      loading.value = false;
    }
  };
  
  return {
    statuses,
    loading,
    error,
    loadStatuses,
  };
}
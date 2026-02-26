// app/composables/useShipments.js
import { ref } from 'vue'

export const useShipments = () => {
  const shipments = ref([])
  const loading = ref(false)
  const error = ref(null)

  const loadShipments = async (selectable = true) => {
    loading.value = true
    error.value = null

    try {
      const  data   = await $fetch('/api/lists/shipments', {
        params: { selectable: selectable ? 'true' : 'false' }
      })

      shipments.value = data?.shipments || [];

    } catch (err) {
      error.value = err.message
      console.error('Errore loadShipments:', err)
      shipments.value = []
    } finally {
      loading.value = false
    }
  }

  return {
    shipments,
    loading,
    error,
    loadShipments
  }
}
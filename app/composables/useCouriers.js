// app/composables/useCouriers.js
import { ref } from 'vue'

export const useCouriers = () => {
  const couriers = ref([])
  const loading = ref(false)
  const error = ref(null)

  const loadCouriers = async (selectable = true) => {
    loading.value = true
    error.value = null

    try {
      const { data, error: fetchError } = await useFetch('/api/lists/couriers', {
        params: { selectable: selectable ? 'true' : 'false' }
      })

      if (fetchError.value) {
        throw new Error(fetchError.value.message || 'Errore nel caricamento dei corrieri')
      }

      couriers.value = data.value?.couriers || []
    } catch (err) {
      error.value = err.message
      console.error('Errore loadCouriers:', err)
      couriers.value = []
    } finally {
      loading.value = false
    }
  }

  return {
    couriers,
    loading,
    error,
    loadCouriers
  }
}
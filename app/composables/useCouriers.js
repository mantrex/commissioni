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
      const data = await $fetch('/api/lists/couriers', {
        params: { selectable: selectable ? 'true' : 'false' }
      })

      couriers.value = data?.couriers || []
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
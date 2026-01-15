// app/composables/usePayments.js
import { ref } from 'vue'

export const usePayments = () => {
  const payments = ref([])
  const loading = ref(false)
  const error = ref(null)

  const loadPayments = async (selectable = true) => {
    loading.value = true
    error.value = null

    try {
      const { data, error: fetchError } = await useFetch('/api/lists/payments', {
        params: { selectable: selectable ? 'true' : 'false' }
      })

      if (fetchError.value) {
        throw new Error(fetchError.value.message || 'Errore nel caricamento dei pagamenti')
      }

      payments.value = data.value?.payments || []
    } catch (err) {
      error.value = err.message
      console.error('Errore loadPayments:', err)
      payments.value = []
    } finally {
      loading.value = false
    }
  }

  return {
    payments,
    loading,
    error,
    loadPayments
  }
}
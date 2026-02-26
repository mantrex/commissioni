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
      const { data } = await $fetch('/api/lists/payments', {
        params: { selectable: selectable ? 'true' : 'false' }
      })

      payments.value = data?.payments || [];

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
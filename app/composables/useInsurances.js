// app/composables/useInsurances.js
import { ref } from 'vue'

export const useInsurances = () => {
  const insurances = ref([])
  const loading = ref(false)
  const error = ref(null)

  const loadInsurances = async (selectable = true) => {
    loading.value = true
    error.value = null

    try {
      const { data  } = await $fetch('/api/lists/insurances', {
        params: { selectable: selectable ? 'true' : 'false' }
      })

      insurances.value = data?.insurances || []
    } catch (err) {
      error.value = err.message
      console.error('Errore loadInsurances:', err)
      insurances.value = []
    } finally {
      loading.value = false
    }
  }

  return {
    insurances,
    loading,
    error,
    loadInsurances
  }
}
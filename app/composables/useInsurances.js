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
      const { data, error: fetchError } = await useFetch('/api/lists/insurances', {
        params: { selectable: selectable ? 'true' : 'false' }
      })

      if (fetchError.value) {
        throw new Error(fetchError.value.message || 'Errore nel caricamento delle assicurazioni')
      }

      insurances.value = data.value?.insurances || []
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
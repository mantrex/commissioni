// app/composables/useStatuses.js
import { ref } from 'vue'

export const useStatuses = () => {
  const statuses = ref([])
  const loading = ref(false)
  const error = ref(null)

  const loadStatuses = async (selectable = true) => {
    loading.value = true
    error.value = null

    try {
      const { data, error: fetchError } = await useFetch('/api/lists/statuses', {
        params: { selectable: selectable ? 'true' : 'false' }
      })

      if (fetchError.value) {
        throw new Error(fetchError.value.message || 'Errore nel caricamento degli stati')
      }

      statuses.value = data.value?.statuses || []
    } catch (err) {
      error.value = err.message
      console.error('Errore loadStatuses:', err)
      statuses.value = []
    } finally {
      loading.value = false
    }
  }

  return {
    statuses,
    loading,
    error,
    loadStatuses
  }
}
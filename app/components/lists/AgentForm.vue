<template>
  <div class="agent-form q-pa-md q-gutter-sm">
    <q-input v-model="localData.lastname" label="Cognome *" outlined dense autofocus />
    <q-input v-model="localData.firstname" label="Nome" outlined dense />
    <q-toggle v-model="localData.active" label="Attivo (visibile nelle selezioni)" />

    <div class="form-actions q-mt-md">
      <q-btn label="Salva" color="primary" unelevated :loading="saving" @click="handleSave" />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useQuasar } from 'quasar'

const props = defineProps({
  item: { type: Object, default: () => ({}) },
  isNew: { type: Boolean, default: true }
})

const emit = defineEmits(['close'])
const $q = useQuasar()
const saving = ref(false)

const localData = reactive({
  firstname: props.item.firstname || '',
  lastname: props.item.lastname || '',
  active: !props.item.deleted ?? true
})

const handleSave = async () => {
  if (!localData.lastname?.trim() && !localData.firstname?.trim()) {
    $q.notify({ type: 'warning', message: 'Almeno cognome o nome sono obbligatori' })
    return
  }

  saving.value = true
  try {
    const body = {
      firstname: localData.firstname || '',
      lastname: localData.lastname || '',
      deleted: !localData.active
    }
    if (props.isNew) {
      await $fetch('/api/lists/agents', { method: 'POST', body })
    } else {
      await $fetch(`/api/lists/agents/${props.item._id}`, { method: 'PUT', body })
    }
    $q.notify({ type: 'positive', message: props.isNew ? 'Agente creato' : 'Agente aggiornato' })
    emit('close', true)
  } catch (err) {
    $q.notify({ type: 'negative', message: 'Errore nel salvataggio', caption: err.message })
  } finally {
    saving.value = false
  }
}
</script>

<style scoped lang="scss">
.agent-form { min-width: 360px; }
.form-actions { display: flex; justify-content: flex-end; gap: 8px; }
</style>
<template>
  <div class="list-item-form q-pa-md q-gutter-sm">
    <template v-if="isNew">
      <q-input v-model="localData.code" label="Codice *" outlined dense autofocus
        hint="Verrà convertito in maiuscolo" />
    </template>
    <div v-else class="q-mb-sm">
      <span class="text-caption text-grey-6">Codice: </span>
      <span class="text-weight-medium" style="font-family:monospace">{{ localData.code }}</span>
    </div>

    <q-input v-model="localData.label" label="Etichetta *" outlined dense :autofocus="!isNew" />

    <q-toggle v-model="localData.selectable" label="Attivo (visibile nelle selezioni)" />

    <div class="form-actions q-mt-md">
      <q-btn flat label="Annulla" color="negative" @click="emit('close', null)" />
      <q-btn label="Salva" color="primary" unelevated :loading="saving" @click="handleSave" />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useQuasar } from 'quasar'

const props = defineProps({
  item: { type: Object, default: () => ({}) },
  isNew: { type: Boolean, default: true },
  listType: { type: String, required: true }
})

const emit = defineEmits(['close'])
const $q = useQuasar()
const saving = ref(false)

const localData = reactive({
  code: props.item.code || '',
  label: props.item.label || '',
  selectable: props.item.selectable ?? true
})

const handleSave = async () => {
  if (!localData.label?.trim()) {
    $q.notify({ type: 'warning', message: "L'etichetta è obbligatoria" })
    return
  }
  if (props.isNew && !localData.code?.trim()) {
    $q.notify({ type: 'warning', message: 'Il codice è obbligatorio' })
    return
  }

  saving.value = true
  try {
    if (props.isNew) {
      await $fetch(`/api/lists/${props.listType}`, { method: 'POST', body: localData })
    } else {
      await $fetch(`/api/lists/${props.listType}/${props.item._id}`, { method: 'PUT', body: localData })
    }
    $q.notify({ type: 'positive', message: props.isNew ? 'Elemento creato' : 'Elemento aggiornato' })
    emit('close', true)
  } catch (err) {
    $q.notify({ type: 'negative', message: 'Errore nel salvataggio', caption: err.message })
  } finally {
    saving.value = false
  }
}
</script>

<style scoped lang="scss">
.list-item-form { min-width: 360px; }
.form-actions { display: flex; justify-content: flex-end; gap: 8px; }
</style>
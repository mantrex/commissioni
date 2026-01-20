<template>
  <div class="package-dialog-content">
    <q-form @submit.prevent="handleSave" class="package-form">
      <div class="form-section">
        <div class="section-title">Misure Pacco (cm)</div>
        <div class="row q-col-gutter-sm">
          <div class="col-4">
            <q-input v-model.number="localPackage.size1" label="Lato 1" type="number" outlined dense step="0.01"
              :rules="[val => val > 0 || 'Richiesto']" />
          </div>
          <div class="col-4">
            <q-input v-model.number="localPackage.size2" label="Lato 2" type="number" outlined dense step="0.01"
              :rules="[val => val > 0 || 'Richiesto']" />
          </div>
          <div class="col-4">
            <q-input v-model.number="localPackage.size3" label="Lato 3" type="number" outlined dense step="0.01"
              :rules="[val => val > 0 || 'Richiesto']" />
          </div>
        </div>
      </div>

      <q-separator class="q-my-md" />

      <div class="form-section">
        <div class="section-title">Pesi (kg)</div>
        <div class="row q-col-gutter-sm">
          <div class="col-6">
            <q-input v-model.number="localPackage.grossWeight" label="Peso Lordo" type="number" outlined dense
              step="0.01" :rules="[val => val >= 0 || 'Deve essere >= 0']" />
          </div>
          <div class="col-6">
            <q-input v-model.number="localPackage.netWeight" label="Peso Netto" type="number" outlined dense step="0.01"
              :rules="[val => val >= 0 || 'Deve essere >= 0']" />
          </div>
        </div>
      </div>

      <div class="form-actions">
        <q-btn flat label="Annulla" color="negative" @click="emit('close')" />
        <q-btn type="submit" label="Salva" color="primary" unelevated />
      </div>
    </q-form>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useQuasar } from 'quasar'

const props = defineProps({
  package: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['close'])

const $q = useQuasar()

const localPackage = ref({
  size1: 0,
  size2: 0,
  size3: 0,
  grossWeight: 0,
  netWeight: 0
})

watch(() => props.package, (newVal) => {
  if (newVal && Object.keys(newVal).length > 0) {
    localPackage.value = { ...newVal }
  } else {
    localPackage.value = {
      size1: 0,
      size2: 0,
      size3: 0,
      grossWeight: 0,
      netWeight: 0
    }
  }
}, { immediate: true, deep: true })

const handleSave = () => {
  if (localPackage.value.size1 <= 0 || localPackage.value.size2 <= 0 || localPackage.value.size3 <= 0) {
    $q.notify({
      type: 'negative',
      message: 'Tutte le misure devono essere maggiori di 0'
    })
    return
  }

  emit('close', localPackage.value)
}
</script>

<style scoped lang="scss">
.package-dialog-content {
  padding: 16px;
}

.package-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-section {
  .section-title {
    font-weight: 600;
    color: $text-primary;
    margin-bottom: 12px;
    font-size: 15px;
  }
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 16px;
  margin-top: 16px;
  border-top: 1px solid $border;
}
</style>
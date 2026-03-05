<template>
  <div class="delete-invoice-dialog">

    <div class="warning-block">
      <q-icon name="warning" size="32px" color="negative" />
      <div class="warning-text">
        <div class="warning-title">Attenzione</div>
        <div class="warning-body">
          Si sta per <strong>ELIMINARE DEFINITIVAMENTE</strong> la fattura
          <strong>PROFORMA {{ invoiceId }}</strong>.<br />
          Questa operazione non è reversibile.
        </div>
      </div>
    </div>

    <div class="confirm-block">
      <div class="confirm-label">
        Per confermare, scrivi il numero della fattura:
      </div>
      <q-input
        v-model="confirmInput"
        :placeholder="invoiceId"
        outlined
        dense
        autofocus
        :error="confirmInput.length > 0 && confirmInput !== invoiceId"
        error-message="Il numero non corrisponde"
        @keyup.enter="confirmInput === invoiceId && handleConfirm()" />
    </div>

    <div class="dialog-actions">
      <q-btn flat label="Annulla" @click="emit('close', false)" />
      <q-btn
        color="negative"
        icon="delete_forever"
        label="Elimina definitivamente"
        unelevated
        :disable="confirmInput !== invoiceId"
        :loading="deleting"
        @click="handleConfirm" />
    </div>

  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  invoiceId: { type: String, required: true },
  mongoId:   { type: String, required: true },
})

const emit = defineEmits(['close'])

const confirmInput = ref('')
const deleting = ref(false)

const handleConfirm = async () => {
  if (confirmInput.value !== props.invoiceId) return
  deleting.value = true
  try {
    await $fetch(`/api/invoices/${props.mongoId}`, { method: 'DELETE' })
    emit('close', true)
  } catch (err) {
    console.error('Errore eliminazione fattura:', err)
    emit('close', false)
  } finally {
    deleting.value = false
  }
}
</script>

<style scoped lang="scss">
.delete-invoice-dialog {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 320px;
}

.warning-block {
  display: flex;
  gap: 14px;
  align-items: flex-start;
  padding: 16px;
  background: rgba($negative, 0.06);
  border: 1px solid rgba($negative, 0.25);
  border-radius: 6px;
}

.warning-text {
  .warning-title {
    font-weight: 700;
    font-size: 15px;
    color: $negative;
    margin-bottom: 6px;
  }
  .warning-body {
    font-size: 13px;
    line-height: 1.5;
    color: $text-primary;
  }
}

.confirm-block {
  display: flex;
  flex-direction: column;
  gap: 8px;

  .confirm-label {
    font-size: 13px;
    color: $text-secondary;
  }
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
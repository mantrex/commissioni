<template>
  <div class="generic-warning q-pa-md">
    <!-- Icona + messaggio -->
    <div class="warning-body">
      <q-icon :name="icon" :color="iconColor" size="36px" class="q-mb-sm" />
      <div v-if="title" class="warning-title q-mb-xs">{{ title }}</div>
      <div class="warning-message">{{ message }}</div>
      <div v-if="detail" class="warning-detail q-mt-sm">{{ detail }}</div>
    </div>

    <!-- Azioni -->
    <div class="warning-actions q-mt-lg">
      <q-btn
        v-if="cancelLabel"
        flat
        :label="cancelLabel"
        color="primary"
        @click="emit('close', false)"
      />
      <q-btn
        unelevated
        :label="confirmLabel"
        :color="confirmColor"
        :icon="confirmIcon"
        @click="emit('close', true)"
      />
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  // Testo principale
  message: { type: String, required: true },
  // Titolo opzionale in grassetto sopra il messaggio
  title: { type: String, default: '' },
  // Testo aggiuntivo (es. nome elemento da eliminare)
  detail: { type: String, default: '' },
  // Icona Material
  icon: { type: String, default: 'warning' },
  iconColor: { type: String, default: 'warning' },
  // Bottone conferma
  confirmLabel: { type: String, default: 'Conferma' },
  confirmColor: { type: String, default: 'primary' },
  confirmIcon: { type: String, default: '' },
  // Bottone annulla (se vuoto non mostra il bottone)
  cancelLabel: { type: String, default: 'Annulla' },
})

const emit = defineEmits(['close'])
</script>

<style scoped lang="scss">
.generic-warning {
  min-width: 320px;
  max-width: 480px;
  display: flex;
  flex-direction: column;
}

.warning-body {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 8px 0;
}

.warning-title {
  font-weight: 700;
  font-size: 16px;
  color: $text-primary;
}

.warning-message {
  font-size: 14px;
  color: $text-primary;
  line-height: 1.5;
}

.warning-detail {
  font-weight: 600;
  font-size: 15px;
  color: $primary;
  padding: 6px 12px;
  background: rgba($primary, 0.07);
  border-radius: 4px;
}

.warning-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
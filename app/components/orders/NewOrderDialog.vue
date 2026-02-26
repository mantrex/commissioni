<template>
  <div class="new-commission-dialog q-pa-md">
    <div class="text-body2 text-grey-7 q-mb-md">
      Inserisci il numero della nuova commissione. Verrà formattato a 8 cifre
      automaticamente.
    </div>

    <q-input
      ref="inputRef"
      v-model="commNum"
      label="Numero Commissione *"
      outlined
      dense
      mask="########"
      fill-mask="0"
      reverse-fill-mask
      input-style="font-family: monospace; font-size: 16px; letter-spacing: 2px;"
      :error="!!error"
      :error-message="error"
      :loading="checking"
      @keyup.enter="handleConfirm"
      @update:model-value="onInput">
      <template v-slot:append>
        <q-icon v-if="valid === true" name="check_circle" color="positive" />
        <q-icon v-else-if="valid === false" name="cancel" color="negative" />
      </template>
    </q-input>

    <!-- Altezza fissa per messaggio stato: non ridimensiona mai il dialog -->
    <div style="height: 24px; margin-top: 4px">
      <span v-if="valid === true" class="text-positive text-caption">
        <q-icon name="check" size="xs" /> Numero disponibile
      </span>
    </div>

    <div class="dialog-actions q-mt-md">
      <q-btn
        flat
        label="Annulla"
        color="negative"
        @click="emit('close', null)" />
      <q-btn
        :label="isEditMode ? 'Modifica Commissione' : 'Crea Commissione'"
        color="primary"
        unelevated
        :icon="isEditMode ? 'edit' : 'add'"
        :disable="valid !== true || checking"
        @click="handleConfirm" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from "vue";

const emit = defineEmits(["close"]);
const props = defineProps({
  initialCommNum: { type: String, default: "" },
});

// Se c'è un commNum iniziale, siamo in modalità "modifica"
const isEditMode =
  !!props.initialCommNum && props.initialCommNum !== "00000000";

const inputRef = ref(null);
const commNum = ref(props.initialCommNum || "00000000");
const checking = ref(false);
// In modalità modifica, il valore iniziale è già valido (è la commissione corrente)
const valid = ref(isEditMode ? true : null);
const error = ref("");
const checkTimeout = ref(null);

onMounted(() => {
  nextTick(() => inputRef.value?.focus());
});

const onInput = (val) => {
  valid.value = null;
  error.value = "";

  if (!val || val === "00000000") return;

  const n = parseInt(val);
  if (isNaN(n) || n <= 0) {
    error.value = "Inserisci un numero valido (maggiore di zero)";
    return;
  }

  // In modalità modifica, se il valore non è cambiato rispetto all'originale è sempre valido
  if (isEditMode && val === props.initialCommNum) {
    valid.value = true;
    return;
  }

  clearTimeout(checkTimeout.value);
  checkTimeout.value = setTimeout(() => checkCommNum(val), 400);
};

const checkCommNum = async (val) => {
  checking.value = true;
  valid.value = null;
  error.value = "";

  try {
    const result = await $fetch(
      `/api/orders/check-commnum?commNum=${encodeURIComponent(val)}`,
    );
    if (result.exists) {
      valid.value = false;
      error.value = `La commissione "${result.commNum}" esiste già`;
    } else {
      valid.value = true;
    }
  } catch {
    valid.value = null;
    error.value = "Errore durante la verifica, riprova";
  } finally {
    checking.value = false;
  }
};

const handleConfirm = () => {
  if (valid.value !== true || checking.value) return;
  emit("close", commNum.value);
};
</script>

<style scoped lang="scss">
.new-commission-dialog {
  min-width: 380px;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>

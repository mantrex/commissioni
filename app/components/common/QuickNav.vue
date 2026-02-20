<template>
  <div class="quicknav" @click.stop="focusInput">
    <q-btn
      flat dense round icon="chevron_left" size="sm"
      :disable="!prev || loading"
      class="nav-btn"
      @click.stop="handlePrev">
      <q-tooltip v-if="prev">← Comm. {{ prev.commNum }}</q-tooltip>
    </q-btn>

    <q-input
      ref="inputRef"
      v-model="navValue"
      dense outlined
      placeholder="N° comm."
      class="nav-input"
      @keydown="handleKeydown"
      @keyup.enter="handleJump">
      <template v-slot:prepend>
        <q-icon name="tag" size="xs" color="grey-6" />
      </template>
    </q-input>

    <q-btn
      flat dense round icon="chevron_right" size="sm"
      :disable="!next || loading"
      class="nav-btn"
      @click.stop="handleNext">
      <q-tooltip v-if="next">Comm. {{ next.commNum }} →</q-tooltip>
    </q-btn>

    <q-select
      v-model="currentStatus"
      :options="statusOptions"
      option-label="label"
      option-value="value"
      emit-value map-options
      dense outlined
      class="nav-status"
      @update:model-value="handleStatusChange"
      @click.stop>
      <template v-slot:prepend>
        <q-icon name="flag" size="xs" color="grey-6" />
      </template>
    </q-select>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'

const props = defineProps({
  commNum: { type: String, default: '' },
  status: { type: String, default: '' },
  statusOptions: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false }
})

const emit = defineEmits(['prev', 'next', 'jump', 'status-change'])

const inputRef = ref(null)
const navValue = ref('')
const currentStatus = defineModel('status')

// Adjacent orders caricati internamente
const prev = ref(null)
const next = ref(null)

const loadAdjacent = async () => {
  if (!props.commNum) return
  try {
    const data = await $fetch(`/api/orders/adjacent?commNum=${props.commNum}`)
    prev.value = data.prev
    next.value = data.next
  } catch (e) {
    console.error('QuickNav: errore adjacent', e)
  }
}

// Ricarica quando cambia commNum (navigazione)
watch(() => props.commNum, () => {
  navValue.value = ''
  loadAdjacent()
}, { immediate: true })

const focusInput = () => {
  inputRef.value?.focus()
}

const handleKeydown = (e) => {
  if (e.key === 'ArrowLeft' && !navValue.value) {
    e.preventDefault()
    handlePrev()
  } else if (e.key === 'ArrowRight' && !navValue.value) {
    e.preventDefault()
    handleNext()
  }
}

const handlePrev = () => {
  if (!prev.value || props.loading) return
  emit('prev', prev.value)
}

const handleNext = () => {
  if (!next.value || props.loading) return
  emit('next', next.value)
}

const handleJump = () => {
  const val = navValue.value.trim()
  if (!val) return
  emit('jump', val)
  navValue.value = ''
}

const handleStatusChange = (val) => {
  emit('status-change', val)
}

// Esponi focus per il parent
defineExpose({ focus: focusInput })

onMounted(() => {
  loadAdjacent()
})
</script>

<style scoped lang="scss">
.quicknav {
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: text; // invita al click

  .nav-btn {
    color: $text-primary;
    flex-shrink: 0;
  }

  .nav-input {
    width: 90px;
    flex-shrink: 0;

    :deep(.q-field__control) { height: 32px; min-height: 32px; }
    :deep(.q-field__label) { display: none; }
    :deep(.q-field__prepend) { padding-right: 2px; }
    :deep(input) {
      font-size: 13px;
      text-align: center;
      padding: 0 2px;
    }
  }

  .nav-status {
    width: 150px;
    flex-shrink: 0;

    :deep(.q-field__control) { height: 32px; min-height: 32px; }
    :deep(.q-field__label) { display: none; }
    :deep(.q-field__native) { font-size: 12px; }
  }

  @media (max-width: 768px) {
    .nav-input { width: 70px; }
    .nav-status { width: 110px; }
  }
}
</style>
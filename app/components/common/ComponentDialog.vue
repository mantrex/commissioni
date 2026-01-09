<template>
  <q-dialog v-model="internalVisibleState" :maximized="maximized" :position="side ? 'right' : 'standard'"
    :full-height="side" :full-width="isSmallScreen" @hide="onHide" :seamless="side" class="component-dialog">
    <q-card :class="['dialog-card', { 'side-dialog': side }]" :style="cardStyle">
      <q-bar class="dialog-header">
        <div class="dialog-title">{{ title }}</div>
        <q-space />
        <q-btn dense flat icon="close" @click="closeDialog" aria-label="Chiudi">
          <q-tooltip>Chiudi</q-tooltip>
        </q-btn>
      </q-bar>

      <q-card-section class="dialog-content q-pa-none">
        <component :is="componentName" v-bind="componentProps" @close="closeDialog" />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount, computed } from 'vue'

const props = defineProps({
  title: {
    type: String,
    default: 'Dialog'
  },
  modelValue: {
    type: Boolean,
    default: false
  },
  componentName: {
    type: Object,
    required: true
  },
  componentProps: {
    type: Object,
    default: () => ({})
  },
  maximized: {
    type: Boolean,
    default: false
  },
  side: {
    type: Boolean,
    default: false
  },
  customStyle: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue', 'close'])

const internalVisibleState = ref(props.modelValue)
const windowWidth = ref(window.innerWidth)

const handleResize = () => {
  windowWidth.value = window.innerWidth
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
})

const isSmallScreen = computed(() => windowWidth.value <= 768)
const isMediumScreen = computed(() => windowWidth.value > 768 && windowWidth.value <= 1024)

const cardStyle = computed(() => {
  let style = props.customStyle

  if (props.side && !isSmallScreen.value) {
    if (isMediumScreen.value) {
      style += ';width: 70vw;'
    } else {
      style += ';width: 50vw;'
    }
  }

  return style
})

watch(() => props.modelValue, (newValue) => {
  internalVisibleState.value = newValue
})

watch(internalVisibleState, (newValue) => {
  emit('update:modelValue', newValue)
})

const onHide = () => {
  internalVisibleState.value = false
  emit('update:modelValue', false)
  emit('close')
}

const closeDialog = () => {
  internalVisibleState.value = false
}
</script>

<style scoped lang="scss">
.dialog-card {
  height: 100vh;
}

.side-dialog {
  border-radius: 0;
}

.dialog-header {
  background-color: $modal-header;
  color: $contrast;
  flex-shrink: 0;
}

.dialog-title {
  font-weight: 500;
  font-size: 16px;
}

.dialog-content {
  height: calc(100vh - 50px);
  overflow-y: auto;
}

:deep(.q-dialog__backdrop) {
  transition-duration: 300ms;
}

</style>

<style>

    .component-dialog .q-dialog__inner {
      padding: 0;
    }

</style>
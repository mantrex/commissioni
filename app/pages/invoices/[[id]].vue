<template>
  <q-page class="invoice-page">
    <div class="invoice-container">
      <!-- Header -->
      <div class="invoice-header">
        <div class="header-left">
          <q-btn flat dense icon="arrow_back" @click="handleBack">
            <q-tooltip>Torna indietro</q-tooltip>
          </q-btn>
          <h5>{{ isNew ? 'Nuova Fattura' : `Fattura ${invoiceData.invoiceId}` }}</h5>
          <q-chip v-if="commNum" color="primary" text-color="white" dense>
            Comm. {{ commNum }}
          </q-chip>
        </div>

        <div class="header-actions">
          <q-btn color="negative" flat label="Annulla" @click="handleCancel" />
          <q-btn color="primary" unelevated label="Salva" icon="save" @click="handleSave" :loading="saving" />
        </div>
      </div>

      <!-- Contenuto placeholder -->
      <div class="invoice-content">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-h6">Fattura in costruzione</div>
            <p class="text-grey-7">
              {{ isNew ? 'Nuova fattura' : `Modifica fattura ${invoiceId}` }}
            </p>
            <p v-if="commNum" class="text-grey-7">
              Collegata alla commissione: <strong>{{ commNum }}</strong>
            </p>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useQuasar } from 'quasar'

const router = useRouter()
const route = useRoute()
const $q = useQuasar()

const invoiceId = computed(() => route.params.id)
const commNum = computed(() => route.query.commNum || null)
const isNew = computed(() => !invoiceId.value || invoiceId.value === 'new')
const saving = ref(false)

const invoiceData = reactive({
  invoiceId: '',
  commNum: commNum.value || null,
  // ... altri campi fattura
})

const handleBack = () => {
  if (commNum.value) {
    // Se proviene da una commissione, torna lì
    router.push(`/orders/${commNum.value}`)
  } else {
    // Altrimenti torna alla lista fatture
    router.push('/invoices')
  }
}

const handleCancel = () => {
  $q.dialog({
    title: 'Conferma',
    message: 'Vuoi annullare le modifiche?',
    cancel: true,
    persistent: true
  }).onOk(() => {
    handleBack()
  })
}

const handleSave = async () => {
  saving.value = true

  try {
    // TODO: Implementare salvataggio fattura
    await new Promise(resolve => setTimeout(resolve, 1000))

    $q.notify({
      type: 'positive',
      message: 'Fattura salvata (placeholder)'
    })

    handleBack()
  } catch (err) {
    $q.notify({
      type: 'negative',
      message: 'Errore nel salvataggio',
      caption: err.message
    })
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  console.log('Invoice page mounted', {
    invoiceId: invoiceId.value,
    commNum: commNum.value,
    isNew: isNew.value
  })
})
</script>

<style scoped lang="scss">
.invoice-page {
  background: $bg-light;
}

.invoice-container {
  max-width: 1600px;
  margin: 0 auto;
  padding: 16px;
}

.invoice-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 16px;
  background: $contrast;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  .header-left {
    display: flex;
    align-items: center;
    gap: 12px;

    h5 {
      margin: 0;
      color: $text-primary;
      font-size: 20px;
      font-weight: 600;
    }
  }

  .header-actions {
    display: flex;
    gap: 12px;
  }
}

.invoice-content {
  // Contenuto placeholder
}

@media (max-width: 768px) {
  .invoice-header {
    flex-direction: column;
    gap: 16px;

    .header-left {
      width: 100%;
    }

    .header-actions {
      width: 100%;
      justify-content: flex-end;
    }
  }
}
</style>
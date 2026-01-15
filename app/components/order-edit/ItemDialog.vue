<template>
  <div class="item-dialog-content">
    <q-form @submit.prevent="handleSave" class="item-form">
      <!-- Autocomplete per selezionare prodotto esistente o nuovo -->
      <div class="form-section">
        <div class="section-title">Seleziona Articolo</div>
        <q-select v-model="selectedProductOption" :options="productOptions" option-label="label" option-value="value"
          label="Cerca articolo esistente" outlined dense use-input clearable @filter="filterProducts"
          @update:model-value="handleProductSelect">
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>

          <template v-slot:option="scope">
            <q-item v-bind="scope.itemProps">
              <q-item-section avatar v-if="scope.opt.isNew">
                <q-icon name="add_circle" color="primary" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ scope.opt.label }}</q-item-label>
                <q-item-label caption v-if="scope.opt.caption">
                  {{ scope.opt.caption }}
                </q-item-label>
              </q-item-section>
            </q-item>
          </template>
        </q-select>
      </div>

      <q-separator class="q-my-md" />

      <!-- Form dati articolo -->
      <div class="form-section">
        <div class="section-title">Dati Articolo</div>

        <q-input v-model="localItem.code" label="Codice Articolo" outlined dense />

        <q-input v-model="localItem.description" label="Descrizione *" outlined dense type="textarea" :rows="3"
          class="q-mt-sm" :rules="[val => !!val || 'Campo obbligatorio']" />

        <q-input v-model.number="localItem.quantity" label="Quantità *" type="number" outlined dense min="0"
          class="q-mt-sm" :rules="[val => val >= 0 || 'Quantità non valida']" />
      </div>

      <q-separator class="q-my-md" />

      <!-- Stato articolo -->
      <div class="form-section">
        <div class="section-title">Stato</div>

        <div class="checkboxes-group">
          <q-checkbox v-model="localItem.ready" label="Pronto" dense />
          <q-checkbox v-model="localItem.ordered" label="Ordinato" dense />
        </div>

        <q-select v-model.number="localItem.invoiced" :options="invoicedOptions" label="Fatturato" outlined dense
          emit-value map-options class="q-mt-sm" />

        <q-input v-model="localItem.note" label="Nota" outlined dense type="textarea" :rows="2" class="q-mt-sm" />
      </div>

      <!-- Azioni -->
      <div class="form-actions">
        <q-btn flat label="Annulla" color="negative" @click="emit('close')" />
        <q-btn type="submit" :label="isEditMode ? 'Salva' : 'Aggiungi'" color="primary" unelevated />
      </div>
    </q-form>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useQuasar } from 'quasar'

const props = defineProps({
  item: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['close'])

const $q = useQuasar()

// Determina se siamo in modalità modifica o creazione
const isEditMode = computed(() => {
  return props.item && Object.keys(props.item).length > 0
})

// Stato locale dell'item
const localItem = ref({
  productId: null,
  code: '',
  description: '',
  quantity: 1,
  ready: false,
  ordered: false,
  invoiced: 0,
  note: ''
})

const selectedProductOption = ref(null)
const allProducts = ref([])
const productOptions = ref([])

// Opzioni fatturato
const invoicedOptions = [
  { label: 'Non fatturato (0)', value: 0 },
  { label: 'Fatturato 1', value: 1 },
  { label: 'Fatturato 2', value: 2 },
  { label: 'Fatturato 3', value: 3 }
]

// ✅ Watch per caricare i dati dell'item quando props.item cambia (modalità modifica)
watch(() => props.item, (newVal) => {
  console.log('📝 ItemDialog riceve item:', newVal)

  if (newVal && Object.keys(newVal).length > 0) {
    // Modalità MODIFICA - carica i dati esistenti
    localItem.value = {
      productId: newVal.productId?._id || newVal.productId || null,
      code: newVal.productId?.code || newVal.code || '',
      description: newVal.productId?.name || newVal.description || '',
      quantity: newVal.quantity || 1,
      ready: newVal.ready || false,
      ordered: newVal.ordered || false,
      invoiced: newVal.invoiced || 0,
      note: newVal.note || ''
    }

    // Se c'è un prodotto associato, pre-seleziona nell'autocomplete
    if (newVal.productId) {
      const product = allProducts.value.find(p => p.value === (newVal.productId._id || newVal.productId))
      if (product) {
        selectedProductOption.value = product
      }
    }
  } else {
    // Modalità CREAZIONE - reset dei campi
    localItem.value = {
      productId: null,
      code: '',
      description: '',
      quantity: 1,
      ready: false,
      ordered: false,
      invoiced: 0,
      note: ''
    }
    selectedProductOption.value = null
  }
}, { immediate: true, deep: true })

// Carica lista prodotti
const loadProducts = async () => {
  try {
    const data = await $fetch('/api/products')
    if (data && data.products) {
      allProducts.value = data.products.map(p => ({
        label: p.code || p.name,
        caption: p.name,
        value: p._id,
        product: p,
        isNew: false
      }))

      productOptions.value = [
        { label: '➕ Crea nuovo articolo', value: 'new', isNew: true },
        ...allProducts.value
      ]
    }
  } catch (err) {
    console.error('Errore caricamento prodotti:', err)
  }
}

// Filtra prodotti
const filterProducts = (val, update) => {
  if (val === '') {
    update(() => {
      productOptions.value = [
        { label: '➕ Crea nuovo articolo', value: 'new', isNew: true },
        ...allProducts.value
      ]
    })
    return
  }

  update(() => {
    const needle = val.toLowerCase()
    const filtered = allProducts.value.filter(
      p => p.label.toLowerCase().indexOf(needle) > -1 ||
        (p.caption && p.caption.toLowerCase().indexOf(needle) > -1)
    )
    productOptions.value = [
      { label: '➕ Crea nuovo articolo', value: 'new', isNew: true },
      ...filtered
    ]
  })
}

// Gestisce selezione prodotto
const handleProductSelect = (option) => {
  if (!option) {
    localItem.value.productId = null
    localItem.value.code = ''
    localItem.value.description = ''
    return
  }

  if (option.isNew) {
    // Nuovo prodotto - pulisce campi
    localItem.value.productId = null
    localItem.value.code = ''
    localItem.value.description = ''
    selectedProductOption.value = null
  } else {
    // Carica prodotto esistente
    localItem.value.productId = option.product._id
    localItem.value.code = option.product.code || ''
    localItem.value.description = option.product.name || ''
  }
}

// Salva articolo
// Salva articolo
const handleSave = async () => {
  if (!localItem.value.description) {
    $q.notify({
      type: 'negative',
      message: 'La descrizione è obbligatoria'
    })
    return
  }

  if (localItem.value.quantity < 0) {
    $q.notify({
      type: 'negative',
      message: 'La quantità non può essere negativa'
    })
    return
  }

  // ✅ Se non c'è productId ma c'è code o description, crea nuovo prodotto
  if (!localItem.value.productId && (localItem.value.code || localItem.value.description)) {
    try {
      const data = await $fetch('/api/products', {
        method: 'POST',
        body: {
          code: localItem.value.code || '',
          name: localItem.value.description || '',
          details: ''
        }
      })

      localItem.value.productId = data.product._id
      localItem.value.code = data.product.code || ''
      localItem.value.description = data.product.name || ''

      $q.notify({
        type: 'positive',
        message: 'Prodotto creato con successo'
      })
    } catch (err) {
      $q.notify({
        type: 'negative',
        message: 'Errore creazione prodotto',
        caption: err.message || err.data?.message || 'Errore sconosciuto'
      })
      return
    }
  }

  // ✅ Se esiste productId e i dati sono cambiati, aggiorna il prodotto
  if (localItem.value.productId && isEditMode.value) {
    try {
      const data = await $fetch(`/api/products/${localItem.value.productId}`, {
        method: 'PUT',
        body: {
          code: localItem.value.code || '',
          name: localItem.value.description || '',
          details: ''
        }
      })

      localItem.value.code = data.product.code || ''
      localItem.value.description = data.product.name || ''

      /*
      $q.notify({
        type: 'positive',
        message: 'Prodotto aggiornato con successo'
      })*/
     

    } catch (err) {
      $q.notify({
        type: 'negative',
        message: 'Errore aggiornamento prodotto',
        caption: err.message || err.data?.message || 'Errore sconosciuto'
      })
      return
    }
  }

  // ✅ DEBUG
  console.log('🔍 localItem.value PRIMA di emettere:', JSON.stringify(localItem.value, null, 2))
  console.log('📝 localItem.value.note:', localItem.value.note)

  // ✅ CORREZIONE: Emetti TUTTI i campi necessari
  const itemToSave = {
    productId: localItem.value.productId,
    code: localItem.value.code || '',           // ✅ Aggiunto
    description: localItem.value.description || '', // ✅ Aggiunto
    quantity: localItem.value.quantity,
    ready: localItem.value.ready,
    ordered: localItem.value.ordered,
    invoiced: localItem.value.invoiced,
    note: localItem.value.note || ''            // ✅ Aggiunto
  }

  console.log('📤 ItemDialog emette con:', JSON.stringify(itemToSave, null, 2))
  console.log('📝 itemToSave.note:', itemToSave.note)

  emit('close', itemToSave)
}


// Load on mount
onMounted(() => {
  loadProducts()
})
</script>

<style scoped lang="scss">
.item-dialog-content {
  padding: 16px;
}

.item-form {
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

.checkboxes-group {
  display: flex;
  gap: 24px;
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
<template>
  <div class="invoice-item-dialog-content">
    <q-form @submit.prevent="handleSave" class="invoice-item-form">
      <!-- ✅ NUOVO: Autocomplete per selezionare prodotto esistente o nuovo -->
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

        <div class="row q-col-gutter-sm q-mt-sm">
          <div class="col-6">
            <q-input v-model.number="localItem.quantity" label="Quantità *" type="number" outlined dense min="0"
              :rules="[val => val >= 0 || 'Quantità non valida']" />
          </div>
          <div class="col-6">
            <q-input v-model.number="localItem.unitPrice" label="Prezzo Un. *" type="number" outlined dense step="0.01"
              min="0" :rules="[val => val >= 0 || 'Prezzo non valido']" />
          </div>
        </div>

        <q-input v-model="computedTotal" label="Totale" outlined dense readonly class="q-mt-sm total-field">
          <template v-slot:prepend>
            <q-icon name="euro" />
          </template>
        </q-input>
      </div>

      <div class="form-actions">
        <q-btn flat label="Annulla" color="negative" @click="emit('close')" />
        <q-btn type="submit" label="Salva" color="primary" unelevated />
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

const localItem = ref({
  productId: null,
  orderItemId: null,
  code: '',
  description: '',
  quantity: 0,
  unitPrice: 0
})

const selectedProductOption = ref(null)
const allProducts = ref([])
const productOptions = ref([])

const computedTotal = computed(() => {
  const total = (localItem.value.quantity || 0) * (localItem.value.unitPrice || 0)
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR'
  }).format(total)
})

// ✅ Carica lista prodotti
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

// ✅ Filtra prodotti nell'autocomplete
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

// ✅ Gestisce selezione prodotto dall'autocomplete
const handleProductSelect = (option) => {
  if (!option) {
    localItem.value.productId = null
    localItem.value.code = ''
    localItem.value.description = ''
    selectedProductOption.value = null
    return
  }

  if (option.isNew) {
    // Nuovo prodotto - pulisce i campi
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

// ✅ Watch per caricare i dati quando si modifica un item esistente
watch(() => props.item, (newVal) => {
  if (newVal && Object.keys(newVal).length > 0) {
    localItem.value = {
      productId: newVal.productId || null,
      orderItemId: newVal.orderItemId || null,
      code: newVal.code || '',
      description: newVal.description || '',
      quantity: newVal.quantity || 0,
      unitPrice: newVal.unitPrice || 0
    }

    // Se c'è un prodotto associato, pre-seleziona nell'autocomplete
    if (newVal.productId) {
      const product = allProducts.value.find(p => p.value === newVal.productId)
      if (product) {
        selectedProductOption.value = product
      }
    }
  } else {
    localItem.value = {
      productId: null,
      orderItemId: null,
      code: '',
      description: '',
      quantity: 0,
      unitPrice: 0
    }
    selectedProductOption.value = null
  }
}, { immediate: true, deep: true })

const handleSave = () => {
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

  if (localItem.value.unitPrice < 0) {
    $q.notify({
      type: 'negative',
      message: 'Il prezzo non può essere negativo'
    })
    return
  }

  emit('close', localItem.value)
}

// ✅ Carica prodotti al mount
onMounted(() => {
  loadProducts()
})
</script>

<style scoped lang="scss">
.invoice-item-dialog-content {
  padding: 16px;
}

.invoice-item-form {
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

.total-field {
  :deep(.q-field__control) {
    font-weight: 600;
    background: rgba($primary, 0.05);
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
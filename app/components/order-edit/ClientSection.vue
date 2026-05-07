<template>
  <div class="client-section-content">
    <!-- Header -->
    <div class="client-mini-header sub-header">
      <div class="header-left">
        <q-icon name="person" size="18px" />
        <span class="section-label">Cliente</span>
        <q-checkbox v-if="client" v-model="client.vip" label="VIP" dense class="q-ml-sm" />
      </div>
      <q-btn flat dense round icon="edit" size="sm" color="primary" @click="emit('editClient')">
        <q-tooltip>Modifica Cliente</q-tooltip>
      </q-btn>
    </div>

    <!-- Autocomplete Cliente -->
    <div class="client-autocomplete">
      <q-select
        v-model="selectedClientOption"
        :options="clientOptions"
        option-label="label"
        option-value="value"
        label="Cerca o aggiungi cliente"
        outlined dense use-input clearable
        @filter="filterClients"
        @update:model-value="handleClientSelect">
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
              <q-item-label caption v-if="scope.opt.caption">{{ scope.opt.caption }}</q-item-label>
            </q-item-section>
          </q-item>
        </template>
      </q-select>
    </div>

    <!-- Dati Cliente (read-only) -->
    <div class="client-data" v-if="client?._id || showEmptyForm">

      <!-- Cognome / Nome -->
      <div class="row q-col-gutter-sm">
        <div class="col-6">
          <q-input v-model="client.lastname" label="Cognome" outlined dense readonly class="bg-readonly" />
        </div>
        <div class="col-6">
          <q-input v-model="client.firstname" label="Nome" outlined dense readonly class="bg-readonly" />
        </div>
      </div>

      <!-- Ditta -->
      <q-input v-model="client.company" label="Ditta" outlined dense readonly class="q-mt-sm bg-readonly" />

      <!-- Indirizzo / CAP -->
      <div class="row q-col-gutter-sm q-mt-sm">
        <div class="col-8">
          <q-input v-model="client.address" label="Indirizzo" outlined dense readonly class="bg-readonly" />
        </div>
        <div class="col-4">
          <q-input v-model="client.cap" label="CAP" outlined dense readonly class="bg-readonly" />
        </div>
      </div>

      <!-- Citta / Provincia / Paese -->
      <div class="row q-col-gutter-sm q-mt-sm">
        <div class="col-5">
          <q-input v-model="client.city" label="Citta" outlined dense readonly class="bg-readonly" />
        </div>
        <div class="col-3">
          <q-input v-model="client.region" label="Provincia" outlined dense readonly class="bg-readonly" />
        </div>
        <div class="col-4">
          <q-input v-model="client.state" label="Paese" outlined dense readonly class="bg-readonly" />
        </div>
      </div>

      <!-- P.IVA -->
      <q-input v-model="client.piva" label="P.IVA" outlined dense readonly class="q-mt-sm bg-readonly" />

      <!-- Email 1..n -->
      <template v-if="allEmails(client).length">
        <q-input
          v-for="(email, i) in allEmails(client)"
          :key="'em-' + i"
          :model-value="email"
          :label="i === 0 ? 'Email' : `Email ${i + 1}`"
          outlined dense readonly
          class="bg-readonly q-mt-sm" />
      </template>
      <q-input v-else label="Email" outlined dense readonly class="bg-readonly q-mt-sm" model-value="" />

      <!-- Telefono 1..n -->
      <template v-if="allTels(client).length">
        <q-input
          v-for="(tel, i) in allTels(client)"
          :key="'tel-' + i"
          :model-value="tel"
          :label="i === 0 ? 'Telefono' : `Telefono ${i + 1}`"
          outlined dense readonly
          class="bg-readonly q-mt-sm" />
      </template>
      <q-input v-else label="Telefono" outlined dense readonly class="bg-readonly q-mt-sm" model-value="" />

      <!-- Fax 1..n -->
      <template v-if="allFaxes(client).length">
        <q-input
          v-for="(fax, i) in allFaxes(client)"
          :key="'fax-' + i"
          :model-value="fax"
          :label="i === 0 ? 'Fax' : `Fax ${i + 1}`"
          outlined dense readonly
          class="bg-readonly q-mt-sm" />
      </template>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { allTels, allEmails, allFaxes } from '~/utils/contacts'

const client = defineModel('client', {
  type: Object,
  default: null
})

const emit = defineEmits(['editClient'])

const selectedClientOption = ref(null)
const clientOptions = ref([
  { label: '+ Crea nuovo cliente', value: 'new', isNew: true }
])
const showEmptyForm = ref(false)

let searchTimeout = null

const filterClients = (val, update) => {
  if (val.length < 2) {
    update(() => {
      clientOptions.value = [
        { label: '+ Crea nuovo cliente', value: 'new', isNew: true }
      ]
    })
    return
  }
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(async () => {
    try {
      const data = await $fetch(`/api/clients/search?q=${encodeURIComponent(val)}`)
      const mapped = (data.clients || []).map(c => {
        const fullName = `${c.lastname || ''} ${c.firstname || ''}`.trim()
        return {
          label: fullName || c.company || 'N/A',
          caption: c.city && c.state ? `${c.city}, ${c.state}` : (c.city || c.state || ''),
          value: c._id,
          client: c,
          isNew: false
        }
      })
      update(() => {
        clientOptions.value = [
          { label: '+ Crea nuovo cliente', value: 'new', isNew: true },
          ...mapped
        ]
      })
    } catch (err) {
      console.error('Errore ricerca clienti:', err)
      update(() => {})
    }
  }, 300)
}

const handleClientSelect = (option) => {
  if (!option) {
    client.value = null
    showEmptyForm.value = false
    return
  }
  if (option.isNew) {
    emit('editClient')
    selectedClientOption.value = null
  } else {
    client.value = { ...option.client }
    showEmptyForm.value = false
  }
}
</script>

<style scoped lang="scss">
.client-section-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.client-mini-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  border-radius: 4px;

  .header-left {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .section-label {
    font-weight: 600;
    color: $text-primary;
    font-size: 14px;
  }
}
</style>
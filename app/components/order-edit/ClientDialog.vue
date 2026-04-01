<template>
  <div class="client-dialog-content">
    <q-form @submit.prevent="handleSave" class="client-form" autocomplete="off">

      <!-- Seleziona cliente esistente -->
      <div class="form-section">
        <div class="section-title">Seleziona Cliente</div>
        <q-select
          v-model="selectedClientOption"
          :options="clientOptions"
          option-label="label"
          option-value="value"
          label="Cerca cliente esistente"
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

      <q-separator class="q-my-md" />

      <!-- Dati Anagrafici -->
      <div class="form-section">
        <div class="section-title">Dati Anagrafici</div>
        <div class="row q-col-gutter-sm">
          <div class="col-12 col-sm-6">
            <q-input
              v-model="localClient.lastname"
              label="Cognome"
              outlined dense
              :input-attrs="{ autocomplete: 'new-password' }"
              @update:model-value="v => localClient.lastname = v ? v.charAt(0).toUpperCase() + v.slice(1) : v" />
          </div>
          <div class="col-12 col-sm-6">
            <q-input
              v-model="localClient.firstname"
              label="Nome"
              outlined dense
              :input-attrs="{ autocomplete: 'new-password' }"
              @update:model-value="v => localClient.firstname = v ? v.charAt(0).toUpperCase() + v.slice(1) : v" />
          </div>
        </div>
        <q-input
          v-model="localClient.company"
          label="Ditta"
          outlined dense
          class="q-mt-sm"
          :input-attrs="{ autocomplete: 'new-password' }"
          @update:model-value="v => localClient.company = v ? v.charAt(0).toUpperCase() + v.slice(1) : v" />
        <div class="q-mt-sm">
          <q-checkbox v-model="localClient.vip" label="Cliente VIP" dense />
        </div>
      </div>

      <q-separator class="q-my-md" />

      <!-- Indirizzo -->
      <div class="form-section">
        <div class="section-title">Indirizzo</div>
        <q-input
          v-model="localClient.address"
          label="Indirizzo"
          outlined dense
          :input-attrs="{ autocomplete: 'new-password' }"
          @update:model-value="v => localClient.address = v ? v.charAt(0).toUpperCase() + v.slice(1) : v" />
        <div class="row q-col-gutter-sm q-mt-sm">
          <div class="col-4">
            <q-input
              v-model="localClient.cap"
              label="CAP"
              outlined dense
              :input-attrs="{ autocomplete: 'new-password' }" />
          </div>
          <div class="col-8">
            <q-input
              v-model="localClient.city"
              label="Città"
              outlined dense
              :input-attrs="{ autocomplete: 'new-password' }"
              @update:model-value="v => localClient.city = v ? v.charAt(0).toUpperCase() + v.slice(1) : v" />
          </div>
        </div>
        <div class="row q-col-gutter-sm q-mt-sm">
          <div class="col-12 col-sm-6">
            <q-input
              v-model="localClient.region"
              label="Provincia"
              outlined dense
              :input-attrs="{ autocomplete: 'new-password' }"
              @update:model-value="v => localClient.region = v ? v.toUpperCase() : v" />
          </div>
          <div class="col-12 col-sm-6">
            <q-input
              v-model="localClient.state"
              label="Paese"
              outlined dense
              :input-attrs="{ autocomplete: 'new-password' }"
              @update:model-value="v => localClient.state = v ? v.charAt(0).toUpperCase() + v.slice(1) : v" />
          </div>
        </div>
      </div>

      <q-separator class="q-my-md" />

      <!-- Contatti -->
      <div class="form-section">
        <div class="section-title">Contatti</div>

        <!-- TELEFONI -->
        <div class="contact-group">
          <div class="contact-group-label">Telefono</div>
          <div v-for="(_, i) in localTels" :key="'tel-' + i" class="contact-row">
            <q-input
              v-model="localTels[i]"
              :label="i === 0 ? 'Telefono principale' : `Telefono ${i + 1}`"
              outlined dense
              :input-attrs="{ autocomplete: 'new-password' }"
              class="contact-input" />
            <q-btn
              v-if="i > 0"
              flat round dense
              icon="close"
              color="negative"
              size="sm"
              @click="localTels.splice(i, 1)" />
          </div>
          <q-btn
            flat dense no-caps
            icon="add"
            label="Aggiungi telefono"
            color="primary"
            size="sm"
            class="q-mt-xs"
            @click="localTels.push('')" />
        </div>

        <!-- FAX -->
        <div class="contact-group q-mt-md">
          <div class="contact-group-label">Fax</div>
          <div v-for="(_, i) in localFaxes" :key="'fax-' + i" class="contact-row">
            <q-input
              v-model="localFaxes[i]"
              :label="i === 0 ? 'Fax principale' : `Fax ${i + 1}`"
              outlined dense
              :input-attrs="{ autocomplete: 'new-password' }"
              class="contact-input" />
            <q-btn
              v-if="i > 0"
              flat round dense
              icon="close"
              color="negative"
              size="sm"
              @click="localFaxes.splice(i, 1)" />
          </div>
          <q-btn
            flat dense no-caps
            icon="add"
            label="Aggiungi fax"
            color="primary"
            size="sm"
            class="q-mt-xs"
            @click="localFaxes.push('')" />
        </div>

        <!-- EMAIL -->
        <div class="contact-group q-mt-md">
          <div class="contact-group-label">Email</div>
          <div v-for="(_, i) in localEmails" :key="'em-' + i" class="contact-row">
            <q-input
              v-model="localEmails[i]"
              :label="i === 0 ? 'Email principale' : `Email ${i + 1}`"
              type="email"
              outlined dense
              :input-attrs="{ autocomplete: 'new-password' }"
              class="contact-input" />
            <q-btn
              v-if="i > 0"
              flat round dense
              icon="close"
              color="negative"
              size="sm"
              @click="localEmails.splice(i, 1)" />
          </div>
          <q-btn
            flat dense no-caps
            icon="add"
            label="Aggiungi email"
            color="primary"
            size="sm"
            class="q-mt-xs"
            @click="localEmails.push('')" />
        </div>

        <!-- P.IVA -->
        <q-input
          v-model="localClient.piva"
          label="P.IVA"
          outlined dense
          class="q-mt-md"
          :input-attrs="{ autocomplete: 'new-password' }"
          @update:model-value="v => localClient.piva = v ? v.toUpperCase() : v" />
      </div>

      <!-- Azioni -->
      <div class="form-actions">
        <q-btn type="submit" label="Salva" color="primary" unelevated :loading="saving" />
      </div>
    </q-form>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useQuasar } from 'quasar'

const props = defineProps({
  client: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['close'])

const $q = useQuasar()
const saving = ref(false)
const localClient = ref({ ...props.client })
const selectedClientOption = ref(null)
const allClients = ref([])
const clientOptions = ref([])

// Ref separati per i contatti (array di stringhe, il primo è il principale)
const localTels   = ref([''])
const localFaxes  = ref([''])
const localEmails = ref([''])

// Sincronizza i ref contatti quando cambia localClient
watch(localClient, (c) => {
  localTels.value   = [c.tel   || '', ...(c.tels   || [])]
  localFaxes.value  = [c.fax   || '', ...(c.faxes  || [])]
  localEmails.value = [c.email || '', ...(c.emails  || [])]
  // Garantisce almeno un campo vuoto
  if (localTels.value.length === 0)   localTels.value   = ['']
  if (localFaxes.value.length === 0)  localFaxes.value  = ['']
  if (localEmails.value.length === 0) localEmails.value = ['']
}, { immediate: true, deep: false })

// Carica lista clienti
const loadClients = async () => {
  try {
    const data = await $fetch('/api/clients')
    if (data) {
      allClients.value = data.clients.map(c => {
        const fullName = `${c.lastname || ''} ${c.firstname || ''}`.trim()
        return {
          label: fullName || c.company || 'N/A',
          caption: c.city && c.state ? `${c.city}, ${c.state}` : (c.city || c.state || ''),
          value: c._id,
          client: c,
          isNew: false
        }
      })
      clientOptions.value = [
        { label: '➕ Crea nuovo cliente', value: 'new', isNew: true },
        ...allClients.value
      ]
    }
  } catch (err) {
    console.error('Errore caricamento clienti:', err)
  }
}

const filterClients = (val, update) => {
  if (val === '') {
    update(() => {
      clientOptions.value = [
        { label: '➕ Crea nuovo cliente', value: 'new', isNew: true },
        ...allClients.value
      ]
    })
    return
  }
  update(() => {
    const needle = val.toLowerCase()
    const filtered = allClients.value.filter(
      c => c.label.toLowerCase().includes(needle) ||
        (c.caption && c.caption.toLowerCase().includes(needle)) ||
        (c.client.company && c.client.company.toLowerCase().includes(needle))
    )
    clientOptions.value = [
      { label: '➕ Crea nuovo cliente', value: 'new', isNew: true },
      ...filtered
    ]
  })
}

const handleClientSelect = (option) => {
  if (!option) {
    localClient.value = {}
    return
  }
  if (option.isNew) {
    localClient.value = {}
    selectedClientOption.value = null
  } else {
    localClient.value = { ...option.client }
  }
}

// Compone i campi contatto da scrivere nel body
const composeContacts = () => {
  localClient.value.tel    = localTels.value[0]   || ''
  localClient.value.tels   = localTels.value.slice(1).filter(Boolean)
  localClient.value.fax    = localFaxes.value[0]  || ''
  localClient.value.faxes  = localFaxes.value.slice(1).filter(Boolean)
  localClient.value.email  = localEmails.value[0] || ''
  localClient.value.emails = localEmails.value.slice(1).filter(v => v && v.trim())
}

const handleSave = async () => {
  const hasLastname = localClient.value.lastname?.trim()
  const hasCompany  = localClient.value.company?.trim()

  if (!hasLastname && !hasCompany) {
    $q.notify({ type: 'negative', message: 'Inserisci almeno il cognome o la ditta' })
    return
  }

  composeContacts()
  saving.value = true

  try {
    const endpoint = localClient.value._id ? `/api/clients/${localClient.value._id}` : '/api/clients'
    const method   = localClient.value._id ? 'PUT' : 'POST'

    const data = await $fetch(endpoint, { method, body: localClient.value })

    $q.notify({ type: 'positive', message: 'Cliente salvato con successo' })
    emit('close', data.client)

  } catch (err) {
    $q.notify({ type: 'negative', message: 'Errore nel salvataggio', caption: err.message })
  } finally {
    saving.value = false
  }
}

loadClients()
</script>

<style scoped lang="scss">
.client-dialog-content {
  padding: 16px;
}

.client-form {
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

.contact-group {
  .contact-group-label {
    font-size: 12px;
    font-weight: 500;
    color: $text-secondary;
    margin-bottom: 6px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .contact-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 6px;

    .contact-input {
      flex: 1;
    }
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
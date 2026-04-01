<template>
  <q-card flat bordered class="client-card section-card">
    <q-card-section class="section-header">
      <q-icon name="person" size="18px" />
      <span>Dati Cliente</span>
    </q-card-section>
    <q-card-section class="compact-section">
      <div class="compact-grid">
        <q-input v-model="client.lastname" label="Cognome" outlined dense />
        <q-input v-model="client.firstname" label="Nome" outlined dense />
        <q-input v-model="client.title" label="Titolo" outlined dense class="span-2" />
        <q-input v-model="client.company" label="Ditta" outlined dense class="span-2" />
        <q-input v-model="client.address" label="Indirizzo" outlined dense class="span-2" />
        <q-input v-model="client.cap" label="CAP" outlined dense />
        <q-input v-model="client.city" label="Citta" outlined dense />
        <q-input v-model="client.region" label="Prov" outlined dense />
        <q-input v-model="client.state" label="Paese" outlined dense />
        <q-input v-model="client.piva" label="P.IVA" outlined dense class="span-2" />

        <!-- Email 1..n -->
        <template v-for="(_, i) in localEmails" :key="'em-' + i">
          <div class="span-2 contact-row">
            <q-input
              v-model="localEmails[i]"
              :label="i === 0 ? 'Email' : `Email ${i + 1}`"
              type="email"
              outlined dense
              class="contact-input" />
            <q-btn
              v-if="i > 0"
              flat round dense icon="close"
              color="negative" size="sm"
              @click="removeContact(localEmails, i)" />
          </div>
        </template>
        <div class="span-2">
          <q-btn flat dense no-caps icon="add" label="Email" color="primary" size="sm"
            @click="localEmails.push('')" />
        </div>

        <!-- Telefoni 1..n -->
        <template v-for="(_, i) in localTels" :key="'tel-' + i">
          <div class="span-2 contact-row">
            <q-input
              v-model="localTels[i]"
              :label="i === 0 ? 'Tel' : `Tel ${i + 1}`"
              outlined dense
              class="contact-input" />
            <q-btn
              v-if="i > 0"
              flat round dense icon="close"
              color="negative" size="sm"
              @click="removeContact(localTels, i)" />
          </div>
        </template>
        <div class="span-2">
          <q-btn flat dense no-caps icon="add" label="Telefono" color="primary" size="sm"
            @click="localTels.push('')" />
        </div>

        <!-- Fax 1..n -->
        <template v-for="(_, i) in localFaxes" :key="'fax-' + i">
          <div class="span-2 contact-row">
            <q-input
              v-model="localFaxes[i]"
              :label="i === 0 ? 'Fax' : `Fax ${i + 1}`"
              outlined dense
              class="contact-input" />
            <q-btn
              v-if="i > 0"
              flat round dense icon="close"
              color="negative" size="sm"
              @click="removeContact(localFaxes, i)" />
          </div>
        </template>
        <div class="span-2">
          <q-btn flat dense no-caps icon="add" label="Fax" color="primary" size="sm"
            @click="localFaxes.push('')" />
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { ref, watch } from 'vue'
import { allTels, allEmails, allFaxes } from '~/utils/contacts'

const client = defineModel('client', {
  type: Object,
  required: true
})

// Ref locali per i contatti multipli
const localTels   = ref([''])
const localEmails = ref([''])
const localFaxes  = ref([''])

// Inizializza dai dati del client
watch(client, (c) => {
  if (!c) return
  localTels.value   = allTels(c).length   ? [...allTels(c)]   : ['']
  localEmails.value = allEmails(c).length ? [...allEmails(c)] : ['']
  localFaxes.value  = allFaxes(c).length  ? [...allFaxes(c)]  : ['']
}, { immediate: true, deep: false })

// Propaga le modifiche al client
watch([localTels, localEmails, localFaxes], () => {
  client.value.tel    = localTels.value[0]   || ''
  client.value.tels   = localTels.value.slice(1).filter(Boolean)
  client.value.email  = localEmails.value[0] || ''
  client.value.emails = localEmails.value.slice(1).filter(v => v && v.trim())
  client.value.fax    = localFaxes.value[0]  || ''
  client.value.faxes  = localFaxes.value.slice(1).filter(Boolean)
}, { deep: true })

const removeContact = (arr, i) => arr.splice(i, 1)
</script>

<style scoped lang="scss">
.compact-section {
  padding: 8px !important;
}

.compact-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 6px;

  .span-2 {
    grid-column: span 2;
  }

  :deep(.q-field) {
    margin-bottom: 0;
  }

  :deep(.q-field__control) {
    min-height: 40px;
  }

  :deep(.q-field__label) {
    font-size: 12px;
  }

  :deep(input) {
    font-size: 12px;
  }
}

.contact-row {
  display: flex;
  align-items: center;
  gap: 4px;

  .contact-input {
    flex: 1;
  }
}
</style>
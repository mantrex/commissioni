
<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <q-icon name="business" size="48px" color="primary" />
        <h1 class="login-title">Sistema Commissioni</h1>
        <p class="login-subtitle">Accedi al pannello di amministrazione</p>
      </div>

      <q-form @submit.prevent="handleLogin" class="login-form">
        <q-input v-model="username" label="Username" outlined dense :disable="loading" @keypress="handleKeyPress"
          class="login-input">
          <template v-slot:prepend>
            <q-icon name="person" />
          </template>
        </q-input>

        <q-input v-model="password" :type="showPassword ? 'text' : 'password'" label="Password" outlined dense
          :disable="loading" @keypress="handleKeyPress" class="login-input">
          <template v-slot:prepend>
            <q-icon name="lock" />
          </template>
          <template v-slot:append>
            <q-icon :name="showPassword ? 'visibility' : 'visibility_off'" class="cursor-pointer"
              @click="showPassword = !showPassword" />
          </template>
        </q-input>

        <q-banner v-if="error" class="error-banner" dense rounded>
          <template v-slot:avatar>
            <q-icon name="warning" color="negative" />
          </template>
          {{ error }}
        </q-banner>

        <q-btn type="submit" label="Accedi" color="primary" class="login-button" :loading="loading"
          :disable="!username || !password" unelevated no-caps />
      </q-form>

      <div class="login-footer">
        <p class="text-secondary">v1.0.0</p>
      </div>
    </div>
  </div>
</template>


<script setup>
import { ref } from 'vue'
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()
const router = useRouter()

const username = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')
const showPassword = ref(false)

const handleLogin = async () => {
  if (!username.value || !password.value) {
    error.value = 'Inserisci username e password'
    return
  }

  error.value = ''
  loading.value = true

  try {
    const result = await authStore.login(username.value, password.value)
    if (result.success) {
      router.push('/')
    } else {
      error.value = result.error || 'Credenziali non valide'
    }
  } catch (err) {
    error.value = 'Errore durante il login. Riprova.'
  } finally {
    loading.value = false
  }
}

const handleKeyPress = (event) => {
  if (event.key === 'Enter') {
    handleLogin()
  }
}
</script>



<style scoped lang="scss">
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #2c5f7d 0%, #34495e 100%);
  padding: 20px;
}

.login-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 440px;
  padding: 48px 40px;
}

.login-header {
  text-align: center;
  margin-bottom: 40px;

  .q-icon {
    margin-bottom: 16px;
  }
}

.login-title {
  font-size: 28px;
  font-weight: 600;
  color: $text-primary;
  margin: 0 0 8px 0;
}

.login-subtitle {
  font-size: 14px;
  color: $text-secondary;
  margin: 0;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.login-input {
  :deep(.q-field__control) {
    border-radius: 8px;
  }
}

.error-banner {
  background-color: rgba(231, 76, 60, 0.1);
  border: 1px solid $negative;
  color: $negative;
  font-size: 14px;
}

.login-button {
  height: 48px;
  font-size: 16px;
  font-weight: 500;
  border-radius: 8px;
  margin-top: 12px;
}

.login-footer {
  text-align: center;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid $border;

  p {
    margin: 0;
    font-size: 12px;
    color: $text-secondary;
  }
}

@media (max-width: 600px) {
  .login-card {
    padding: 32px 24px;
  }

  .login-title {
    font-size: 24px;
  }
}
</style>
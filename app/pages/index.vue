<script setup>
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()

// Il middleware gestisce già l'autenticazione
</script>

<template>
  <NuxtLayout name="main-layout">
    <div class="dashboard-container">
      <h1>Dashboard Commissioni</h1>
      <p>Benvenuto, {{ authStore.user?.username }}</p>
    </div>
  </NuxtLayout>
</template>

<style scoped lang="scss">
.dashboard-container {
  padding: 24px;
}

h1 {
  color: $text-primary;
  margin-bottom: 16px;
}

p {
  color: $text-secondary;
}
</style>
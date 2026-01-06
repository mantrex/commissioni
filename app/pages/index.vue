

<template>
<Main />
</template>

<script setup>
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()

// Il middleware gestisce già l'autenticazione
</script>
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
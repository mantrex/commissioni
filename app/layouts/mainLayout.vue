<script setup>
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()

const handleLogout = () => {
  authStore.logout()
}
</script>

<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated class="bg-header">
      <q-toolbar>
        <q-toolbar-title>
          <q-icon name="business" size="24px" class="q-mr-sm" />
          Sistema Commissioni
        </q-toolbar-title>

        <q-btn flat dense round icon="account_circle">
          <q-menu>
            <q-list style="min-width: 180px">
              <q-item-label header>{{ authStore.user?.username }}</q-item-label>
              <q-separator />
              <q-item clickable v-close-popup @click="handleLogout">
                <q-item-section avatar>
                  <q-icon name="logout" />
                </q-item-section>
                <q-item-section>Logout</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <q-page class="q-pa-md">
        <slot />
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<style scoped lang="scss">
.bg-header {
  background-color: $header !important;
}
</style>
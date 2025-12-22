import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    isAuthenticated: false,
    loading: false
  }),

  actions: {
    async login(username, password) {
      this.loading = true
      try {
        const { data, error } = await useFetch('/api/auth/login', {
          method: 'POST',
          body: { username, password }
        })

        if (error.value) {
          throw new Error(error.value.data?.message || 'Errore durante il login')
        }

        this.user = data.value.user
        this.isAuthenticated = true

        return { success: true }
      } catch (error) {
        return {
          success: false,
          error: error.message
        }
      } finally {
        this.loading = false
      }
    },

    async logout() {
      try {
        await $fetch('/api/auth/logout', { method: 'POST' })
        this.user = null
        this.isAuthenticated = false

        // Redirect alla login
        navigateTo('/login')
      } catch (error) {
        console.error('Errore logout:', error)
      }
    },

    async checkAuth() {
      try {
        const { data } = await useFetch('/api/auth/me')

        if (data.value) {
          this.user = data.value.user
          this.isAuthenticated = true
        }
      } catch (error) {
        this.user = null
        this.isAuthenticated = false
      }
    }
  }
})
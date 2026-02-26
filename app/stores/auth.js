import { defineStore } from "pinia"

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null,
    isAuthenticated: false,
    loading: false
  }),

  actions: {
    async login(username, password) {
      this.loading = true
      try {
        const { data, error } = await $fetch("/api/auth/login", {
          method: "POST",
          body: { username, password }
        })

        // ✅ data è un Ref
        this.user = data?.user
        this.isAuthenticated = !!this.user

        return { success: true }
      } catch (err) {
        return { success: false, error: err.message }
      } finally {
        this.loading = false
      }
    },

    async logout() {
      try {
        await $fetch("/api/auth/logout", { method: "POST" })

        this.user = null
        this.isAuthenticated = false
        navigateTo("/login")
      } catch (err) {
        console.error("Errore logout:", err)
      }
    },

    async checkAuth() {
      try {
        // ✅ devi destrutturare { data, error }
        const data = await $fetch("/api/auth/me", { method: "GET" })

        this.user = data?.user
        this.isAuthenticated = !!this.user
      } catch {
        this.user = null
        this.isAuthenticated = false
      }
    }
  }
})

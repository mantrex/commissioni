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
        const { data, error } = await useFetch("/api/auth/login", {
          method: "POST",
          body: { username, password }
        })

        // ✅ error è un Ref -> devi leggere .value
        if (error.value) {
          throw new Error(error.value?.data?.message || error.value?.message || "Errore durante il login")
        }

        // ✅ data è un Ref
        this.user = data.value?.user ?? null
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
        const { error } = await useFetch("/api/auth/logout", { method: "POST" })

        // ✅ controlla error.value
        if (error.value) {
          throw new Error(error.value?.data?.message || error.value?.message || "Errore logout")
        }

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
        const { data, error } = await useFetch("/api/auth/me", { method: "GET" })

        if (error.value) {
          // 401/403 ecc. -> non autenticato
          this.user = null
          this.isAuthenticated = false
          return
        }

        this.user = data.value?.user ?? null
        this.isAuthenticated = !!this.user
      } catch {
        this.user = null
        this.isAuthenticated = false
      }
    }
  }
})

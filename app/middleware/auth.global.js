import { useAuthStore } from "~/stores/auth"
export default defineNuxtRouteMiddleware(async (to) => {
  const authStore = useAuthStore()

  // Pagine pubbliche
  const publicPages = ['/login']
  const isPublicPage = publicPages.includes(to.path)

  // Se non è autenticato, controlla la sessione
  if (!authStore.isAuthenticated && !isPublicPage) {
    await authStore.checkAuth()
  }

  // Se non autenticato e non è pagina pubblica, redirect al login
  if (!authStore.isAuthenticated && !isPublicPage) {
    return navigateTo('/login')
  }

  // Se autenticato e cerca di accedere al login, redirect alla home
  if (authStore.isAuthenticated && to.path === '/login') {
    return navigateTo('/')
  }
})
// auth.global.js
export default defineNuxtRouteMiddleware(async (to) => {
  const authStore = useAuthStore()
  const publicPages = ['/login']
  const isPublicPage = publicPages.includes(to.path)

  // Prima verifica: se già autenticato e vai al login, redirect
  if (authStore.isAuthenticated && isPublicPage) {
    return navigateTo('/')
  }

  // Se non autenticato, verifica la sessione
  if (!authStore.isAuthenticated && !isPublicPage) {
    await authStore.checkAuth()

    // Dopo il check, se ancora non autenticato, redirect obbligatorio
    if (!authStore.isAuthenticated) {
      return navigateTo('/login')
    }
  }
})
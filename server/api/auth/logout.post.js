export default defineEventHandler(async (event) => {
  // Rimuove il cookie (auto-importato!)
  clearSessionCookie(event)

  return {
    success: true,
    message: 'Logout effettuato'
  }
})
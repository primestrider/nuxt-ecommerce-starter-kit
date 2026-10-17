export default defineNuxtRouteMiddleware(async (to) => {
  const auth = useAuthStore()
  await auth.ensureLoaded()
  if (!auth.user) {
    return navigateTo(useLocalePath()({ path: '/auth/login', query: { redirect: to.fullPath } }))
  }
})

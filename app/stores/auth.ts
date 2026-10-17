export const useAuthStore = defineStore('auth', () => {
  const user = ref<SessionUser | null>(null)
  let loading: Promise<void> | undefined

  /** Loads the session once; route middleware awaits this before checking `user`. */
  function ensureLoaded() {
    loading ??= $fetch<SessionUser>('/api/auth/me')
      .then((me) => { user.value = me })
      .catch(() => { user.value = null })
    return loading
  }

  async function login(input: LoginInput) {
    user.value = await $fetch<SessionUser>('/api/auth/login', { method: 'POST', body: input })
    loading = Promise.resolve()
  }

  async function logout() {
    await $fetch('/api/auth/logout', { method: 'POST' })
    user.value = null
  }

  /** Called when an API request reports the session is gone. */
  function expire() {
    user.value = null
  }

  return { user, ensureLoaded, login, logout, expire }
})

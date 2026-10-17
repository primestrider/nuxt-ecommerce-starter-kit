import * as z from 'zod'

// Localises form validation messages. Client-only: z.config is global, so setting it
// during SSR would leak one request's locale into concurrent requests.
export default defineNuxtPlugin((nuxtApp) => {
  const locale = nuxtApp.$i18n.locale
  watch(locale, code => z.config(code === 'id' ? z.locales.id() : z.locales.en()), { immediate: true })
})

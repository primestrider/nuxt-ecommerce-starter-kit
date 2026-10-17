<script setup lang="ts">
import type { AuthFormField, FormSubmitEvent } from '@nuxt/ui'

definePageMeta({ middleware: 'guest' })

const { t } = useI18n()
const localePath = useLocalePath()
const route = useRoute()
const toast = useToast()
const auth = useAuthStore()

const fields = computed<AuthFormField[]>(() => [
  { name: 'username', type: 'text', label: t('auth.username'), autocomplete: 'username', required: true },
  { name: 'password', type: 'password', label: t('auth.password'), autocomplete: 'current-password', required: true },
])

const errorMessage = ref<string>()
const loading = ref(false)

// Only follow same-site paths, so the login page can't be used as an open redirect.
const redirect = computed(() => {
  const target = route.query.redirect
  return typeof target === 'string' && target.startsWith('/') && !target.startsWith('//') ? target : localePath('/account')
})

async function onSubmit(event: FormSubmitEvent<LoginInput>) {
  errorMessage.value = undefined
  loading.value = true
  try {
    await auth.login(event.data)
    toast.add({ title: t('auth.welcome', { name: auth.user?.firstName ?? '' }), icon: 'i-lucide-hand' })
    await navigateTo(redirect.value)
  } catch (error) {
    const status = (error as { statusCode?: number }).statusCode
    errorMessage.value = t(status === 429 ? 'auth.tooManyAttempts' : 'auth.invalidCredentials')
  } finally {
    loading.value = false
  }
}

useSeoMeta({ title: () => t('auth.loginTitle') })
</script>

<template>
  <UContainer class="flex justify-center py-16">
    <UPageCard class="w-full max-w-md">
      <UAuthForm
        :schema="loginSchema"
        :fields="fields"
        :title="t('auth.loginTitle')"
        :description="t('auth.loginText')"
        :submit="{ label: t('auth.submitLogin'), block: true }"
        :loading="loading"
        @submit="onSubmit"
      >
        <template #validation>
          <UAlert v-if="errorMessage" color="error" variant="subtle" icon="i-lucide-circle-alert" :title="errorMessage" role="alert" />
        </template>
        <template #footer>
          <UAlert color="neutral" variant="subtle" icon="i-lucide-key-round" :title="t('auth.demoHint')" class="mb-4 text-left" />
          {{ t('auth.noAccount') }}
          <ULink :to="localePath('/auth/register')" class="font-medium text-primary">
            {{ t('nav.register') }}
          </ULink>
        </template>
      </UAuthForm>
    </UPageCard>
  </UContainer>
</template>

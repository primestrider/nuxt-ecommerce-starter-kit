<script setup lang="ts">
import type { AuthFormField, FormSubmitEvent } from '@nuxt/ui'

definePageMeta({ middleware: 'guest' })

const { t } = useI18n()
const localePath = useLocalePath()
const toast = useToast()

const fields = computed<AuthFormField[]>(() => [
  { name: 'firstName', type: 'text', label: t('auth.firstName'), autocomplete: 'given-name', required: true },
  { name: 'lastName', type: 'text', label: t('auth.lastName'), autocomplete: 'family-name', required: true },
  { name: 'email', type: 'email', label: t('auth.email'), autocomplete: 'email', required: true },
  { name: 'username', type: 'text', label: t('auth.username'), autocomplete: 'username', required: true },
  { name: 'password', type: 'password', label: t('auth.password'), autocomplete: 'new-password', required: true },
])

const errorMessage = ref<string>()
const loading = ref(false)

async function onSubmit(event: FormSubmitEvent<RegisterInput>) {
  errorMessage.value = undefined
  loading.value = true
  try {
    await $fetch('/api/auth/register', { method: 'POST', body: event.data })
    toast.add({ title: t('auth.registered'), description: t('auth.registeredText'), color: 'success', icon: 'i-lucide-check', duration: 8000 })
    await navigateTo(localePath('/auth/login'))
  } catch (error) {
    const status = (error as { statusCode?: number }).statusCode
    errorMessage.value = t(status === 429 ? 'auth.tooManyAttempts' : 'auth.registerFailed')
  } finally {
    loading.value = false
  }
}

useSeoMeta({ title: () => t('auth.registerTitle') })
</script>

<template>
  <UContainer class="flex justify-center py-16">
    <UPageCard class="w-full max-w-md">
      <UAuthForm
        :schema="registerSchema"
        :fields="fields"
        :title="t('auth.registerTitle')"
        :description="t('auth.registerText')"
        :submit="{ label: t('auth.submitRegister'), block: true }"
        :loading="loading"
        @submit="onSubmit"
      >
        <template #validation>
          <UAlert v-if="errorMessage" color="error" variant="subtle" icon="i-lucide-circle-alert" :title="errorMessage" role="alert" />
        </template>
        <template #footer>
          {{ t('auth.hasAccount') }}
          <ULink :to="localePath('/auth/login')" class="font-medium text-primary">
            {{ t('nav.login') }}
          </ULink>
        </template>
      </UAuthForm>
    </UPageCard>
  </UContainer>
</template>

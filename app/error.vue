<script setup lang="ts">
import type { NuxtError } from '#app'
import { en, id } from '@nuxt/ui/locale'

const props = defineProps<{ error: NuxtError }>()

const { t, locale } = useI18n()
const localePath = useLocalePath()
const notFound = computed(() => props.error.statusCode === 404)

useSeoMeta({ title: () => t(notFound.value ? 'error.notFoundTitle' : 'error.genericTitle') })
</script>

<template>
  <UApp :locale="locale === 'id' ? id : en">
    <NuxtLayout>
      <UContainer class="py-24 sm:py-32">
        <p class="display text-[clamp(6rem,20vw,16rem)] text-dimmed">
          {{ error.statusCode }}
        </p>
        <h1 class="mt-6 display text-(length:--text-head) text-highlighted">
          {{ t(notFound ? 'error.notFoundTitle' : 'error.genericTitle') }}
        </h1>
        <p class="mt-3 max-w-prose text-muted">
          {{ t(notFound ? 'error.notFoundText' : 'error.genericText') }}
        </p>
        <UButton
          class="mt-8"
          :label="t('error.backHome')"
          @click="clearError({ redirect: localePath('/') })"
        />
      </UContainer>
    </NuxtLayout>
  </UApp>
</template>

<script setup lang="ts">
import { en, id } from '@nuxt/ui/locale'

const { locale, localeProperties } = useI18n()
const uiLocale = computed(() => (locale.value === 'id' ? id : en))

useHead({
  htmlAttrs: { lang: computed(() => localeProperties.value.language) },
})
</script>

<template>
  <UApp :locale="uiLocale">
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>

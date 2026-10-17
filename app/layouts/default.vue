<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <div>
    <a
      href="#main"
      class="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[60] focus:rounded-md focus:bg-default focus:px-3 focus:py-2 focus:text-sm focus:ring-2 focus:ring-primary"
    >
      {{ t('nav.skipToContent') }}
    </a>
    <HeaderComponent />
    <UMain id="main" class="bg-muted pb-4">
      <slot />
    </UMain>
    <FooterComponent />
    <CartDrawer />
  </div>
</template>

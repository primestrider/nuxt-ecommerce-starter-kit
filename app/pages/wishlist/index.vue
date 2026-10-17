<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
const wishlist = useWishlistStore()

useSeoMeta({ title: () => t('wishlist.title') })
</script>

<template>
  <UContainer class="py-10">
    <h1 class="display text-(length:--text-head) text-highlighted">
      {{ t('wishlist.title') }}
    </h1>

    <UEmpty
      v-if="!wishlist.items.length"
      icon="i-lucide-heart"
      :title="t('wishlist.emptyTitle')"
      :description="t('wishlist.emptyText')"
      variant="naked"
      class="py-24"
      :actions="[{ label: t('cart.continueShopping'), to: localePath('/products') }]"
    />
    <ProductGrid v-else :products="wishlist.items" class="mt-8" />
  </UContainer>
</template>

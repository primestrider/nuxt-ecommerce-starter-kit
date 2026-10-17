<script setup lang="ts">
defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<{ product: ProductSummary; labelled?: boolean }>(), { labelled: false })

const { t } = useI18n()
const wishlist = useWishlistStore()
const saved = computed(() => wishlist.has(props.product.id))
const label = computed(() => t(saved.value ? 'product.removeFromWishlist' : 'product.addToWishlist'))
</script>

<template>
  <!-- Wishlist lives in localStorage, so the saved state is only known after mount. -->
  <ClientOnly>
    <UButton
      icon="i-lucide-heart"
      :color="saved ? 'error' : 'neutral'"
      :variant="saved || labelled ? 'soft' : 'ghost'"
      :label="labelled ? label : undefined"
      :aria-label="labelled ? undefined : label"
      :aria-pressed="saved"
      v-bind="$attrs"
      @click="wishlist.toggle(product)"
    />
    <template #fallback>
      <UButton
        icon="i-lucide-heart"
        color="neutral"
        :variant="labelled ? 'soft' : 'ghost'"
        :label="labelled ? t('product.addToWishlist') : undefined"
        :aria-label="labelled ? undefined : t('product.addToWishlist')"
        disabled
        v-bind="$attrs"
      />
    </template>
  </ClientOnly>
</template>

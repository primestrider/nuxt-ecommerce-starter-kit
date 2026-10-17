<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
const cart = useCartStore()
const open = useCartDrawer()

// Close when navigating away (e.g. following a product link inside the drawer).
const route = useRoute()
watch(() => route.fullPath, () => { open.value = false })
</script>

<template>
  <USlideover
    v-model:open="open"
    :title="t('cart.title')"
    :description="t('cart.items', cart.count)"
    :ui="{ body: 'py-0 sm:py-0', footer: 'flex-col items-stretch gap-4' }"
  >
    <template #body>
      <ul v-if="cart.lines.length" class="space-y-2">
        <CartLineItem v-for="line in cart.lines" :key="line.id" :line="line" compact />
      </ul>
      <UEmpty
        v-else
        icon="i-lucide-shopping-bag"
        :title="t('cart.emptyTitle')"
        :description="t('cart.emptyText')"
        variant="naked"
        class="py-16"
        :actions="[{ label: t('cart.continueShopping'), to: localePath('/products'), color: 'neutral', variant: 'soft' }]"
      />
    </template>

    <template v-if="cart.lines.length" #footer>
      <OrderSummary :subtotal="cart.subtotal" />
      <div class="grid grid-cols-2 gap-2">
        <UButton :label="t('cart.viewCart')" :to="localePath('/cart')" color="neutral" variant="soft" block />
        <UButton :label="t('cart.checkout')" :to="localePath('/checkout')" block />
      </div>
    </template>
  </USlideover>
</template>

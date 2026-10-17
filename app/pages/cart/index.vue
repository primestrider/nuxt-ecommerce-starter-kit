<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
const money = useMoney()
const cart = useCartStore()
const freeShippingFrom = computed(() => money(FREE_SHIPPING_FROM))

useSeoMeta({ title: () => t('cart.title') })
</script>

<template>
  <UContainer class="py-10">
    <h1 class="display text-(length:--text-head) text-highlighted">
      {{ t('cart.title') }}
    </h1>

    <UEmpty
      v-if="!cart.lines.length"
      icon="i-lucide-shopping-bag"
      :title="t('cart.emptyTitle')"
      :description="t('cart.emptyText')"
      variant="naked"
      class="py-24"
      :actions="[{ label: t('cart.continueShopping'), to: localePath('/products') }]"
    />

    <div v-else class="mt-8 grid gap-10 lg:grid-cols-12 lg:gap-16">
      <section :aria-label="t('cart.items', cart.count)" class="rounded-xl bg-default p-4 sm:p-6 lg:col-span-8">
        <p class="text-base text-muted">
          {{ t('cart.items', cart.count) }}
        </p>
        <ul class="mt-4 space-y-2">
          <CartLineItem v-for="line in cart.lines" :key="line.id" :line="line" />
        </ul>
      </section>

      <aside class="lg:col-span-4">
        <div class="rounded-xl bg-default p-6 lg:sticky lg:top-28">
          <OrderSummary :subtotal="cart.subtotal" />
          <UButton :label="t('cart.checkout')" :to="localePath('/checkout')" size="lg" block class="mt-6" />
          <p class="mt-4 text-sm text-muted">
            {{ t('cart.freeShippingHint', { amount: freeShippingFrom }) }}
            {{ t('cart.priceNote') }}
          </p>
        </div>
      </aside>
    </div>
  </UContainer>
</template>

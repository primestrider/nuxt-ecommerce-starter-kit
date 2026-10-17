<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const { t } = useI18n()
const localePath = useLocalePath()
const money = useMoney()
const order = useLastOrder()

// The confirmation only exists right after checkout; a reload lands on the order list.
if (!order.value) await navigateTo(localePath('/account'), { replace: true })

useSeoMeta({ title: () => t('checkout.successTitle') })
</script>

<template>
  <UContainer v-if="order" class="max-w-2xl py-16">
    <UIcon name="i-lucide-circle-check" class="size-12 text-success" aria-hidden="true" />
    <h1 class="mt-4 display text-(length:--text-head) text-highlighted">
      {{ t('checkout.successTitle') }}
    </h1>
    <p class="mt-3 text-lg text-muted">
      {{ t('checkout.successText', { id: order.id, total: money(order.total) }) }}
    </p>

    <ul class="mt-8 space-y-1 rounded-xl bg-default p-5">
      <li v-for="line in order.lines" :key="line.id" class="flex items-center gap-3 py-3 text-sm">
        <NuxtImg :src="line.thumbnail" alt="" width="48" height="48" class="size-12 shrink-0 bg-default object-contain p-1" />
        <span class="flex-1 text-highlighted">{{ line.title }}</span>
        <span class="text-muted">× {{ line.quantity }}</span>
        <span class="w-24 text-right text-highlighted">{{ money(line.total) }}</span>
      </li>
    </ul>
    <OrderSummary :subtotal="order.subtotal" :shipping="order.shipping" class="mt-4" />

    <div class="mt-10 flex flex-wrap gap-3">
      <UButton :label="t('checkout.viewOrders')" :to="localePath('/account')" />
      <UButton :label="t('cart.continueShopping')" :to="localePath('/products')" color="neutral" variant="soft" />
    </div>
  </UContainer>
</template>

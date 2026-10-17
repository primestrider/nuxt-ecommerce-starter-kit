<script setup lang="ts">
const props = defineProps<{ subtotal: number; shipping?: number | null }>()

const { t } = useI18n()
const money = useMoney()
const total = computed(() => roundMoney(props.subtotal + (props.shipping ?? 0)))
</script>

<template>
  <dl class="space-y-2 text-sm">
    <div class="flex justify-between">
      <dt class="text-muted">
        {{ t('cart.subtotal') }}
      </dt>
      <dd class="text-highlighted">
        {{ money(subtotal) }}
      </dd>
    </div>
    <div class="flex justify-between">
      <dt class="text-muted">
        {{ t('cart.shipping') }}
      </dt>
      <dd class="text-highlighted">
        <template v-if="shipping == null">
          {{ t('cart.shippingAtCheckout') }}
        </template>
        <template v-else-if="shipping === 0">
          {{ t('cart.free') }}
        </template>
        <template v-else>
          {{ money(shipping) }}
        </template>
      </dd>
    </div>
    <div class="flex justify-between pt-3 text-(length:--text-lead)">
      <dt class="text-highlighted">
        {{ t('cart.total') }}
      </dt>
      <dd class="text-highlighted">
        {{ money(total) }}
      </dd>
    </div>
  </dl>
</template>

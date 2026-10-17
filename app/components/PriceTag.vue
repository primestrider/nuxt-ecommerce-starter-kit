<script setup lang="ts">
const props = withDefaults(defineProps<{
  price: number
  discountPercentage: number
  size?: 'sm' | 'lg'
  /** Show the discount tag next to large prices. */
  tag?: boolean
}>(), { size: 'sm', tag: true })

const { t } = useI18n()
const money = useMoney()
const final = computed(() => discountedPrice(props.price, props.discountPercentage))
const discounted = computed(() => props.discountPercentage >= 1)
</script>

<template>
  <p class="flex flex-wrap items-baseline gap-x-2 gap-y-1">
    <span
      class="text-highlighted"
      :class="size === 'lg' ? 'display text-(length:--text-head)' : 'font-medium'"
    >{{ money(final) }}</span>
    <template v-if="discounted">
      <s class="text-muted" :class="size === 'lg' ? 'text-(length:--text-lead)' : 'text-(length:--text-small)'">
        <span class="sr-only">{{ t('product.originalPrice', { price: money(price) }) }}</span>
        <span aria-hidden="true">{{ money(price) }}</span>
      </s>
      <span v-if="size === 'lg' && tag" class="price-tag self-center">
        {{ t('product.discount', { percent: Math.round(discountPercentage) }) }}
      </span>
    </template>
  </p>
</template>

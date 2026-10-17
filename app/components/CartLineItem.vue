<script setup lang="ts">
const props = defineProps<{ line: CartLine; compact?: boolean }>()

const { t } = useI18n()
const money = useMoney()
const localePath = useLocalePath()
const cart = useCartStore()

const quantity = computed({
  get: () => props.line.quantity,
  set: value => cart.setQuantity(props.line.id, value ?? 1),
})
const lineTotal = computed(() => discountedPrice(props.line.price, props.line.discountPercentage) * props.line.quantity)
</script>

<template>
  <li class="flex gap-4 py-4">
    <NuxtLink
      :to="localePath(`/products/${line.id}`)"
      class="shrink-0 overflow-hidden bg-muted"
      :class="compact ? 'size-16' : 'size-24'"
      tabindex="-1"
      aria-hidden="true"
    >
      <NuxtImg :src="line.thumbnail" alt="" width="96" height="96" class="size-full object-contain p-1.5" />
    </NuxtLink>

    <div class="flex min-w-0 flex-1 flex-col gap-2">
      <div class="flex items-start justify-between gap-3">
        <NuxtLink :to="localePath(`/products/${line.id}`)" class="line-clamp-2 text-sm font-medium text-highlighted hover:underline">
          {{ line.title }}
        </NuxtLink>
        <span class="shrink-0 text-sm font-medium text-highlighted">{{ money(lineTotal) }}</span>
      </div>

      <div class="mt-auto flex items-center justify-between gap-3">
        <UInputNumber
          v-model="quantity"
          :min="1"
          :max="cart.maxQuantity(line)"
          size="sm"
          class="w-28"
          :aria-label="t('product.quantity')"
        />
        <UButton
          icon="i-lucide-trash-2"
          color="neutral"
          variant="ghost"
          size="sm"
          :aria-label="t('cart.remove', { title: line.title })"
          @click="cart.remove(line.id)"
        />
      </div>
    </div>
  </li>
</template>

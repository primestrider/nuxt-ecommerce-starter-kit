<script setup lang="ts">
const props = defineProps<{ product: ProductSummary; eager?: boolean; showStock?: boolean }>()

const { t } = useI18n()
const localePath = useLocalePath()
const money = useMoney()

const final = computed(() => discountedPrice(props.product.price, props.product.discountPercentage))
const discounted = computed(() => props.product.discountPercentage >= 1)
// Bar for the deals row: how much of a typical batch (100 units) is still in stock.
const stockLeft = computed(() => Math.min(props.product.stock, 100))
</script>

<template>
  <article class="group relative flex h-full flex-col overflow-hidden rounded-lg border border-default bg-default transition-shadow hover:shadow-md">
    <div class="relative aspect-square bg-elevated/50">
      <NuxtImg
        :src="product.thumbnail"
        alt=""
        width="300"
        height="300"
        sizes="xs:50vw sm:33vw lg:220px"
        :loading="eager ? 'eager' : 'lazy'"
        class="size-full object-contain p-3"
      />
    </div>

    <div class="flex flex-1 flex-col gap-1 p-3">
      <h3 class="line-clamp-2 text-sm leading-snug text-default">
        <!-- Stretched link: the whole card is clickable, with a single tab stop. -->
        <NuxtLink
          :to="localePath(`/products/${product.id}`)"
          class="after:absolute after:inset-0 focus-visible:outline-none focus-visible:after:rounded-lg focus-visible:after:outline-2 focus-visible:after:outline-primary"
        >
          {{ product.title }}
        </NuxtLink>
      </h3>

      <p class="text-base font-bold text-highlighted">
        {{ money(final) }}
      </p>
      <p v-if="discounted" class="flex items-center gap-1.5 text-xs">
        <span class="price-tag">{{ t('product.discount', { percent: Math.round(product.discountPercentage) }) }}</span>
        <s class="text-muted">
          <span class="sr-only">{{ t('product.originalPrice', { price: money(product.price) }) }}</span>
          <span aria-hidden="true">{{ money(product.price) }}</span>
        </s>
      </p>

      <div class="mt-auto pt-1">
        <p class="flex items-center gap-1 text-xs text-muted">
          <UIcon name="i-lucide-star" class="size-3.5 text-amber-500" aria-hidden="true" />
          <span class="sr-only">{{ t('product.ratingLabel', { rating: product.rating.toFixed(1) }) }}</span>
          <span aria-hidden="true">{{ product.rating.toFixed(1) }}</span>
          <template v-if="product.brand">
            <span aria-hidden="true" class="text-dimmed">|</span>
            <span class="truncate">{{ product.brand }}</span>
          </template>
        </p>
        <div v-if="showStock" class="mt-2">
          <UProgress :model-value="stockLeft" :max="100" size="sm" color="error" :aria-label="t('product.lowStock', { count: product.stock })" />
          <p class="mt-1 text-xs text-muted">
            {{ product.stock > 0 ? t('product.lowStock', { count: product.stock }) : t('product.outOfStock') }}
          </p>
        </div>
      </div>
    </div>

    <WishlistButton :product="product" size="sm" class="absolute top-2 right-2 z-10 bg-default/80" />
  </article>
</template>

<script setup lang="ts">
const { t, locale } = useI18n()
const localePath = useLocalePath()
const route = useRoute()
const toast = useToast()
const cart = useCartStore()
const cartOpen = useCartDrawer()

const id = computed(() => Number(route.params.id))
const { data: product, error } = await useFetch(() => `/api/products/${id.value}`)

if (error.value || !product.value) {
  throw createError({ statusCode: error.value?.statusCode ?? 404, statusMessage: t('product.notFound'), fatal: true })
}
// NuxtPage keys pages by their params, so each product id gets a fresh instance.
const loaded = product.value

const { data: related } = useLazyFetch('/api/products', {
  query: { category: computed(() => product.value?.category), pageSize: 5 },
  transform: page => page.products.filter(p => p.id !== id.value).slice(0, 4),
})

const activeImage = ref(0)
const quantity = ref(1)
const maxQuantity = computed(() => (product.value ? cart.maxQuantity(product.value) : 0))
const inStock = computed(() => maxQuantity.value > 0)

function addToCart() {
  if (!product.value) return
  cart.add(product.value, quantity.value)
  toast.add({
    title: t('product.addedToCart'),
    description: product.value.title,
    icon: 'i-lucide-check',
    color: 'success',
    actions: [{ label: t('cart.viewCart'), color: 'neutral', variant: 'soft', onClick: () => { cartOpen.value = true } }],
  })
}

const dateFormat = computed(() => new Intl.DateTimeFormat(locale.value, { dateStyle: 'medium' }))

const tabs = computed(() => [
  { label: t('product.description'), slot: 'description' as const },
  { label: `${t('product.reviews', product.value?.reviews.length ?? 0)}`, slot: 'reviews' as const },
])

const facts = computed(() => product.value
  ? [
      { icon: 'i-lucide-truck', label: t('product.shipping'), value: product.value.shippingInformation },
      { icon: 'i-lucide-shield-check', label: t('product.warranty'), value: product.value.warrantyInformation },
      { icon: 'i-lucide-rotate-ccw', label: t('product.returns'), value: product.value.returnPolicy },
    ]
  : [])

useSeoMeta({
  title: () => product.value?.title,
  description: () => product.value?.description,
  ogImage: () => product.value?.images[0],
})

const currency = useRuntimeConfig().public.currency

useSchemaOrg([
  defineProduct({
    name: loaded.title,
    description: loaded.description,
    image: loaded.images,
    sku: loaded.sku,
    ...(loaded.brand && { brand: { name: loaded.brand } }),
    ...(loaded.reviews.length && { aggregateRating: { ratingValue: loaded.rating, reviewCount: loaded.reviews.length } }),
    offers: {
      price: discountedPrice(loaded.price, loaded.discountPercentage),
      priceCurrency: currency,
      availability: loaded.stock > 0 ? 'InStock' : 'OutOfStock',
    },
  }),
])
</script>

<template>
  <UContainer v-if="product" class="py-4 sm:py-6">
    <UBreadcrumb
      :items="[
        { label: t('nav.home'), to: localePath('/') },
        { label: t('nav.products'), to: localePath('/products') },
        { label: product.category, to: localePath({ path: '/products', query: { category: product.category } }) },
        { label: product.title },
      ]"
      :ui="{ item: 'min-w-0', link: 'truncate' }"
    />

    <div class="mt-4 grid gap-8 rounded-xl bg-default p-4 sm:p-6 md:grid-cols-12 lg:gap-12">
      <!-- Gallery -->
      <div class="md:col-span-6 lg:col-span-7">
        <div class="aspect-square overflow-hidden rounded-lg bg-elevated/50">
          <NuxtImg
            :src="product.images[activeImage]"
            :alt="product.title"
            width="720"
            height="720"
            sizes="xs:100vw lg:720px"
            preload
            class="size-full object-contain p-8"
          />
        </div>
        <ul v-if="product.images.length > 1" class="mt-3 flex gap-3 overflow-x-auto pb-1">
          <li v-for="(image, index) in product.images" :key="image">
            <button
              type="button"
              class="block size-20 overflow-hidden rounded-md bg-elevated/50 ring-2 ring-offset-2 ring-offset-default transition focus-visible:outline-none focus-visible:ring-primary"
              :class="index === activeImage ? 'ring-primary' : 'ring-transparent hover:ring-accented'"
              :aria-label="t('product.image', { index: index + 1, total: product.images.length })"
              :aria-current="index === activeImage"
              @click="activeImage = index"
            >
              <NuxtImg :src="image" alt="" width="80" height="80" class="size-full object-contain p-1.5" />
            </button>
          </li>
        </ul>
      </div>

      <!-- Buy box -->
      <div class="md:col-span-6 lg:col-span-5">
        <h1 class="display text-(length:--text-head) text-balance text-highlighted">
          {{ product.title }}
        </h1>

        <div class="mt-4 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-base text-muted">
          <span v-if="product.brand" class="mr-3 font-medium text-highlighted">{{ product.brand }}</span>
          <UIcon name="i-lucide-star" class="size-4 text-highlighted" aria-hidden="true" />
          <span class="sr-only">{{ t('product.ratingLabel', { rating: product.rating.toFixed(1) }) }}</span>
          <span aria-hidden="true" class="font-medium text-highlighted">{{ product.rating.toFixed(1) }}</span>
          <span class="ml-2">({{ t('product.reviews', product.reviews.length) }})</span>
        </div>

        <div class="mt-6">
          <PriceTag :price="product.price" :discount-percentage="product.discountPercentage" size="lg" />
        </div>

        <p class="mt-3 flex items-center gap-2 text-sm" :class="inStock ? 'text-success' : 'text-error'">
          <UIcon :name="inStock ? 'i-lucide-package-check' : 'i-lucide-package-x'" class="size-4" aria-hidden="true" />
          <template v-if="!inStock">
            {{ t('product.outOfStock') }}
          </template>
          <template v-else-if="product.stock <= 10">
            {{ t('product.lowStock', { count: product.stock }) }}
          </template>
          <template v-else>
            {{ t('product.inStock') }}
          </template>
        </p>

        <div class="mt-8 flex flex-wrap items-end gap-3">
          <UFormField :label="t('product.quantity')" class="w-32">
            <UInputNumber v-model="quantity" :min="1" :max="Math.max(1, maxQuantity)" :disabled="!inStock" />
          </UFormField>
          <UButton
            :label="t('product.addToCart')"
            icon="i-lucide-shopping-bag"
            size="lg"
            class="flex-1 justify-center"
            :disabled="!inStock"
            @click="addToCart"
          />
        </div>
        <WishlistButton :product="product" labelled block class="mt-3 justify-center" />

        <dl class="mt-8 space-y-3 rounded-lg border border-default p-4 text-sm">
          <div v-for="fact in facts" :key="fact.label" class="flex gap-3">
            <UIcon :name="fact.icon" class="mt-0.5 size-4 shrink-0 text-muted" aria-hidden="true" />
            <dt class="w-28 shrink-0 text-muted">
              {{ fact.label }}
            </dt>
            <dd class="text-highlighted">
              {{ fact.value }}
            </dd>
          </div>
        </dl>
      </div>
    </div>

    <UTabs :items="tabs" variant="link" class="mt-4 rounded-xl bg-default p-4 sm:p-6" :ui="{ content: 'pt-6' }">
      <template #description>
        <div class="max-w-prose space-y-4">
          <p class="text-pretty text-default">
            {{ product.description }}
          </p>
          <p class="text-sm text-muted">
            {{ t('product.sku') }}: {{ product.sku }}
          </p>
          <div v-if="product.tags.length" class="flex flex-wrap gap-2">
            <UBadge v-for="tag in product.tags" :key="tag" :label="tag" color="neutral" variant="soft" size="lg" />
          </div>
        </div>
      </template>

      <template #reviews>
        <p v-if="!product.reviews.length" class="text-muted">
          {{ t('product.noReviews') }}
        </p>
        <ul v-else class="max-w-prose space-y-8">
          <li v-for="(review, index) in product.reviews" :key="index">
            <div class="flex items-center justify-between gap-4">
              <p class="font-medium text-highlighted">
                {{ review.reviewerName }}
              </p>
              <time :datetime="review.date" class="text-sm text-muted">{{ dateFormat.format(new Date(review.date)) }}</time>
            </div>
            <p class="mt-1 flex gap-0.5" :aria-label="t('product.ratingLabel', { rating: review.rating })" role="img">
              <UIcon
                v-for="n in 5"
                :key="n"
                name="i-lucide-star"
                class="size-3.5"
                :class="n <= review.rating ? 'text-warning' : 'text-dimmed'"
                aria-hidden="true"
              />
            </p>
            <p class="mt-2 text-default">
              {{ review.comment }}
            </p>
          </li>
        </ul>
      </template>
    </UTabs>

    <section v-if="related?.length" aria-labelledby="related-title" class="mt-8">
      <h2 id="related-title" class="mb-4 text-lg font-bold text-highlighted">
        {{ t('product.related') }}
      </h2>
      <ProductGrid :products="related" />
    </section>
  </UContainer>
</template>

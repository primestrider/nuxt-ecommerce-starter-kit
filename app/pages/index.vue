<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
const money = useMoney()

const RECOMMENDED_PAGE_SIZE = 18

const [{ data: categories }, { data: deals, status: dealsStatus }, { data: topRated, status: topStatus }, { data: firstPage }] = await Promise.all([
  useFetch('/api/categories', { key: 'categories' }),
  useFetch('/api/products', { key: 'home-deals', query: { sort: 'discount', pageSize: 12 } }),
  useFetch('/api/products', { key: 'home-top', query: { sort: 'rating', pageSize: 12 } }),
  useFetch('/api/products', { key: 'home-recommended', query: { page: 1, pageSize: RECOMMENDED_PAGE_SIZE } }),
])

// --- Promo banners, built from live catalog data -----------------------------------

const banners = computed(() => {
  const topDeal = deals.value?.products[0]
  const topProduct = topRated.value?.products[0]
  const spotlight = categories.value?.find(c => c.slug === 'smartphones') ?? categories.value?.[0]
  return [
    topDeal && {
      key: 'deal',
      class: 'bg-(--color-blueprint-600) text-white',
      title: t('home.bannerDealTitle', { percent: Math.round(topDeal.discountPercentage) }),
      text: t('home.bannerDealText'),
      cta: t('home.bannerDealCta'),
      to: localePath({ path: '/products', query: { sort: 'discount' } }),
      image: topDeal.image,
    },
    spotlight && {
      key: 'category',
      class: 'bg-amber-100 text-zinc-900',
      title: t('home.bannerCategoryTitle', { name: spotlight.name, price: money(spotlight.fromPrice) }),
      text: t('home.bannerCategoryText', { count: spotlight.count }),
      cta: t('home.bannerCategoryCta', { name: spotlight.name }),
      to: localePath({ path: '/products', query: { category: spotlight.slug } }),
      image: spotlight.image,
    },
    topProduct && {
      key: 'shipping',
      class: 'bg-zinc-900 text-white',
      title: t('home.bannerShippingTitle', { amount: money(FREE_SHIPPING_FROM) }),
      text: t('home.bannerShippingText'),
      cta: t('home.bannerShippingCta'),
      to: localePath('/products'),
      image: topProduct.image,
    },
  ].filter(b => !!b)
})

// --- Service highlights: every claim comes from pricing rules or catalog data -------

const services = computed(() => [
  { icon: 'i-lucide-truck', title: t('home.serviceFreeShipping', { amount: money(FREE_SHIPPING_FROM) }), text: t('home.serviceFreeShippingText') },
  { icon: 'i-lucide-zap', title: t('home.serviceExpress', { price: money(SHIPPING_RATES.express) }), text: t('home.serviceExpressText') },
  { icon: 'i-lucide-store', title: t('home.serviceCatalog', { count: firstPage.value?.total ?? 0 }), text: t('home.serviceCatalogText', { count: categories.value?.length ?? 0 }) },
  { icon: 'i-lucide-heart', title: t('home.serviceWishlist'), text: t('home.serviceWishlistText') },
])

// --- Recommendations: first page server-rendered, then "load more" -----------------

const recommended = ref<ProductSummary[]>([...(firstPage.value?.products ?? [])])
const recommendedTotal = computed(() => firstPage.value?.total ?? 0)
const loadingMore = ref(false)
const loadError = ref(false)

async function loadMore() {
  loadingMore.value = true
  loadError.value = false
  try {
    const page = await $fetch<ProductPage>('/api/products', {
      query: { page: Math.floor(recommended.value.length / RECOMMENDED_PAGE_SIZE) + 1, pageSize: RECOMMENDED_PAGE_SIZE },
    })
    recommended.value.push(...page.products)
  } catch {
    loadError.value = true
  } finally {
    loadingMore.value = false
  }
}

useSeoMeta({
  title: () => t('home.title'),
  description: () => t('home.description'),
})
</script>

<template>
  <UContainer class="space-y-4 pt-4">
    <h1 class="sr-only">
      {{ t('home.title') }}
    </h1>

    <!-- Promo banners -->
    <UCarousel
      v-if="banners.length"
      v-slot="{ item }"
      :items="banners"
      arrows
      dots
      :prev="{ color: 'neutral', variant: 'solid' }"
      :next="{ color: 'neutral', variant: 'solid' }"
      :ui="{
        root: 'pb-8',
        dots: '-bottom-1',
        prev: 'hidden sm:inline-flex start-3',
        next: 'hidden sm:inline-flex end-3',
      }"
      :aria-label="t('home.bannersLabel')"
    >
      <NuxtLink
        :to="item.to"
        class="flex h-48 items-center justify-between gap-4 overflow-hidden rounded-xl px-6 sm:h-64 sm:px-12 lg:h-72 lg:px-16"
        :class="item.class"
      >
        <div class="max-w-md">
          <p class="text-xl leading-tight font-extrabold sm:text-3xl lg:text-4xl">
            {{ item.title }}
          </p>
          <p class="mt-2 hidden text-sm opacity-90 sm:block sm:text-base">
            {{ item.text }}
          </p>
          <span class="mt-4 inline-flex rounded-md bg-white px-4 py-2 text-sm font-semibold text-zinc-900">
            {{ item.cta }}
          </span>
        </div>
        <NuxtImg
          :src="item.image"
          alt=""
          width="320"
          height="320"
          :loading="item.key === 'deal' ? 'eager' : 'lazy'"
          class="size-32 shrink-0 object-contain sm:size-56 lg:size-64"
        />
      </NuxtLink>
    </UCarousel>

    <!-- Service highlights -->
    <section :aria-label="t('home.servicesLabel')" class="rounded-xl bg-default">
      <ul class="grid grid-cols-2 divide-default lg:grid-cols-4 lg:divide-x">
        <li v-for="service in services" :key="service.icon" class="flex items-center gap-3 p-4">
          <span class="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <UIcon :name="service.icon" class="size-5" aria-hidden="true" />
          </span>
          <div class="min-w-0">
            <p class="text-sm font-bold text-highlighted">
              {{ service.title }}
            </p>
            <p class="text-xs text-muted">
              {{ service.text }}
            </p>
          </div>
        </li>
      </ul>
    </section>

    <!-- Category shortcuts -->
    <section aria-labelledby="categories-title" class="rounded-xl bg-default p-4 sm:p-6">
      <h2 id="categories-title" class="text-lg font-bold text-highlighted">
        {{ t('home.categoriesTitle') }}
      </h2>
      <ul class="mt-4 grid auto-cols-[5.5rem] grid-flow-col grid-rows-2 gap-x-2 gap-y-4 overflow-x-auto pb-2 sm:auto-cols-auto sm:grid-flow-row sm:grid-cols-6 sm:grid-rows-none md:grid-cols-8 lg:grid-cols-12">
        <li v-for="category in categories" :key="category.slug">
          <NuxtLink
            :to="localePath({ path: '/products', query: { category: category.slug } })"
            class="group flex flex-col items-center gap-2 rounded-lg p-1 text-center focus-visible:outline-2 focus-visible:outline-primary"
          >
            <span class="flex size-16 items-center justify-center overflow-hidden rounded-full bg-muted transition-colors group-hover:bg-primary/10">
              <NuxtImg :src="category.image" alt="" width="64" height="64" loading="lazy" class="size-12 object-contain" />
            </span>
            <span class="line-clamp-2 text-xs text-default group-hover:text-primary">{{ category.name }}</span>
          </NuxtLink>
        </li>
      </ul>
    </section>

    <!-- Biggest discounts -->
    <section aria-labelledby="deals-title" class="rounded-xl bg-default p-4 sm:p-6">
      <div class="mb-4 flex items-end justify-between gap-4">
        <div>
          <h2 id="deals-title" class="text-lg font-bold text-highlighted">
            {{ t('home.dealsTitle') }}
          </h2>
          <p class="text-sm text-muted">
            {{ t('home.dealsText') }}
          </p>
        </div>
        <ULink :to="localePath({ path: '/products', query: { sort: 'discount' } })" class="shrink-0 text-sm font-semibold text-primary">
          {{ t('home.seeAll') }}
        </ULink>
      </div>
      <ProductRow :products="deals?.products" :loading="dealsStatus === 'pending'" show-stock />
    </section>

    <CategorySpotlight :categories="categories ?? undefined" />

    <!-- Top rated -->
    <section aria-labelledby="top-title" class="rounded-xl bg-default p-4 sm:p-6">
      <div class="mb-4 flex items-end justify-between gap-4">
        <h2 id="top-title" class="text-lg font-bold text-highlighted">
          {{ t('home.topTitle') }}
        </h2>
        <ULink :to="localePath({ path: '/products', query: { sort: 'rating' } })" class="shrink-0 text-sm font-semibold text-primary">
          {{ t('home.seeAll') }}
        </ULink>
      </div>
      <ProductRow :products="topRated?.products" :loading="topStatus === 'pending'" />
    </section>

    <MemberBand />

    <!-- Recommendations -->
    <section aria-labelledby="recommended-title" class="pt-4">
      <h2 id="recommended-title" class="mb-4 text-lg font-bold text-highlighted">
        {{ t('home.recommendedTitle') }}
      </h2>
      <ProductGrid :products="recommended" :loading="loadingMore" :skeletons="6" />
      <div class="mt-6 flex flex-col items-center gap-2">
        <p v-if="loadError" class="text-sm text-error" role="alert">
          {{ t('catalog.loadError') }}
        </p>
        <UButton
          v-if="recommended.length < recommendedTotal"
          :label="t('home.loadMore')"
          color="primary"
          variant="outline"
          size="lg"
          :loading="loadingMore"
          class="px-10"
          @click="loadMore"
        />
      </div>
    </section>
  </UContainer>
</template>

<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
const route = useRoute()
const router = useRouter()

// The URL is the source of truth for filters, so results are shareable and survive reloads.
const asString = (v: unknown) => (typeof v === 'string' && v ? v : undefined)
const q = computed(() => asString(route.query.q))
const category = computed(() => asString(route.query.category))
const sort = computed(() => {
  const s = asString(route.query.sort)
  return productSorts.includes(s as ProductSort) ? (s as ProductSort) : undefined
})
const page = computed(() => Math.max(1, Number(route.query.page) || 1))

const { data: categories } = await useFetch('/api/categories', { key: 'categories' })
const { data, status, error, refresh } = await useFetch('/api/products', {
  query: { q, category, sort, page, pageSize: PRODUCTS_PAGE_SIZE },
})

const categoryName = computed(() => categories.value?.find(c => c.slug === category.value)?.name)
const heading = computed(() => {
  if (q.value) return t('catalog.searchResults', { q: q.value })
  return categoryName.value ?? t('catalog.title')
})

function setQuery(patch: Record<string, string | number | undefined>) {
  // Any filter change returns to the first page.
  router.push({ query: { ...route.query, page: undefined, ...patch } })
}

const sortItems = computed(() => [
  { label: t('catalog.sort.relevance'), value: 'relevance' },
  ...productSorts.map(value => ({ label: t(`catalog.sort.${value}`), value })),
])
const sortModel = computed({
  get: () => sort.value ?? 'relevance',
  set: value => setQuery({ sort: value === 'relevance' ? undefined : value }),
})

const categoryItems = computed(() => [
  { label: t('catalog.allCategories'), value: 'all' },
  ...(categories.value ?? []).map(c => ({ label: c.name, value: c.slug })),
])
const categoryModel = computed({
  get: () => category.value ?? 'all',
  set: value => setQuery({ category: value === 'all' ? undefined : value }),
})

const pageModel = computed({
  get: () => page.value,
  set: value => router.push({ query: { ...route.query, page: value > 1 ? value : undefined } }),
})

watch(page, () => import.meta.client && window.scrollTo({ top: 0, behavior: 'smooth' }))

useSeoMeta({
  title: () => heading.value,
  description: () => t('home.heroText'),
  robots: () => (q.value ? 'noindex, follow' : undefined),
})
</script>

<template>
  <UContainer class="py-10">
    <UBreadcrumb
      :items="[
        { label: t('nav.home'), to: localePath('/') },
        { label: t('nav.products'), to: localePath('/products') },
        ...(categoryName ? [{ label: categoryName }] : []),
      ]"
    />

    <div class="mt-6 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <h1 class="display text-(length:--text-display) text-highlighted">
          {{ heading }}
        </h1>
        <p v-if="data" class="mt-3 text-lg text-muted" aria-live="polite">
          {{ t('catalog.results', data.total) }}
        </p>
      </div>

      <div class="grid grid-cols-2 gap-3 sm:flex">
        <USelect
          v-model="categoryModel"
          :items="categoryItems"
          :aria-label="t('nav.categories')"
          class="sm:w-52"
        />
        <USelect
          v-model="sortModel"
          :items="sortItems"
          :aria-label="t('catalog.sortLabel')"
          class="sm:w-52"
        />
      </div>
    </div>

    <div class="mt-12">
      <UAlert
        v-if="error"
        color="error"
        variant="subtle"
        icon="i-lucide-wifi-off"
        :title="t('catalog.loadError')"
        :actions="[{ label: t('catalog.retry'), color: 'error', variant: 'soft', onClick: () => refresh() }]"
      />

      <UEmpty
        v-else-if="data && !data.products.length"
        icon="i-lucide-search-x"
        :title="t('catalog.emptyTitle')"
        :description="t('catalog.emptyText')"
        variant="naked"
        class="py-20"
        :actions="[{ label: t('catalog.clearFilters'), to: localePath('/products'), color: 'neutral', variant: 'soft' }]"
      />

      <template v-else>
        <ProductGrid :products="data?.products" :loading="status === 'pending'" :skeletons="12" />

        <UPagination
          v-if="data && data.total > data.pageSize"
          v-model:page="pageModel"
          :total="data.total"
          :items-per-page="data.pageSize"
          class="mt-12 flex justify-center"
        />
      </template>
    </div>
  </UContainer>
</template>

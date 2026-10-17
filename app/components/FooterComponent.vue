<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
const money = useMoney()
const siteName = useRuntimeConfig().public.siteName
const year = new Date().getFullYear()

const { data: categories } = await useFetch('/api/categories', { key: 'categories' })
const popular = computed(() => [...(categories.value ?? [])].sort((a, b) => b.count - a.count).slice(0, 6))
</script>

<template>
  <footer class="mt-16 border-t border-default bg-default">
    <UContainer class="grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
      <div>
        <p class="text-xl font-extrabold tracking-tight text-primary">
          {{ siteName }}
        </p>
        <p class="mt-3 max-w-xs text-sm text-muted">
          {{ t('footer.about') }}
        </p>
      </div>

      <nav :aria-label="t('footer.shop')">
        <h2 class="text-sm font-semibold text-highlighted">
          {{ t('footer.shop') }}
        </h2>
        <ul class="mt-3 space-y-2 text-sm">
          <li v-for="category in popular" :key="category.slug">
            <NuxtLink :to="localePath({ path: '/products', query: { category: category.slug } })" class="text-muted hover:text-primary">
              {{ category.name }}
            </NuxtLink>
          </li>
        </ul>
      </nav>

      <nav :aria-label="t('footer.account')">
        <h2 class="text-sm font-semibold text-highlighted">
          {{ t('footer.account') }}
        </h2>
        <ul class="mt-3 space-y-2 text-sm">
          <li><NuxtLink :to="localePath('/account')" class="text-muted hover:text-primary">{{ t('nav.account') }}</NuxtLink></li>
          <li><NuxtLink :to="localePath('/cart')" class="text-muted hover:text-primary">{{ t('nav.cart') }}</NuxtLink></li>
          <li><NuxtLink :to="localePath('/wishlist')" class="text-muted hover:text-primary">{{ t('nav.wishlist') }}</NuxtLink></li>
        </ul>
      </nav>

      <div>
        <h2 class="text-sm font-semibold text-highlighted">
          {{ t('footer.service') }}
        </h2>
        <ul class="mt-3 space-y-2 text-sm text-muted">
          <li>{{ t('footer.serviceShipping', { amount: money(FREE_SHIPPING_FROM) }) }}</li>
          <li>{{ t('footer.servicePayment') }}</li>
        </ul>
      </div>
    </UContainer>

    <div class="border-t border-default">
      <UContainer class="flex flex-col gap-2 py-5 text-xs text-muted sm:flex-row sm:justify-between">
        <p>© {{ year }} {{ siteName }}</p>
        <a href="https://dummyjson.com" target="_blank" rel="noopener" class="hover:text-primary">{{ t('footer.dataSource') }}</a>
      </UContainer>
    </div>
  </footer>
</template>

<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

const { t, locale, locales } = useI18n()
const localePath = useLocalePath()
const switchLocalePath = useSwitchLocalePath()
const route = useRoute()
const money = useMoney()
const siteName = useRuntimeConfig().public.siteName

const cart = useCartStore()
const wishlist = useWishlistStore()
const auth = useAuthStore()
const cartOpen = useCartDrawer()
const toast = useToast()

const { data: categories } = await useFetch('/api/categories', { key: 'categories' })

const languageItems = computed<DropdownMenuItem[]>(() => locales.value.map(l => ({
  label: l.name,
  type: 'checkbox' as const,
  checked: l.code === locale.value,
  onSelect: () => navigateTo(switchLocalePath(l.code)),
})))

const accountItems = computed<DropdownMenuItem[][]>(() => [
  [{ label: `${auth.user?.firstName} ${auth.user?.lastName}`, avatar: { src: auth.user?.image, alt: '' }, type: 'label' }],
  [
    { label: t('nav.account'), icon: 'i-lucide-user', to: localePath('/account') },
    { label: t('nav.wishlist'), icon: 'i-lucide-heart', to: localePath('/wishlist') },
  ],
  [{ label: t('nav.logout'), icon: 'i-lucide-log-out', onSelect: logout }],
])

async function logout() {
  await auth.logout()
  toast.add({ title: t('auth.loggedOut'), icon: 'i-lucide-log-out' })
  await navigateTo(localePath('/'))
}

const search = ref(typeof route.query.q === 'string' ? route.query.q : '')
watch(() => route.query.q, (q) => { search.value = typeof q === 'string' ? q : '' })

function submitSearch() {
  const q = search.value.trim()
  navigateTo(localePath({ path: '/products', query: q ? { q } : {} }))
}

const categoriesOpen = ref(false)
watch(() => route.fullPath, () => { categoriesOpen.value = false })

onMounted(() => auth.ensureLoaded())
</script>

<template>
  <header class="sticky top-0 z-50 border-b border-default bg-default">
    <!-- Info strip -->
    <div class="hidden bg-muted sm:block">
      <UContainer class="flex h-8 items-center justify-between text-xs text-muted">
        <p class="flex items-center gap-1.5">
          <UIcon name="i-lucide-truck" class="size-3.5" aria-hidden="true" />
          {{ t('header.freeShipping', { amount: money(FREE_SHIPPING_FROM) }) }}
        </p>
        <div class="flex items-center gap-1">
          <UDropdownMenu :items="languageItems">
            <UButton :label="t('nav.language')" icon="i-lucide-languages" color="neutral" variant="ghost" size="xs" />
          </UDropdownMenu>
          <UColorModeButton size="xs" />
        </div>
      </UContainer>
    </div>

    <UContainer class="flex h-16 items-center gap-3 lg:gap-6">
      <NuxtLink :to="localePath('/')" class="shrink-0 text-xl font-extrabold tracking-tight text-primary">
        {{ siteName }}
      </NuxtLink>

      <UPopover v-model:open="categoriesOpen" :content="{ align: 'start' }">
        <UButton :label="t('nav.categories')" color="neutral" variant="ghost" trailing-icon="i-lucide-chevron-down" class="hidden lg:inline-flex" />
        <template #content>
          <nav :aria-label="t('nav.categories')" class="grid w-[36rem] grid-cols-3 gap-1 p-3">
            <NuxtLink
              v-for="category in categories"
              :key="category.slug"
              :to="localePath({ path: '/products', query: { category: category.slug } })"
              class="rounded-md px-2.5 py-2 text-sm text-default hover:bg-elevated hover:text-primary"
            >
              {{ category.name }}
            </NuxtLink>
          </nav>
        </template>
      </UPopover>

      <form role="search" class="hidden flex-1 md:block" @submit.prevent="submitSearch">
        <UInput
          v-model="search"
          type="search"
          icon="i-lucide-search"
          :placeholder="t('nav.searchPlaceholder')"
          :aria-label="t('nav.search')"
          size="lg"
          class="w-full"
        />
      </form>

      <!-- Session, wishlist and cart are per-visitor: render them only on the client so
           cached pages never contain someone else's state. -->
      <ClientOnly>
        <div class="ml-auto flex items-center gap-1 md:ml-0">
          <UChip :text="cart.count" :show="cart.count > 0" size="3xl" inset>
            <UButton
              icon="i-lucide-shopping-cart"
              color="neutral"
              variant="ghost"
              size="lg"
              :aria-label="`${t('nav.cart')}, ${t('cart.items', cart.count)}`"
              @click="cartOpen = true"
            />
          </UChip>
          <UChip :text="wishlist.count" :show="wishlist.count > 0" size="3xl" inset class="hidden sm:inline-flex">
            <UButton icon="i-lucide-heart" color="neutral" variant="ghost" size="lg" :to="localePath('/wishlist')" :aria-label="t('nav.wishlist')" />
          </UChip>

          <USeparator orientation="vertical" class="mx-2 hidden h-6 sm:block" />

          <UDropdownMenu v-if="auth.user" :items="accountItems" :content="{ align: 'end' }">
            <UButton color="neutral" variant="ghost" :aria-label="t('nav.account')">
              <UAvatar :src="auth.user.image" :alt="auth.user.firstName" size="xs" />
              <span class="hidden max-w-28 truncate lg:inline">{{ auth.user.firstName }}</span>
            </UButton>
          </UDropdownMenu>
          <template v-else>
            <UButton :label="t('nav.login')" color="primary" variant="outline" :to="localePath('/auth/login')" class="hidden sm:inline-flex" />
            <UButton :label="t('nav.register')" :to="localePath('/auth/register')" class="hidden sm:inline-flex" />
            <UButton icon="i-lucide-user" color="neutral" variant="ghost" size="lg" :to="localePath('/auth/login')" :aria-label="t('nav.login')" class="sm:hidden" />
          </template>
        </div>

        <template #fallback>
          <div class="ml-auto flex items-center gap-2 md:ml-0" aria-hidden="true">
            <USkeleton class="size-9" />
            <USkeleton class="hidden h-9 w-40 sm:block" />
          </div>
        </template>
      </ClientOnly>
    </UContainer>

    <!-- Phone: search gets its own row -->
    <UContainer class="pb-3 md:hidden">
      <form role="search" @submit.prevent="submitSearch">
        <UInput
          v-model="search"
          type="search"
          icon="i-lucide-search"
          :placeholder="t('nav.searchPlaceholder')"
          :aria-label="t('nav.search')"
          class="w-full"
        />
      </form>
    </UContainer>
  </header>
</template>

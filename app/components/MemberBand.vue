<script setup lang="ts">
// Sign-up prompt for guests; quick links for signed-in shoppers.
const { t } = useI18n()
const localePath = useLocalePath()
const auth = useAuthStore()

const perks = computed(() => [
  { icon: 'i-lucide-user-plus', label: t('home.memberPerkFree') },
  { icon: 'i-lucide-shield-check', label: t('home.memberPerkCheckout') },
  { icon: 'i-lucide-package-check', label: t('home.memberPerkOrders') },
])
</script>

<template>
  <section aria-labelledby="member-title" class="relative overflow-hidden rounded-xl bg-(--color-blueprint-600) px-6 py-8 text-white sm:px-10 lg:px-12">
    <span class="pointer-events-none absolute -top-24 -left-10 size-64 rounded-full bg-(--color-blueprint-400) opacity-50 blur-3xl" aria-hidden="true" />
    <span class="pointer-events-none absolute -right-10 -bottom-24 size-72 rounded-full bg-(--color-blueprint-900) opacity-60 blur-3xl" aria-hidden="true" />

    <div class="relative grid items-center gap-6 lg:grid-cols-[1fr_auto]">
      <!-- The session loads after mount, so SSR and hydration both render the guest copy. -->
      <div v-if="auth.user">
        <h2 id="member-title" class="text-2xl font-extrabold sm:text-3xl">
          {{ t('home.memberHello', { name: auth.user.firstName }) }}
        </h2>
        <p class="mt-1 text-white/85">
          {{ t('home.memberHelloText') }}
        </p>
        <div class="mt-5 flex flex-wrap gap-2">
          <UButton :label="t('nav.wishlist')" icon="i-lucide-heart" color="neutral" variant="solid" :to="localePath('/wishlist')" />
          <UButton :label="t('nav.account')" icon="i-lucide-user" color="neutral" variant="outline" class="text-white ring-white/40 hover:bg-white/10" :to="localePath('/account')" />
        </div>
      </div>
      <div v-else>
        <h2 id="member-title" class="text-2xl font-extrabold sm:text-3xl">
          {{ t('home.memberTitle') }}
        </h2>
        <p class="mt-1 text-white/85">
          {{ t('home.memberText') }}
        </p>
        <div class="mt-5 flex flex-wrap gap-2">
          <UButton :label="t('nav.register')" color="neutral" variant="solid" :to="localePath('/auth/register')" />
          <UButton :label="t('nav.login')" color="neutral" variant="outline" class="text-white ring-white/40 hover:bg-white/10" :to="localePath('/auth/login')" />
        </div>
      </div>

      <ul v-if="!auth.user" class="grid gap-2 sm:grid-cols-3 lg:grid-cols-1">
        <li v-for="perk in perks" :key="perk.icon" class="flex items-center gap-3 rounded-lg bg-white/10 px-4 py-3 text-sm font-medium backdrop-blur-sm">
          <UIcon :name="perk.icon" class="size-5 shrink-0" aria-hidden="true" />
          {{ perk.label }}
        </li>
      </ul>
    </div>
  </section>
</template>

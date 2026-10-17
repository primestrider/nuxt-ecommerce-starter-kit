<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const { t } = useI18n()
const localePath = useLocalePath()
const money = useMoney()
const toast = useToast()
const auth = useAuthStore()

const { data: orders, status, error } = await useFetch<Order[]>('/api/orders', { server: false })

watch(error, async (err) => {
  if (err?.statusCode === 401) {
    auth.expire()
    toast.add({ title: t('auth.sessionExpired'), color: 'warning', icon: 'i-lucide-log-in' })
    await navigateTo(localePath({ path: '/auth/login', query: { redirect: localePath('/account') } }))
  }
})

async function logout() {
  await auth.logout()
  toast.add({ title: t('auth.loggedOut'), icon: 'i-lucide-log-out' })
  await navigateTo(localePath('/'))
}

useSeoMeta({ title: () => t('account.title') })
</script>

<template>
  <UContainer v-if="auth.user" class="py-10">
    <div class="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
      <div class="flex items-center gap-5">
        <UAvatar :src="auth.user.image" :alt="auth.user.firstName" size="3xl" class="bg-muted" />
        <div>
          <h1 class="display text-(length:--text-head) text-highlighted">
            {{ t('account.greeting', { name: auth.user.firstName }) }}
          </h1>
          <dl class="mt-1 flex flex-wrap gap-x-4 text-sm text-muted">
            <div class="flex gap-1">
              <dt class="sr-only">
                {{ t('account.email') }}
              </dt>
              <dd>{{ auth.user.email }}</dd>
            </div>
            <div class="flex gap-1">
              <dt>{{ t('account.username') }}:</dt>
              <dd>{{ auth.user.username }}</dd>
            </div>
          </dl>
        </div>
      </div>
      <UButton :label="t('nav.logout')" icon="i-lucide-log-out" color="neutral" variant="soft" @click="logout" />
    </div>

    <section aria-labelledby="orders-title" class="mt-20">
      <h2 id="orders-title" class="display text-(length:--text-head) text-highlighted">
        {{ t('account.orders') }}
      </h2>
      <p class="mt-1 text-sm text-muted">
        {{ t('account.demoNote') }}
      </p>

      <div v-if="status === 'pending'" class="mt-6 space-y-4" aria-hidden="true">
        <USkeleton v-for="n in 2" :key="n" class="h-32 w-full" />
      </div>
      <UAlert v-else-if="error" class="mt-6" color="error" variant="subtle" icon="i-lucide-circle-alert" :title="t('account.ordersError')" />
      <UEmpty
        v-else-if="!orders?.length"
        icon="i-lucide-receipt"
        :title="t('account.ordersEmpty')"
        variant="naked"
        class="py-16"
        :actions="[{ label: t('cart.continueShopping'), to: localePath('/products') }]"
      />
      <ol v-else class="mt-6 space-y-6">
        <li v-for="order in orders" :key="order.id" class="rounded-xl bg-default p-5 sm:p-6">
          <div class="flex flex-wrap items-baseline justify-between gap-2">
            <h3 class="font-medium text-highlighted">
              {{ t('account.order', { id: order.id }) }}
            </h3>
            <p class="flex gap-4 text-sm text-muted">
              <span>{{ t('cart.items', order.totalQuantity) }}</span>
              <span class="font-medium text-highlighted">{{ money(order.total) }}</span>
            </p>
          </div>
          <ul class="mt-4 space-y-1">
            <li v-for="line in order.lines" :key="line.id" class="flex items-center gap-3 py-3 text-sm">
              <NuxtImg :src="line.thumbnail" alt="" width="40" height="40" class="size-12 shrink-0 bg-default object-contain p-1" />
              <NuxtLink :to="localePath(`/products/${line.id}`)" class="flex-1 text-highlighted hover:underline">
                {{ line.title }}
              </NuxtLink>
              <span class="text-muted">× {{ line.quantity }}</span>
              <span class="w-24 text-right text-highlighted">{{ money(line.total) }}</span>
            </li>
          </ul>
        </li>
      </ol>
    </section>
  </UContainer>
</template>

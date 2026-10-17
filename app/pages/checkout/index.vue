<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'

definePageMeta({ middleware: 'auth' })

const { t } = useI18n()
const localePath = useLocalePath()
const money = useMoney()
const toast = useToast()
const cart = useCartStore()
const auth = useAuthStore()
const lastOrder = useLastOrder()

const state = reactive<Partial<CheckoutInput>>({
  fullName: auth.user ? `${auth.user.firstName} ${auth.user.lastName}` : '',
  phone: '',
  address: '',
  city: '',
  postalCode: '',
  shippingMethod: 'regular',
  paymentMethod: 'bank_transfer',
  note: '',
})

const shipping = computed(() => shippingCost(state.shippingMethod ?? 'regular', cart.subtotal))

const shippingItems = computed(() => shippingMethods.map(value => ({
  value,
  label: `${t(`checkout.${value}`)} (${shippingCost(value, cart.subtotal) === 0 ? t('cart.free') : money(shippingCost(value, cart.subtotal))})`,
  description: t(`checkout.${value}Description`),
})))

const paymentItems = computed(() => [
  { value: 'bank_transfer', label: t('checkout.bankTransfer'), description: t('checkout.bankTransferDescription') },
  { value: 'cod', label: t('checkout.cod'), description: t('checkout.codDescription') },
])

const submitting = ref(false)

async function placeOrder(event: FormSubmitEvent<CheckoutInput>) {
  submitting.value = true
  try {
    const order = await $fetch<Order>('/api/orders', {
      method: 'POST',
      body: { ...event.data, items: cart.lines.map(({ id, quantity }) => ({ id, quantity })) },
    })
    lastOrder.value = order
    cart.clear()
    await navigateTo(localePath('/checkout/success'))
  } catch (error) {
    if ((error as { statusCode?: number }).statusCode === 401) {
      auth.expire()
      toast.add({ title: t('auth.sessionExpired'), color: 'warning', icon: 'i-lucide-log-in' })
      await navigateTo(localePath({ path: '/auth/login', query: { redirect: localePath('/checkout') } }))
      return
    }
    toast.add({ title: t('checkout.failed'), color: 'error', icon: 'i-lucide-circle-alert' })
  } finally {
    submitting.value = false
  }
}

useSeoMeta({ title: () => t('checkout.title') })
</script>

<template>
  <UContainer class="py-10">
    <h1 class="display text-(length:--text-head) text-highlighted">
      {{ t('checkout.title') }}
    </h1>

    <UEmpty
      v-if="!cart.lines.length"
      icon="i-lucide-shopping-bag"
      :title="t('cart.emptyTitle')"
      :description="t('cart.emptyText')"
      variant="naked"
      class="py-24"
      :actions="[{ label: t('cart.continueShopping'), to: localePath('/products') }]"
    />

    <UForm
      v-else
      :schema="checkoutSchema"
      :state="state"
      class="mt-8 grid gap-10 lg:grid-cols-12 lg:gap-16"
      @submit="placeOrder"
    >
      <div class="space-y-10 rounded-xl bg-default p-4 sm:p-6 lg:col-span-7">
        <fieldset class="grid gap-4 sm:grid-cols-2">
          <legend class="mb-4 text-(length:--text-lead) text-highlighted">
            {{ t('checkout.address') }}
          </legend>
          <UFormField name="fullName" :label="t('checkout.fullName')" required>
            <UInput v-model="state.fullName" autocomplete="name" class="w-full" />
          </UFormField>
          <UFormField name="phone" :label="t('checkout.phone')" required>
            <UInput v-model="state.phone" type="tel" autocomplete="tel" class="w-full" />
          </UFormField>
          <UFormField name="address" :label="t('checkout.street')" required class="sm:col-span-2">
            <UTextarea v-model="state.address" autocomplete="street-address" :rows="2" autoresize class="w-full" />
          </UFormField>
          <UFormField name="city" :label="t('checkout.city')" required>
            <UInput v-model="state.city" autocomplete="address-level2" class="w-full" />
          </UFormField>
          <UFormField name="postalCode" :label="t('checkout.postalCode')" required>
            <UInput v-model="state.postalCode" autocomplete="postal-code" inputmode="numeric" class="w-full" />
          </UFormField>
          <UFormField name="note" :label="t('checkout.note')" :hint="t('checkout.optional')" class="sm:col-span-2">
            <UInput v-model="state.note" class="w-full" />
          </UFormField>
        </fieldset>

        <UFormField name="shippingMethod">
          <URadioGroup
            v-model="state.shippingMethod"
            :legend="t('checkout.shippingMethod')"
            :items="shippingItems"
            variant="table"
            :ui="{ legend: 'mb-4 text-(length:--text-lead) text-highlighted' }"
          />
        </UFormField>

        <UFormField name="paymentMethod">
          <URadioGroup
            v-model="state.paymentMethod"
            :legend="t('checkout.payment')"
            :items="paymentItems"
            variant="table"
            :ui="{ legend: 'mb-4 text-(length:--text-lead) text-highlighted' }"
          />
        </UFormField>
        <UAlert icon="i-lucide-info" color="neutral" variant="subtle" :title="t('checkout.demoPayment')" />
      </div>

      <aside class="lg:col-span-5">
        <div class="rounded-xl bg-default p-6 lg:sticky lg:top-28">
          <h2 class="text-(length:--text-lead) text-highlighted">
            {{ t('checkout.summary') }}
          </h2>
          <ul class="mt-4 space-y-1">
            <li v-for="line in cart.lines" :key="line.id" class="flex items-center gap-3 py-3 text-sm">
              <NuxtImg :src="line.thumbnail" alt="" width="48" height="48" class="size-12 shrink-0 bg-default object-contain p-1" />
              <span class="line-clamp-2 flex-1 text-highlighted">{{ line.title }}</span>
              <span class="shrink-0 text-muted">× {{ line.quantity }}</span>
              <span class="w-20 shrink-0 text-right text-highlighted">
                {{ money(discountedPrice(line.price, line.discountPercentage) * line.quantity) }}
              </span>
            </li>
          </ul>
          <OrderSummary :subtotal="cart.subtotal" :shipping="shipping" class="mt-4" />
          <UButton type="submit" :label="t('checkout.placeOrder')" size="lg" block class="mt-6" :loading="submitting" />
          <p class="mt-4 text-sm text-muted">
            {{ t('cart.priceNote') }}
          </p>
        </div>
      </aside>
    </UForm>
  </UContainer>
</template>

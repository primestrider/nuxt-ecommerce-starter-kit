<script setup lang="ts">
// Bento of the largest categories: one lead tile, four smaller ones.
const props = defineProps<{ categories?: Category[] }>()

const { t } = useI18n()
const localePath = useLocalePath()
const money = useMoney()

const picks = computed(() => [...(props.categories ?? [])].sort((a, b) => b.count - a.count).slice(0, 5))
const lead = computed(() => picks.value[0])
const rest = computed(() => picks.value.slice(1))

const categoryLink = (slug: string) => localePath({ path: '/products', query: { category: slug } })
</script>

<template>
  <section v-if="lead" aria-labelledby="spotlight-title" class="rounded-xl bg-default p-4 sm:p-6">
    <div class="mb-4">
      <h2 id="spotlight-title" class="text-lg font-bold text-highlighted">
        {{ t('home.spotlightTitle') }}
      </h2>
      <p class="text-sm text-muted">
        {{ t('home.spotlightText') }}
      </p>
    </div>

    <div class="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:grid-rows-2">
      <NuxtLink
        :to="categoryLink(lead.slug)"
        class="group relative col-span-2 flex min-h-56 overflow-hidden rounded-xl bg-(--color-blueprint-950) p-6 text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary lg:row-span-2 lg:min-h-80 lg:p-8"
      >
        <span class="pointer-events-none absolute -right-16 -bottom-16 size-72 rounded-full bg-(--color-blueprint-600) opacity-60 blur-3xl" aria-hidden="true" />
        <div class="relative z-10 flex max-w-[55%] flex-col">
          <span class="w-fit rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-semibold">
            {{ t('home.spotlightBadge') }}
          </span>
          <p class="mt-3 text-2xl leading-tight font-extrabold sm:text-3xl">
            {{ lead.name }}
          </p>
          <p class="mt-2 text-sm text-white/80">
            {{ t('home.spotlightMeta', { count: lead.count, price: money(lead.fromPrice) }) }}
          </p>
          <span class="mt-auto inline-flex w-fit items-center gap-1 rounded-md bg-white px-4 py-2 text-sm font-semibold text-zinc-900">
            {{ t('home.bannerCategoryCta', { name: lead.name }) }}
            <UIcon name="i-lucide-arrow-right" class="size-4" aria-hidden="true" />
          </span>
        </div>
        <NuxtImg
          :src="lead.image"
          alt=""
          width="320"
          height="320"
          loading="lazy"
          class="absolute right-2 bottom-2 size-40 object-contain transition-transform duration-300 group-hover:scale-105 sm:size-56 lg:size-64"
        />
      </NuxtLink>

      <NuxtLink
        v-for="category in rest"
        :key="category.slug"
        :to="categoryLink(category.slug)"
        class="group relative flex min-h-36 flex-col overflow-hidden rounded-xl bg-muted p-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <p class="relative z-10 font-bold text-highlighted group-hover:text-primary">
          {{ category.name }}
        </p>
        <p class="relative z-10 text-xs text-muted">
          {{ t('home.spotlightFrom', { price: money(category.fromPrice) }) }}
        </p>
        <NuxtImg
          :src="category.image"
          alt=""
          width="128"
          height="128"
          loading="lazy"
          class="absolute -right-2 -bottom-2 size-24 object-contain transition-transform duration-300 group-hover:scale-105 lg:size-28"
        />
      </NuxtLink>
    </div>
  </section>
</template>

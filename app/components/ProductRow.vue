<script setup lang="ts">
withDefaults(defineProps<{ products?: ProductSummary[]; loading?: boolean; showStock?: boolean }>(), {
  products: () => [],
})
</script>

<template>
  <div v-if="loading" class="flex gap-3 overflow-hidden" aria-hidden="true">
    <USkeleton v-for="n in 6" :key="n" class="aspect-[3/5] w-1/2 shrink-0 sm:w-1/4 lg:w-1/6" />
  </div>
  <!-- Horizontally scrolling shelf; arrows on wider screens, swipe on phones. -->
  <UCarousel
    v-else
    v-slot="{ item }"
    :items="products"
    arrows
    :prev="{ color: 'neutral', variant: 'solid' }"
    :next="{ color: 'neutral', variant: 'solid' }"
    :ui="{
      viewport: 'pb-1',
      container: '-ms-3 items-stretch',
      item: 'ps-3 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/6',
      prev: 'hidden sm:inline-flex -start-3 shadow-md',
      next: 'hidden sm:inline-flex -end-3 shadow-md',
    }"
  >
    <ProductCard :product="item" :show-stock="showStock" />
  </UCarousel>
</template>

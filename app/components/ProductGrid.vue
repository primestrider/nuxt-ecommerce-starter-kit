<script setup lang="ts">
withDefaults(defineProps<{ products?: ProductSummary[]; loading?: boolean; skeletons?: number }>(), {
  products: () => [],
  skeletons: 12,
})
</script>

<template>
  <ul class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
    <li v-for="(product, index) in products" :key="product.id">
      <ProductCard :product="product" :eager="index < 6" />
    </li>
    <template v-if="loading">
      <li v-for="n in skeletons" :key="`skeleton-${n}`" aria-hidden="true" class="overflow-hidden rounded-lg border border-default bg-default">
        <USkeleton class="aspect-square w-full rounded-none" />
        <div class="space-y-2 p-3">
          <USkeleton class="h-4 w-full" />
          <USkeleton class="h-4 w-1/2" />
        </div>
      </li>
    </template>
  </ul>
</template>

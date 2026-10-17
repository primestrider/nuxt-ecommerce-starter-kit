export const useWishlistStore = defineStore('wishlist', () => {
  const items = ref<ProductSummary[]>([])

  const count = computed(() => items.value.length)

  function has(id: number) {
    return items.value.some(item => item.id === id)
  }

  function toggle(product: ProductSummary) {
    if (has(product.id)) {
      items.value = items.value.filter(item => item.id !== product.id)
    } else {
      const { id, title, brand, category, price, discountPercentage, rating, stock, thumbnail, image } = product
      items.value.unshift({ id, title, brand, category, price, discountPercentage, rating, stock, thumbnail, image })
    }
  }

  return { items, count, has, toggle }
})

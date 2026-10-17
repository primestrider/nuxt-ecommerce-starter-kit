export const useCartStore = defineStore('cart', () => {
  const lines = ref<CartLine[]>([])

  const count = computed(() => lines.value.reduce((sum, line) => sum + line.quantity, 0))
  const subtotal = computed(() => roundMoney(
    lines.value.reduce((sum, line) => sum + discountedPrice(line.price, line.discountPercentage) * line.quantity, 0),
  ))

  function maxQuantity(line: Pick<CartLine, 'stock'>) {
    return Math.max(0, Math.min(line.stock, MAX_LINE_QUANTITY))
  }

  function add(product: ProductSummary, quantity = 1) {
    const existing = lines.value.find(line => line.id === product.id)
    if (existing) {
      existing.quantity = Math.min(existing.quantity + quantity, maxQuantity(existing))
      return
    }
    const { id, title, price, discountPercentage, thumbnail, stock } = product
    const line = { id, title, price, discountPercentage, thumbnail, stock, quantity: 0 }
    line.quantity = Math.min(quantity, maxQuantity(line))
    if (line.quantity > 0) lines.value.push(line)
  }

  function setQuantity(id: number, quantity: number) {
    const line = lines.value.find(l => l.id === id)
    if (!line) return
    if (quantity < 1) return remove(id)
    line.quantity = Math.min(Math.floor(quantity), maxQuantity(line))
  }

  function remove(id: number) {
    lines.value = lines.value.filter(line => line.id !== id)
  }

  function clear() {
    lines.value = []
  }

  return { lines, count, subtotal, maxQuantity, add, setQuantity, remove, clear }
})

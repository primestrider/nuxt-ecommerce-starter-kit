import * as z from 'zod'

// Cart and wishlist live in localStorage: they're per-browser, and keeping them out
// of cookies means cached SSR pages never carry one visitor's state to another.

const productFields = {
  id: z.int().positive(),
  title: z.string(),
  price: z.number().nonnegative(),
  discountPercentage: z.number().min(0).max(100),
  thumbnail: z.string(),
  stock: z.int().nonnegative(),
}

const cartSchema = z.array(z.object({ ...productFields, quantity: z.int().min(1).max(MAX_LINE_QUANTITY) }))
const wishlistSchema = z.array(z.object({
  ...productFields,
  brand: z.string().optional(),
  category: z.string(),
  rating: z.number(),
  image: z.string().default(''),
}))

function persist<T>(key: string, schema: z.ZodType<T>, source: Ref<T>) {
  try {
    const parsed = schema.safeParse(JSON.parse(localStorage.getItem(key) ?? 'null'))
    if (parsed.success) source.value = parsed.data
  } catch {
    // Unreadable or blocked storage: start empty.
  }
  watch(source, (value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // Storage full or blocked: state still works for this visit.
    }
  }, { deep: true })
}

export default defineNuxtPlugin(() => {
  const cart = useCartStore()
  const wishlist = useWishlistStore()
  persist('etalase:cart', cartSchema, toRef(cart, 'lines'))
  persist('etalase:wishlist', wishlistSchema, toRef(wishlist, 'items'))
})

import type { H3Event } from 'h3'
import { FetchError } from 'ofetch'

// The only module that knows about DummyJSON. Replace these functions to plug in
// a real commerce backend; API handlers and the app depend on shared/types only.

const SUMMARY_FIELDS = 'id,title,brand,category,price,discountPercentage,rating,stock,thumbnail,images'

type UpstreamProduct = Omit<ProductSummary, 'image'> & { images: string[] }

interface UpstreamProductList {
  products: UpstreamProduct[]
  total: number
}

interface UpstreamCart {
  id: number
  products: { id: number; title: string; thumbnail: string; quantity: number; discountedTotal?: number; discountedPrice?: number; total: number }[]
  totalQuantity: number
  discountedTotal: number
}

function upstream() {
  return $fetch.create({ baseURL: useRuntimeConfig().dummyjsonUrl, timeout: 10_000, retry: 1 })
}

/** Converts upstream failures into errors that are safe to show to the client. */
export async function callUpstream<T>(request: () => Promise<T>): Promise<T> {
  try {
    return await request()
  } catch (error) {
    const status = error instanceof FetchError ? error.statusCode : undefined
    if (status === 400 || status === 401) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    if (status === 404) throw createError({ statusCode: 404, statusMessage: 'Not Found' })
    throw createError({ statusCode: 502, statusMessage: 'Upstream service unavailable' })
  }
}

function toSummary(p: UpstreamProduct): ProductSummary {
  const { id, title, brand, category, price, discountPercentage, rating, stock, thumbnail } = p
  return { id, title, brand, category, price, discountPercentage, rating, stock, thumbnail, image: p.images[0] ?? thumbnail }
}

const upstreamSorts: Record<ProductSort, { sortBy: string; order: 'asc' | 'desc' }> = {
  'price-asc': { sortBy: 'price', order: 'asc' },
  'price-desc': { sortBy: 'price', order: 'desc' },
  'rating': { sortBy: 'rating', order: 'desc' },
  'discount': { sortBy: 'discountPercentage', order: 'desc' },
}

export async function listProducts(params: { q?: string; category?: string; sort?: ProductSort; page: number; pageSize: number }): Promise<ProductPage> {
  const api = upstream()
  const sort = params.sort ? upstreamSorts[params.sort] : {}
  const window = { limit: params.pageSize, skip: (params.page - 1) * params.pageSize }

  let products: UpstreamProduct[]
  let total: number

  if (params.q && params.category) {
    // Upstream can't combine search with a category: fetch all matches and page here.
    const all = await callUpstream(() => api<UpstreamProductList>('/products/search', {
      query: { q: params.q, limit: 0, select: SUMMARY_FIELDS, ...sort },
    }))
    const matching = all.products.filter(p => p.category === params.category)
    total = matching.length
    products = matching.slice(window.skip, window.skip + window.limit)
  } else {
    const path = params.q
      ? '/products/search'
      : params.category ? `/products/category/${encodeURIComponent(params.category)}` : '/products'
    const res = await callUpstream(() => api<UpstreamProductList>(path, {
      query: { q: params.q, select: SUMMARY_FIELDS, ...window, ...sort },
    }))
    products = res.products
    total = res.total
  }

  return { products: products.map(toSummary), total, page: params.page, pageSize: params.pageSize }
}

export async function getProduct(id: number): Promise<Product> {
  const p = await callUpstream(() => upstream()<Product & UpstreamProduct>(`/products/${id}`))
  return {
    ...toSummary(p),
    description: p.description,
    images: p.images,
    tags: p.tags,
    sku: p.sku,
    availabilityStatus: p.availabilityStatus,
    warrantyInformation: p.warrantyInformation,
    shippingInformation: p.shippingInformation,
    returnPolicy: p.returnPolicy,
    reviews: p.reviews.map(({ rating, comment, date, reviewerName }) => ({ rating, comment, date, reviewerName })),
  }
}

export async function listCategories(): Promise<Category[]> {
  const api = upstream()
  const [categories, all] = await Promise.all([
    callUpstream(() => api<{ slug: string; name: string }[]>('/products/categories')),
    callUpstream(() => api<UpstreamProductList>('/products', {
      query: { limit: 0, select: 'category,price,discountPercentage,rating,thumbnail,images' },
    })),
  ])
  return categories.map(({ slug, name }) => {
    const inCategory = all.products.filter(p => p.category === slug)
    const best = inCategory.reduce<UpstreamProduct | undefined>((top, p) => (!top || p.rating > top.rating ? p : top), undefined)
    const prices = inCategory.map(p => discountedPrice(p.price, p.discountPercentage))
    return {
      slug,
      name,
      count: inCategory.length,
      image: best?.images[0] ?? best?.thumbnail ?? '',
      fromPrice: prices.length ? Math.min(...prices) : 0,
    }
  })
}

// --- Session -----------------------------------------------------------------

const SESSION_COOKIE = 'session'
const SESSION_MINUTES = 60 * 24 * 7

export async function login(input: LoginInput): Promise<{ user: SessionUser; accessToken: string }> {
  const res = await callUpstream(() => upstream()<SessionUser & { accessToken: string }>('/auth/login', {
    method: 'POST',
    body: { ...input, expiresInMins: SESSION_MINUTES },
  }))
  return { user: toSessionUser(res), accessToken: res.accessToken }
}

export function setAuthCookie(event: H3Event, accessToken: string) {
  setCookie(event, SESSION_COOKIE, accessToken, {
    httpOnly: true,
    secure: !import.meta.dev,
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MINUTES * 60,
  })
}

export function clearAuthCookie(event: H3Event) {
  deleteCookie(event, SESSION_COOKIE, { path: '/' })
}

function toSessionUser(u: SessionUser): SessionUser {
  const { id, username, email, firstName, lastName, image } = u
  return { id, username, email, firstName, lastName, image }
}

/** Resolves the signed-in user from the session cookie, or throws 401. */
export async function requireUser(event: H3Event): Promise<SessionUser> {
  const token = getCookie(event, SESSION_COOKIE)
  if (!token) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  try {
    const user = await callUpstream(() => upstream()<SessionUser>('/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    }))
    return toSessionUser(user)
  } catch (error) {
    if ((error as { statusCode?: number }).statusCode === 401) clearAuthCookie(event)
    throw error
  }
}

export async function registerUser(input: RegisterInput) {
  // DummyJSON simulates creation: the account is not persisted and can't sign in.
  await callUpstream(() => upstream()('/users/add', { method: 'POST', body: input }))
}

// --- Orders --------------------------------------------------------------------

function toOrder(cart: UpstreamCart, shipping: number): Order {
  const subtotal = roundMoney(cart.discountedTotal)
  return {
    id: cart.id,
    lines: cart.products.map(p => ({
      id: p.id,
      title: p.title,
      thumbnail: p.thumbnail,
      quantity: p.quantity,
      total: roundMoney(p.discountedTotal ?? p.discountedPrice ?? p.total),
    })),
    totalQuantity: cart.totalQuantity,
    subtotal,
    shipping,
    total: roundMoney(subtotal + shipping),
  }
}

export async function listOrders(userId: number): Promise<Order[]> {
  const res = await callUpstream(() => upstream()<{ carts: UpstreamCart[] }>(`/carts/user/${userId}`))
  return res.carts.map(cart => toOrder(cart, 0))
}

export async function createOrder(userId: number, request: OrderRequest): Promise<Order> {
  // Prices come from upstream, never from the client.
  const cart = await callUpstream(() => upstream()<UpstreamCart>('/carts/add', {
    method: 'POST',
    body: { userId, products: request.items },
  }))
  return toOrder(cart, shippingCost(request.shippingMethod, cart.discountedTotal))
}

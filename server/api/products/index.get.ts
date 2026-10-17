import * as z from 'zod'

const querySchema = z.object({
  q: z.string().trim().max(100).optional().transform(v => v || undefined),
  category: z.string().trim().regex(/^[a-z0-9-]+$/).max(50).optional(),
  sort: z.enum(productSorts).optional(),
  page: z.coerce.number().int().min(1).max(1000).default(1),
  pageSize: z.coerce.number().int().min(1).max(48).default(PRODUCTS_PAGE_SIZE),
})

export default defineCachedEventHandler(async (event) => {
  const query = await getValidatedQuery(event, querySchema.parse)
  return listProducts(query)
}, { name: 'products-v2', maxAge: 60 * 10, swr: true, getKey: event => getRequestURL(event).search || 'all' })

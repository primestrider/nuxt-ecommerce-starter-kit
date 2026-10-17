import * as z from 'zod'

const paramsSchema = z.object({ id: z.coerce.number().int().positive() })

export default defineCachedEventHandler(async (event) => {
  const { id } = await getValidatedRouterParams(event, paramsSchema.parse)
  return getProduct(id)
}, { name: 'product-v2', maxAge: 60 * 10, swr: true, getKey: event => getRouterParam(event, 'id') ?? '' })

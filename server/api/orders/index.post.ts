export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const request = await readValidatedBody(event, orderRequestSchema.parse)
  const order = await createOrder(user.id, request)
  setResponseStatus(event, 201)
  return order
})

export default defineEventHandler(async (event) => {
  const input = await readValidatedBody(event, registerSchema.parse)
  await registerUser(input)
  setResponseStatus(event, 201)
  return { ok: true }
})

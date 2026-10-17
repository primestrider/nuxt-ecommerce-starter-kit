export default defineEventHandler(async (event) => {
  const input = await readValidatedBody(event, loginSchema.parse)
  const { user, accessToken } = await login(input)
  setAuthCookie(event, accessToken)
  return user
})

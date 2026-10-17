export default defineCachedEventHandler(() => listCategories(), { name: 'categories-v2', maxAge: 60 * 60 * 24, swr: true })

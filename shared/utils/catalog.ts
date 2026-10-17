export const productSorts = ['price-asc', 'price-desc', 'rating', 'discount'] as const
export type ProductSort = (typeof productSorts)[number]

export const PRODUCTS_PAGE_SIZE = 24

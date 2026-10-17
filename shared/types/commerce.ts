// Shapes the app works with. The server maps upstream (DummyJSON) responses into
// these, so swapping the backend only touches server/utils/dummyjson.ts.

export interface ProductSummary {
  id: number
  title: string
  brand?: string
  category: string
  price: number
  discountPercentage: number
  rating: number
  stock: number
  thumbnail: string
  /** Full-size first image, for large displays. */
  image: string
}

export interface ProductReview {
  rating: number
  comment: string
  date: string
  reviewerName: string
}

export interface Product extends ProductSummary {
  description: string
  images: string[]
  tags: string[]
  sku: string
  availabilityStatus: string
  warrantyInformation: string
  shippingInformation: string
  returnPolicy: string
  reviews: ProductReview[]
}

export interface ProductPage {
  products: ProductSummary[]
  total: number
  page: number
  pageSize: number
}

export interface Category {
  slug: string
  name: string
  count: number
  /** Photo of the category's highest-rated product. */
  image: string
  /** Lowest discounted price in the category. */
  fromPrice: number
}

export interface CartLine {
  id: number
  title: string
  price: number
  discountPercentage: number
  thumbnail: string
  stock: number
  quantity: number
}

export interface SessionUser {
  id: number
  username: string
  email: string
  firstName: string
  lastName: string
  image: string
}

export interface OrderLine {
  id: number
  title: string
  thumbnail: string
  quantity: number
  total: number
}

export interface Order {
  id: number
  lines: OrderLine[]
  totalQuantity: number
  subtotal: number
  shipping: number
  total: number
}

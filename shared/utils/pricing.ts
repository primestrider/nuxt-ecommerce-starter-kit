export const MAX_LINE_QUANTITY = 99

export const shippingMethods = ['regular', 'express'] as const
export type ShippingMethod = (typeof shippingMethods)[number]

/** Regular shipping is free from this subtotal (store currency). */
export const FREE_SHIPPING_FROM = 100

/** Flat shipping rates in store currency. */
export const SHIPPING_RATES: Record<ShippingMethod, number> = {
  regular: 5,
  express: 15,
}

export function roundMoney(value: number) {
  return Math.round(value * 100) / 100
}

export function discountedPrice(price: number, discountPercentage: number) {
  return roundMoney(price * (1 - discountPercentage / 100))
}

export function shippingCost(method: ShippingMethod, subtotal: number) {
  if (method === 'regular' && subtotal >= FREE_SHIPPING_FROM) return 0
  return SHIPPING_RATES[method]
}

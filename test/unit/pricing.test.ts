import { describe, expect, it } from 'vitest'
import { discountedPrice, FREE_SHIPPING_FROM, roundMoney, shippingCost, SHIPPING_RATES } from '../../shared/utils/pricing'

describe('discountedPrice', () => {
  it('applies the percentage and rounds to cents', () => {
    expect(discountedPrice(9.99, 10.48)).toBe(8.94)
    expect(discountedPrice(100, 0)).toBe(100)
  })
})

describe('roundMoney', () => {
  it('avoids floating point noise', () => {
    expect(roundMoney(0.1 + 0.2)).toBe(0.3)
  })
})

describe('shippingCost', () => {
  it('makes regular shipping free from the threshold', () => {
    expect(shippingCost('regular', FREE_SHIPPING_FROM - 0.01)).toBe(SHIPPING_RATES.regular)
    expect(shippingCost('regular', FREE_SHIPPING_FROM)).toBe(0)
  })

  it('always charges for express', () => {
    expect(shippingCost('express', FREE_SHIPPING_FROM * 10)).toBe(SHIPPING_RATES.express)
  })
})

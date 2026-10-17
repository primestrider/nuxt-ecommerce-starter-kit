import { describe, expect, it } from 'vitest'
import { checkoutSchema, orderRequestSchema } from '../../shared/utils/schemas'

const address = {
  fullName: 'Emily Johnson',
  phone: '+62 812 3456 789',
  address: 'Jl. Merdeka 1',
  city: 'Jakarta',
  postalCode: '10110',
  shippingMethod: 'regular',
  paymentMethod: 'cod',
}

describe('checkoutSchema', () => {
  it('accepts a complete address', () => {
    expect(checkoutSchema.safeParse(address).success).toBe(true)
  })

  it('rejects an invalid phone number and unknown methods', () => {
    expect(checkoutSchema.safeParse({ ...address, phone: 'call me' }).success).toBe(false)
    expect(checkoutSchema.safeParse({ ...address, shippingMethod: 'drone' }).success).toBe(false)
  })
})

describe('orderRequestSchema', () => {
  it('requires at least one line with a sane quantity', () => {
    expect(orderRequestSchema.safeParse({ ...address, items: [] }).success).toBe(false)
    expect(orderRequestSchema.safeParse({ ...address, items: [{ id: 1, quantity: 0 }] }).success).toBe(false)
    expect(orderRequestSchema.safeParse({ ...address, items: [{ id: 1, quantity: 1000 }] }).success).toBe(false)
    expect(orderRequestSchema.safeParse({ ...address, items: [{ id: 1, quantity: 2 }] }).success).toBe(true)
  })

  it('ignores client-supplied prices', () => {
    const parsed = orderRequestSchema.parse({ ...address, items: [{ id: 1, quantity: 2, price: 0.01 }] })
    expect(parsed.items[0]).toEqual({ id: 1, quantity: 2 })
  })
})

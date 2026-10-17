import * as z from 'zod'
import { MAX_LINE_QUANTITY, shippingMethods } from './pricing'

// Shared by forms (client) and API handlers (server) so both validate the same rules.

export const loginSchema = z.object({
  username: z.string().trim().min(1).max(50),
  password: z.string().min(1).max(100),
})

export const registerSchema = z.object({
  firstName: z.string().trim().min(1).max(50),
  lastName: z.string().trim().min(1).max(50),
  email: z.email(),
  username: z.string().trim().min(3).max(30).regex(/^[a-z0-9_.]+$/i),
  password: z.string().min(8).max(100),
})

export const paymentMethods = ['bank_transfer', 'cod'] as const

export const checkoutSchema = z.object({
  fullName: z.string().trim().min(2).max(100),
  phone: z.string().trim().regex(/^\+?[0-9][0-9\s-]{7,19}$/),
  address: z.string().trim().min(5).max(200),
  city: z.string().trim().min(2).max(80),
  postalCode: z.string().trim().regex(/^[0-9A-Za-z\s-]{3,10}$/),
  shippingMethod: z.enum(shippingMethods),
  paymentMethod: z.enum(paymentMethods),
  note: z.string().trim().max(300).optional(),
})

export const orderRequestSchema = checkoutSchema.extend({
  items: z
    .array(z.object({ id: z.int().positive(), quantity: z.int().min(1).max(MAX_LINE_QUANTITY) }))
    .min(1)
    .max(50),
})

export type LoginInput = z.output<typeof loginSchema>
export type RegisterInput = z.output<typeof registerSchema>
export type CheckoutInput = z.output<typeof checkoutSchema>
export type OrderRequest = z.output<typeof orderRequestSchema>

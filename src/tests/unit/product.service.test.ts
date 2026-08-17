import { describe, it, expect, vi, beforeEach } from 'vitest'
import { z } from 'zod'

vi.mock('../../index.ts', () => ({
  db: {
    insert: vi.fn().mockReturnValue({
      values: vi.fn().mockResolvedValue([{ id: 1 }]),
    }),
  },
}))

import { db } from '../../index.ts'
import { productsTable } from '../../db/schema.ts'
import { productService } from '../../services/product.service.ts'
import { createProductSchema } from '../../validators/product.validator.ts'

describe('productService.create', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should call db.insert with the products table', async () => {
    await productService.create({ name: 'Milk', price: 100, description: 'Fresh milk' })
    expect(vi.mocked(db.insert)).toHaveBeenCalledWith(productsTable)
  })

  it('should call values with correct product data', async () => {
    const valuesMock = vi.fn().mockResolvedValue([{ id: 1 }])
    vi.mocked(db.insert).mockReturnValue({ values: valuesMock } as any)

    await productService.create({ name: 'Milk', price: 100, description: 'Fresh milk' })

    expect(valuesMock).toHaveBeenCalledWith({
      name: 'Milk',
      price: 100,
      description: 'Fresh milk',
    })
  })
})

describe('createProductSchema', () => {
  it('should reject negative price', () => {
    const result = createProductSchema.safeParse({ name: 'Milk', price: -50 })
    expect(result.success).toBe(false)
    expect(z.treeifyError(result.error!).properties?.price).toBeDefined()
  })
})

import { db } from '../index.ts'
import { productsTable } from '../db/schema.ts'
import type { InferInsertModel, InferSelectModel } from 'drizzle-orm'

export type Product = InferSelectModel<typeof productsTable>
export type NewProduct = InferInsertModel<typeof productsTable>

export const productService = {
  async create(data: Pick<NewProduct, 'name' | 'price' | 'description'>): Promise<void> {
    await db.insert(productsTable).values(data)
  },
}

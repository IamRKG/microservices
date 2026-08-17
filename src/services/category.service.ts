import { db } from '../index.ts'
import { categoriesTable } from '../db/schema.ts'
import type { InferInsertModel, InferSelectModel } from 'drizzle-orm'

export type Category = InferSelectModel<typeof categoriesTable>
export type NewCategory = InferInsertModel<typeof categoriesTable>

export const categoryService = {
  async create(data: Pick<NewCategory, 'name' | 'description'>): Promise<void> {
    await db.insert(categoriesTable).values(data)
  },

  async findAll(): Promise<Category[]> {
    return db.select().from(categoriesTable)
  },
}

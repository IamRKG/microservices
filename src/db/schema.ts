import { integer, varchar } from "drizzle-orm/pg-core";
import { snakeCase } from 'drizzle-orm/pg-core';

export const categoriesTable = snakeCase.table("categories", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull().unique(),
  description: varchar({ length: 255 }),
});

export const productsTable = snakeCase.table("products", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  price: integer().notNull(),
  description: varchar({ length: 255 }),
  categoryId: integer().references(() => categoriesTable.id, { onDelete: 'set null' }),
});
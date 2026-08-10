import { integer, varchar } from "drizzle-orm/pg-core";
import { snakeCase} from 'drizzle-orm/pg-core';

export const productsTable = snakeCase.table("products", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  price: integer().notNull(),
  description: varchar({ length: 255 }),
});
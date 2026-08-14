import express, { type Express, type Request, type Response } from 'express';
import { z } from 'zod';
import { pinoHttp } from 'pino-http';
import logger from './logger.ts';
import { categoriesTable, productsTable } from './db/schema.ts';
import { db } from './index.ts';
import { createCategorySchema } from './schemas/category.schema.ts';
import { createProductSchema } from './schemas/product.schema.ts'

const isDuplicateKeyError = (err: unknown): boolean => {
  if (typeof err !== 'object' || err === null) return false;
  const cause = (err as { cause?: unknown }).cause;
  return typeof cause === 'object' && cause !== null && 'code' in cause && cause.code === '23505';
};

const app: Express = express();
app.use(express.json());
app.use(pinoHttp({ logger }));


app.get('/', (req: Request, res: Response) => {
  res.send('Hello World!');
});

app.post('/products', async (req: Request, res: Response) => {
  const result = createProductSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({
      error: 'Validation failed',
      details: z.treeifyError(result.error).properties
    });
    return
  } 

  const { name, price, description } = result.data;
  try {
    await db.insert(productsTable).values({ name, price, description });
    res.status(201).json({ message: 'Product created' });
  } catch (err) {
    logger.error({ err }, 'Failed to create product');
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/categories', async (req: Request, res: Response) => {
  const result = createCategorySchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({
      error: 'Validation failed',
      details: z.treeifyError(result.error).properties,
    });
    return;
  }

  const { name, description } = result.data;
  try {
    await db.insert(categoriesTable).values({ name, description });
    res.status(201).json({ message: 'Category created' });
  } catch (err) {
    if (isDuplicateKeyError(err)) {
      res.status(409).json({ error: `Category '${name}' already exists` });
      return;
    }
    logger.error({ err }, 'Failed to create category');
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/categories', async (_req: Request, res: Response) => {
  try {
    const categories = await db.select().from(categoriesTable);
    res.status(200).json(categories);
  } catch (err) {
    logger.error({ err }, 'Failed to fetch categories');
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default app;
import express, { type Express, type Request, type Response } from 'express';
import { z } from 'zod';
import { pinoHttp } from 'pino-http';
import logger from './logger.ts';
import { createCategorySchema } from './validators/category.validator.ts';
import { createProductSchema } from './validators/product.validator.ts';
import { productService } from './services/product.service.ts';
import { categoryService } from './services/category.service.ts';

const isDuplicateKeyError = (err: unknown): boolean => {
  if (typeof err !== 'object' || err === null) return false;
  const cause = (err as { cause?: unknown }).cause;
  return typeof cause === 'object' && cause !== null && 'code' in cause && cause.code === '23505';
};

const app: Express = express();
app.use(express.json());
app.use(pinoHttp({ logger }));

app.get('/', (_req: Request, res: Response) => {
  res.send('Hello World!');
});

app.post('/products', async (req: Request, res: Response) => {
  const result = createProductSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({
      error: 'Validation failed',
      details: z.treeifyError(result.error).properties,
    });
    return;
  }

  try {
    await productService.create(result.data);
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

  try {
    await categoryService.create(result.data);
    res.status(201).json({ message: 'Category created' });
  } catch (err) {
    if (isDuplicateKeyError(err)) {
      res.status(409).json({ error: `Category '${result.data.name}' already exists` });
      return;
    }
    logger.error({ err }, 'Failed to create category');
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/categories', async (_req: Request, res: Response) => {
  try {
    const categories = await categoryService.findAll();
    res.status(200).json(categories);
  } catch (err) {
    logger.error({ err }, 'Failed to fetch categories');
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default app;
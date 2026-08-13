import express, { type Express, type Request, type Response } from 'express';
import { z } from 'zod';
import { pinoHttp } from 'pino-http';
import logger from './logger.ts';
import { productsTable } from './db/schema.ts';
import { db } from './index.ts';
import { createProductSchema } from './schemas/product.schema.ts'

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

  const { name, price, description } = result.data 
  await db.insert(productsTable).values({ name, price, description });

  res.status(201).json({ message: 'Product created' })
});

export default app;
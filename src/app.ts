import express, { type Express, type Request, type Response } from 'express';
import { productsTable } from './db/schema.ts';
import { db } from './index.ts';

const app: Express = express();
app.use(express.json());


app.get('/', (req: Request, res: Response) => {
  res.send('Hello World!');
});

app.post('/products', async (req: Request, res: Response) => {
  const { name, price, description } = req.body;
  await db.insert(productsTable).values({ name, price, description });

  res.send('Product created!');
});

export default app;
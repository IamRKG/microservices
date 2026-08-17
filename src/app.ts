import express, { type Express, type Request, type Response, type NextFunction } from 'express'
import { z } from 'zod'
import { pinoHttp } from 'pino-http'
import logger from './logger.ts'
import { createCategorySchema } from './validators/category.validator.ts'
import { createProductSchema } from './validators/product.validator.ts'
import { productService } from './services/product.service.ts'
import { categoryService } from './services/category.service.ts'
import { errorHandler } from './middleware/errorHandler.ts'

const app: Express = express()
app.use(express.json())
app.use(pinoHttp({ logger }))

app.get('/', (_req: Request, res: Response) => {
  res.send('Hello World!')
})

app.post('/products', async (req: Request, res: Response, next: NextFunction) => {
  const result = createProductSchema.safeParse(req.body)
  if (!result.success) {
    res.status(400).json({
      error: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details: z.treeifyError(result.error).properties,
    })
    return
  }

  try {
    await productService.create(result.data)
    res.status(201).json({ message: 'Product created' })
  } catch (err) {
    next(err)
  }
})

app.post('/categories', async (req: Request, res: Response, next: NextFunction) => {
  const result = createCategorySchema.safeParse(req.body)
  if (!result.success) {
    res.status(400).json({
      error: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details: z.treeifyError(result.error).properties,
    })
    return
  }

  try {
    await categoryService.create(result.data)
    res.status(201).json({ message: 'Category created' })
  } catch (err) {
    next(err)
  }
})

app.get('/categories', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await categoryService.findAll()
    res.status(200).json(categories)
  } catch (err) {
    next(err)
  }
})

app.use(errorHandler)

export default app

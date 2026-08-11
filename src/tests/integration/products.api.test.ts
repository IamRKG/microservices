import { describe, it, expect, beforeAll, afterEach } from 'vitest'
import request from 'supertest'
import { drizzle } from 'drizzle-orm/node-postgres'
import { productsTable } from '../../db/schema.ts'
import app from '../../app.ts'

const testDb = drizzle(process.env.DATABASE_URL!)

beforeAll(async () => {
  await testDb.delete(productsTable)
})

afterEach(async () => {
  await testDb.delete(productsTable)
})

describe('POST /products', () => {
  it('should create a product and return 200', async () => {
    const res = await request(app)
      .post('/products')
      .send({ name: 'Milk', price: 100, description: 'Fresh milk' })

    expect(res.status).toBe(200)
  })

  it('should persist the product in the database', async () => {
    await request(app)
      .post('/products')
      .send({ name: 'Butter', price: 50, description: 'Salted butter' })

    const products = await testDb.select().from(productsTable)
    expect(products).toHaveLength(1)
    expect(products[0].name).toBe('Butter')
    expect(products[0].price).toBe(50)
  })

  it.todo('should return 400 when name is missing — input validation not yet implemented')
})

describe('GET /', () => {
  it('should return Hello World', async () => {
    const res = await request(app).get('/')
    expect(res.status).toBe(200)
    expect(res.text).toBe('Hello World!')
  })
})

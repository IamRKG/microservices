import { describe, it, expect, beforeAll, afterEach } from 'vitest'
import request from 'supertest'
import { drizzle } from 'drizzle-orm/node-postgres'
import { categoriesTable } from '../../db/schema.ts'
import app from '../../app.ts'

const testDb = drizzle(process.env.DATABASE_URL!)

beforeAll(async () => {
  await testDb.delete(categoriesTable)
})

afterEach(async () => {
  await testDb.delete(categoriesTable)
})

describe('POST /categories', () => {
  it('should create a category and return 201', async () => {
    const res = await request(app)
      .post('/categories')
      .send({ name: 'Dairy', description: 'Milk and dairy products' })

    expect(res.status).toBe(201)
    expect(res.body.message).toBe('Category created')
  })

  it('should persist the category in the database', async () => {
    await request(app)
      .post('/categories')
      .send({ name: 'Dairy', description: 'Milk and dairy products' })

    const categories = await testDb.select().from(categoriesTable)
    expect(categories).toHaveLength(1)
    expect(categories[0].name).toBe('Dairy')
  })

  it('should return 400 when name is missing', async () => {
    const res = await request(app)
      .post('/categories')
      .send({ description: 'No name provided' })

    expect(res.status).toBe(400)
    expect(res.body.error).toBe('Validation failed')
  })

  it('should return 400 when name is empty', async () => {
    const res = await request(app)
      .post('/categories')
      .send({ name: '' })

    expect(res.status).toBe(400)
  })

  it('should return 409 when category name already exists', async () => {
    await request(app)
      .post('/categories')
      .send({ name: 'Dairy' })

    const res = await request(app)
      .post('/categories')
      .send({ name: 'Dairy' })

    expect(res.status).toBe(409)
    expect(res.body.error).toBe('Resource already exists')
    expect(res.body.code).toBe('CONFLICT')
  })
})

describe('GET /categories', () => {
  it('should return empty array when no categories exist', async () => {
    const res = await request(app).get('/categories')

    expect(res.status).toBe(200)
    expect(res.body).toEqual([])
  })

  it('should return all categories', async () => {
    await testDb.insert(categoriesTable).values([
      { name: 'Dairy', description: 'Milk and dairy products' },
      { name: 'Bakery', description: 'Bread and pastries' },
    ])

    const res = await request(app).get('/categories')

    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(2)
    expect(res.body.map((c: { name: string }) => c.name)).toEqual(
      expect.arrayContaining(['Dairy', 'Bakery'])
    )
  })
})

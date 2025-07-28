import request from 'supertest'

import { createApp } from '../src/app'

const app = createApp()

describe('Authentication', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        tenantId: 'test-tenant',
        role: 'USER'
      }

      const response = await request(app).post('/api/auth/register').send(userData).expect(201)

      expect(response.body.success).toBe(true)
      expect(response.body.data.user.email).toBe(userData.email)
      expect(response.body.data.tokens.accessToken).toBeDefined()
    })

    it('should not register user with invalid email', async () => {
      const userData = {
        name: 'Test User',
        email: 'invalid-email',
        password: 'password123',
        tenantId: 'test-tenant'
      }

      const response = await request(app).post('/api/auth/register').send(userData).expect(400)

      expect(response.body.success).toBe(false)
    })
  })

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request(app).post('/api/auth/register').send({
        name: 'Test User',
        email: 'login@example.com',
        password: 'password123',
        tenantId: 'test-tenant'
      })
    })

    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'password123',
          tenantId: 'test-tenant'
        })
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data.tokens.accessToken).toBeDefined()
    })

    it('should not login with invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'wrongpassword',
          tenantId: 'test-tenant'
        })
        .expect(401)

      expect(response.body.success).toBe(false)
    })
  })
})

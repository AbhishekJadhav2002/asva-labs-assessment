import { hash, compare } from 'bcryptjs'
import * as jwt from 'jsonwebtoken'

import { prisma } from '@/config/database'
import { publishEvent } from '@/config/kafka'
import { AppError } from '@/utils/errors'

interface LoginData {
  email: string
  password: string
  tenantId: string
}

interface RegisterData extends LoginData {
  name: string
  role?: 'ADMIN' | 'USER'
}

export class AuthService {
  static async register(data: RegisterData) {
    const { name, email, password, tenantId, role = 'USER' } = data

    const existingUser = await prisma.user.findFirst({
      where: { email, tenantId }
    })

    if (existingUser) {
      throw new AppError('User already exists', 400)
    }

    const hashedPassword = await hash(password, 12)

    const user = await prisma.user.create({
      data: {
        name,
        role,
        email,
        tenantId,
        password: hashedPassword
      },
      select: {
        id: true,
        name: true,
        role: true,
        email: true,
        tenantId: true,
        createdAt: true
      }
    })

    await publishEvent('user.created', {
      userId: user.id,
      email: user.email,
      tenantId: user.tenantId,
      timestamp: new Date().toISOString()
    })

    const { accessToken, refreshToken } = this.generateTokens(user)

    return {
      user,
      tokens: { accessToken, refreshToken }
    }
  }

  static async login(data: LoginData) {
    const { email, password, tenantId } = data

    const user = await prisma.user.findFirst({
      where: { email, tenantId }
    })

    if (!user || !(await compare(password, user.password))) {
      throw new AppError('Invalid credentials', 401)
    }

    const { accessToken, refreshToken } = this.generateTokens(user)

    await publishEvent('user.login', {
      userId: user.id,
      email: user.email,
      tenantId: user.tenantId,
      timestamp: new Date().toISOString()
    })

    return {
      tokens: { accessToken, refreshToken },
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        email: user.email,
        tenantId: user.tenantId
      }
    }
  }

  static async refreshToken(token: string) {
    try {
      const refreshSecret = process.env['JWT_REFRESH_SECRET']
      if (!refreshSecret) {
        throw new AppError('JWT_REFRESH_SECRET is not set', 500)
      }
      const decoded = jwt.verify(token, refreshSecret) as { tenantId: string; userId: string, }

      const user = await prisma.user.findUnique({
        where: { id: decoded.userId }
      })

      if (!user) {
        throw new AppError('Invalid refresh token', 401)
      }

      const { accessToken, refreshToken } = this.generateTokens(user)
      return { accessToken, refreshToken }
    } catch {
      throw new AppError('Invalid refresh token', 401)
    }
  }

  private static generateTokens(user: { email: string; id: string; role: string; tenantId: string }) {
    const payload = {
      userId: user.id,
      role: user.role,
      email: user.email,
      tenantId: user.tenantId
    }

    const jwtSecret = process.env['JWT_SECRET']
    if (!jwtSecret) {
      throw new AppError('JWT_SECRET is not set', 500)
    }
    const accessToken = jwt.sign(payload, jwtSecret, {
      expiresIn: '15m'
    })

    const refreshSecret = process.env['JWT_REFRESH_SECRET']
    if (!refreshSecret) {
      throw new AppError('JWT_REFRESH_SECRET is not set', 500)
    }
    const refreshToken = jwt.sign(payload, refreshSecret, {
      expiresIn: '7d'
    })

    return { accessToken, refreshToken }
  }
}

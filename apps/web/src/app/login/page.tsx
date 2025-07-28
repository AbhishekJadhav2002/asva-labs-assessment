'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { z } from 'zod'

import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { AuthService } from '@/lib/auth'

const loginSchema = z.object({
  email: z.email('Invalid email address'),
  tenantId: z.string().min(1, 'Tenant ID is required'),
  password: z.string().min(6, 'Password must be at least 6 characters')
})

type LoginFormData = z.infer<typeof loginSchema>

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  })

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true)
    try {
      await AuthService.login(data)
      toast.success('Login successful!')
      router.push('/dashboard')
    } catch (error) {
      console.error('Login error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="text-center text-3xl font-bold text-primary-600 mb-2">Asva Labs</h1>
          <h2 className="text-center text-2xl font-bold text-gray-900">Sign in to your account</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link href="/register" className="font-medium text-primary-600 hover:text-primary-500">
              create a new account
            </Link>
          </p>
        </div>

        <Card>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6"
          >
            <Input
              label="Email address"
              type="email"
              {...register('email')}
              error={errors.email?.message}
              placeholder="Enter your email"
            />

            <Input
              label="Password"
              type="password"
              {...register('password')}
              error={errors.password?.message}
              placeholder="Enter your password"
            />

            <Input
              label="Tenant ID"
              {...register('tenantId')}
              error={errors.tenantId?.message}
              placeholder="Enter your tenant ID"
            />

            <Button type="submit" className="w-full" loading={loading} disabled={loading}>
              Sign in
            </Button>
          </form>
        </Card>

        <div className="text-center text-sm text-gray-600">
          <p>Demo Credentials:</p>
          <p>Email: admin@demo.com | Password: demo123 | Tenant: demo</p>
          <p>Email: user@demo.com | Password: demo123 | Tenant: demo</p>
        </div>
      </div>
    </div>
  )
}

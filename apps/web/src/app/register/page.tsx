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

const registerSchema = z.object({
  role: z.enum(['ADMIN', 'USER']),
  email: z.email('Invalid email address'),
  tenantId: z.string().min(1, 'Tenant ID is required'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters')
})

type RegisterFormData = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'USER'
    }
  })

  const onSubmit = async (data: RegisterFormData) => {
    setLoading(true)
    try {
      await AuthService.register(data)
      toast.success('Registration successful!')
      router.push('/dashboard')
    } catch (error) {
      console.error('Registration error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="text-center text-3xl font-bold text-primary-600 mb-2">Asva Labs</h1>
          <h2 className="text-center text-2xl font-bold text-gray-900">Create your account</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link href="/login" className="font-medium text-primary-600 hover:text-primary-500">
              sign in to existing account
            </Link>
          </p>
        </div>

        <Card>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6"
          >
            <Input
              label="Full Name"
              {...register('name')}
              error={errors.name?.message}
              placeholder="Enter your full name"
            />

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

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Role</label>
              <select
                {...register('role')}
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
              >
                <option value="USER">User</option>
                <option value="ADMIN">Admin</option>
              </select>
              {errors.role && <p className="text-sm text-red-600">{errors.role.message}</p>}
            </div>

            <Button type="submit" className="w-full" loading={loading} disabled={loading}>
              Create account
            </Button>
          </form>
        </Card>
      </div>
    </div>
  )
}

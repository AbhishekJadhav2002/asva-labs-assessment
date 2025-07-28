import type { Project } from '@/lib/queries'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

const projectSchema = z.object({
  description: z.string().optional(),
  name: z.string().min(1, 'Project name is required'),
  status: z.enum(['ACTIVE', 'COMPLETED', 'ARCHIVED']).optional()
})

type ProjectFormData = z.infer<typeof projectSchema>

interface ProjectFormProperties {
  project?: Project
  loading?: boolean
  onCancel: () => void
  onSubmit: (data: ProjectFormData) => void
}

export function ProjectForm({ project, loading, onSubmit, onCancel }: ProjectFormProperties) {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: project?.name ?? '',
      status: project?.status ?? 'ACTIVE',
      description: project?.description ?? ''
    }
  })

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4"
    >
      <Input label="Project Name" {...register('name')} error={errors.name?.message} placeholder="Enter project name" />

      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          {...register('description')}
          className="flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="Enter project description (optional)"
          rows={3}
        />
      </div>

      {project && (
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Status</label>
          <select
            {...register('status')}
            className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="ACTIVE">Active</option>
            <option value="COMPLETED">Completed</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
      )}

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={loading ?? false}>
          {project ? 'Update' : 'Create'} Project
        </Button>
      </div>
    </form>
  )
}

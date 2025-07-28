import type { ApiResponse } from './api'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'

import { api } from './api'
import { AuthService } from './auth'

export interface Project {
  id: string
  name: string
  tasks: Task[]
  createdAt: string
  updatedAt: string
  description?: string
  status: 'ACTIVE' | 'ARCHIVED' | 'COMPLETED'
  user: {
    email: string
    id: string
    name: string
  }
}

export interface Task {
  id: string
  title: string
  dueDate?: string
  createdAt: string
  updatedAt: string
  description?: string
  priority: 'HIGH' | 'LOW' | 'MEDIUM' | 'URGENT'
  project?: {
    id: string
    name: string
  }
  status: 'CANCELLED' | 'DONE' | 'IN_PROGRESS' | 'TODO'
  user: {
    email: string
    id: string
    name: string
  }
}

export const useProjects = () => {
  return useQuery({
    queryKey: ['projects'],
    enabled: AuthService.isAuthenticated(),
    queryFn: async () => {
      const response = await api.get<ApiResponse<Project[]>>('/projects')
      return response.data.data
    }
  })
}

export const useProject = (id: string) => {
  return useQuery({
    queryKey: ['project', id],
    enabled: !!id && AuthService.isAuthenticated(),
    queryFn: async () => {
      const response = await api.get<ApiResponse<Project>>(`/projects/${id}`)
      return response.data.data
    }
  })
}

export const useCreateProject = () => {
  const queryClient = useQueryClient()

  return useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      toast.success('Project created successfully')
    },
    mutationFn: async (data: { description?: string | undefined; name: string }) => {
      const response = await api.post<ApiResponse<Project>>('/projects', data)
      return response.data.data
    }
  })
}

export const useUpdateProject = () => {
  const queryClient = useQueryClient()

  return useMutation({
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['project', id] })
      toast.success('Project updated successfully')
    },
    mutationFn: async ({
      id,
      data
    }: {
      data: { description?: string; name?: string; status?: Project['status'] }
      id: string
    }) => {
      const response = await api.put<ApiResponse<Project>>(`/projects/${id}`, data)
      return response.data.data
    }
  })
}

export const useDeleteProject = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/projects/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      toast.success('Project deleted successfully')
    }
  })
}

export const useProjectTasks = (projectId: string) => {
  return useQuery({
    queryKey: ['tasks', 'project', projectId],
    enabled: !!projectId && AuthService.isAuthenticated(),
    queryFn: async () => {
      const response = await api.get<ApiResponse<Task[]>>(`/tasks/project/${projectId}`)
      return response.data.data
    }
  })
}

export const useTask = (id: string) => {
  return useQuery({
    queryKey: ['task', id],
    enabled: !!id && AuthService.isAuthenticated(),
    queryFn: async () => {
      const response = await api.get<ApiResponse<Task>>(`/tasks/${id}`)
      return response.data.data
    }
  })
}

export const useCreateTask = () => {
  const queryClient = useQueryClient()

  return useMutation({
    onSuccess: task => {
      queryClient.invalidateQueries({ queryKey: ['tasks', 'project', task.project?.id] })
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      toast.success('Task created successfully')
    },
    mutationFn: async (data: {
      description?: string
      dueDate?: string
      priority?: Task['priority']
      projectId: string
      title: string
    }) => {
      const response = await api.post<ApiResponse<Task>>('/tasks', data)
      return response.data.data
    }
  })
}

export const useUpdateTask = () => {
  const queryClient = useQueryClient()

  return useMutation({
    onSuccess: (task, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['task', id] })
      queryClient.invalidateQueries({ queryKey: ['tasks', 'project', task.project?.id] })
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      toast.success('Task updated successfully')
    },
    mutationFn: async ({
      id,
      data
    }: {
      data: {
        description?: string
        dueDate?: string
        priority?: Task['priority']
        status?: Task['status']
        title?: string
      }
      id: string
    }) => {
      const response = await api.put<ApiResponse<Task>>(`/tasks/${id}`, data)
      return response.data.data
    }
  })
}

export const useDeleteTask = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/tasks/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      toast.success('Task deleted successfully')
    }
  })
}

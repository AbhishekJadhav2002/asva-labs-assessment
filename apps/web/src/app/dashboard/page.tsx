'use client'

import { AlertCircle, CheckCircle, Clock, Plus, TrendingUp } from 'lucide-react'
import { useEffect, useState } from 'react'

import { Layout } from '@/components/layout/Layout'
import { ProjectCard } from '@/components/projects/ProjectCard'
import { ProjectForm } from '@/components/projects/ProjectForm'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { AuthService } from '@/lib/auth'
import { useCreateProject, useProjects } from '@/lib/queries'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const router = useRouter();

  const [showCreateModal, setShowCreateModal] = useState(false)
  const { isLoading, data: projects = [] } = useProjects()
  const createProject = useCreateProject()
  const user = AuthService.getCurrentUser()

  const stats = {
    total: projects.length,
    active: projects.filter(p => p.status === 'ACTIVE').length,
    completed: projects.filter(p => p.status === 'COMPLETED').length,
    totalTasks: projects.reduce((accumulator, p) => accumulator + p.tasks.length, 0),
    completedTasks: projects.reduce((accumulator, p) => accumulator + p.tasks.filter(t => t.status === 'DONE').length, 0)
  }

  const handleCreateProject = async (data: { description?: string | undefined; name: string }) => {
    try {
      await createProject.mutateAsync(data)
      setShowCreateModal(false)
    } catch (error) {
      console.error('Error creating project:', error)
    }
  }

  useEffect(() => {
    if (AuthService.isAuthenticated()) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  }, [router]);

  if (isLoading) {
    return (
      <Layout>
        <div className="items-center flex justify-center h-64">
          <div className="spinner" />
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name}!</h1>
            <p className="text-gray-600">Here's what's happening with your projects today.</p>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-8 w-8 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Projects</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Projects</p>
                <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertCircle className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tasks Done</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.completedTasks}/{stats.totalTasks}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Projects */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Projects</h2>
          {projects.length === 0 ? (
            <Card>
              <div className="text-center py-12">
                <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
                <p className="text-gray-600 mb-4">Get started by creating your first project.</p>
                <Button onClick={() => setShowCreateModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Project
                </Button>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.slice(0, 6).map(project => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onEdit={() => {/**/ }}
                  onDelete={() => {/**/ }}
                  canEdit={user?.role === 'ADMIN' || project.user.id === user?.id}
                />
              ))}
            </div>
          )}
        </div>

        {/* Create Project Modal */}
        <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create New Project">
          <ProjectForm
            onSubmit={data => { handleCreateProject(data) }}
            onCancel={() => setShowCreateModal(false)}
            loading={createProject.isPending}
          />
        </Modal>
      </div>
    </Layout>
  )
}

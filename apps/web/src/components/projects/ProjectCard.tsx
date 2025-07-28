import type { Project } from '@/lib/queries'

import { format } from 'date-fns'
import { Calendar, Edit, MoreVertical, Trash2, User } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

const getStatusVariant = (status: Project['status']) => {
  switch (status) {
    case 'ACTIVE': {
      return 'success'
    }
    case 'COMPLETED': {
      return 'info'
    }
    case 'ARCHIVED': {
      return 'default'
    }
    default: {
      return 'default'
    }
  }
}

interface ProjectCardProperties {
  project: Project
  canEdit: boolean
  onDelete: (id: string) => void
  onEdit: (project: Project) => void
}

export function ProjectCard({ onEdit, project, canEdit, onDelete }: ProjectCardProperties) {
  const [showMenu, setShowMenu] = useState(false)

  const taskStats = {
    total: project.tasks.length,
    done: project.tasks.filter(task => task.status === 'DONE').length,
    inProgress: project.tasks.filter(task => task.status === 'IN_PROGRESS').length
  }

  return (
    <Card className="hover:shadow-md transition-shadow relative">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <Link href={`/projects/${project.id}`} prefetch={false}>
            <h3 className="text-lg font-semibold text-gray-900 hover:text-primary-600 cursor-pointer">
              {project.name}
            </h3>
          </Link>
          {project.description && <p className="text-gray-600 mt-1 line-clamp-2">{project.description}</p>}
        </div>

        {canEdit && (
          <div className="relative">
            <Button variant="ghost" size="sm" onClick={() => setShowMenu(!showMenu)}>
              <MoreVertical className="h-4 w-4" />
            </Button>

            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border">
                <div className="py-1">
                  <button
                    onClick={() => {
                      onEdit(project)
                      setShowMenu(false)
                    }}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      onDelete(project.id)
                      setShowMenu(false)
                    }}
                    className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mb-4">
        <Badge variant={getStatusVariant(project.status)}>{project.status}</Badge>
        <div className="flex items-center text-sm text-gray-500">
          <User className="h-4 w-4 mr-1" />
          {project.user.name}
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Tasks Progress</span>
          <span className="text-gray-900 font-medium">
            {taskStats.done}/{taskStats.total}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-primary-600 h-2 rounded-full"
            style={{
              width: taskStats.total > 0 ? `${(taskStats.done / taskStats.total) * 100}%` : '0%'
            }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500">
          <span>{taskStats.inProgress} in progress</span>
          <span>{taskStats.done} completed</span>
        </div>
      </div>

      <div className="flex items-center text-xs text-gray-500">
        <Calendar className="h-3 w-3 mr-1" />
        Created {format(new Date(project.createdAt), 'MMM d, yyyy')}
      </div>
    </Card>
  )
}

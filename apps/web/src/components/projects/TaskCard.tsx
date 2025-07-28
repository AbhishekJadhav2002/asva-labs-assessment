import type { Task } from '@/lib/queries'

import { format } from 'date-fns'
import { Calendar, Edit, MoreVertical, Trash2 } from 'lucide-react'
import { useState } from 'react'

import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useDeleteTask, useUpdateTask } from '@/lib/queries'

const getStatusVariant = (status: Task['status']) => {
  switch (status) {
    case 'TODO': {
      return 'default'
    }
    case 'IN_PROGRESS': {
      return 'warning'
    }
    case 'DONE': {
      return 'success'
    }
    case 'CANCELLED': {
      return 'danger'
    }
    default: {
      return 'default'
    }
  }
}

const getPriorityVariant = (priority: Task['priority']) => {
  switch (priority) {
    case 'LOW': {
      return 'info'
    }
    case 'MEDIUM': {
      return 'default'
    }
    case 'HIGH': {
      return 'warning'
    }
    case 'URGENT': {
      return 'danger'
    }
    default: {
      return 'default'
    }
  }
}

interface TaskCardProperties {
  task: Task
  canEdit: boolean
  onEdit: (task: Task) => void
}

export function TaskCard({ task, onEdit, canEdit }: TaskCardProperties) {
  const [showMenu, setShowMenu] = useState(false)
  const updateTask = useUpdateTask()
  const deleteTask = useDeleteTask()

  const handleStatusChange = async (status: Task['status']) => {
    try {
      await updateTask.mutateAsync({
        id: task.id,
        data: { status }
      })
    } catch (error) {
      console.error('Error updating task status:', error)
    }
  }

  const handleDelete = async () => {
    if (globalThis.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask.mutateAsync(task.id)
      } catch (error) {
        console.error('Error deleting task:', error)
      }
    }
    setShowMenu(false)
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <h4 className="font-medium text-gray-900">{task.title}</h4>
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
                      onEdit(task)
                      setShowMenu(false)
                    }}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      handleDelete()
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

      {task.description && <p className="text-sm text-gray-600 mb-3 line-clamp-2">{task.description}</p>}

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Badge variant={getStatusVariant(task.status)}>{task.status.replace('_', ' ')}</Badge>
          <Badge variant={getPriorityVariant(task.priority)} size="sm">
            {task.priority}
          </Badge>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>Assigned to {task.user.name}</span>
        {task.dueDate && (
          <div className="flex items-center">
            <Calendar className="h-3 w-3 mr-1" />
            {format(new Date(task.dueDate), 'MMM d')}
          </div>
        )}
      </div>

      {canEdit && (
        <div className="mt-3 pt-3 border-t">
          <div className="flex space-x-1">
            {(['TODO', 'IN_PROGRESS', 'DONE'] as const).map(status => (
              <Button
                key={status}
                size="sm"
                variant={task.status === status ? 'primary' : 'ghost'}
                onClick={() => {
                  handleStatusChange(status)
                }}
                disabled={updateTask.isPending}
                className="text-xs"
              >
                {status.replace('_', ' ')}
              </Button>
            ))}
          </div>
        </div>
      )}
    </Card>
  )
}

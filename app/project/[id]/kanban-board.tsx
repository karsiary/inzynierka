"use client"

import { useState, useEffect } from "react"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, MoreHorizontal, Trash2 } from "lucide-react"
import { AddTaskDialog } from "./add-task-dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface Task {
  id: number
  title: string
  description: string
  status: string
  priority: string
  assignee: string
  due_date: string
  songId: string | null
  projectId: number
  phaseId: string
  assignees: Array<{ name: string; avatar?: string }>
}

interface Column {
  id: string
  title: string
  tasks: Task[]
}

interface KanbanBoardProps {
  projectId: string
  phaseId: string
  selectedSong: string | null
  isSongCompleted: boolean
  songs: any[]
}

export function KanbanBoard({ projectId, phaseId, selectedSong, isSongCompleted, songs }: KanbanBoardProps) {
  const [columns, setColumns] = useState<Record<string, Column>>({
    todo: {
      id: "todo",
      title: "Do zrobienia",
      tasks: [],
    },
    inProgress: {
      id: "inProgress",
      title: "W trakcie",
      tasks: [],
    },
    done: {
      id: "done",
      title: "Zakończone",
      tasks: [],
    },
  })
  const [error, setError] = useState<string | null>(null)
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false)
  const [currentColumn, setCurrentColumn] = useState("")
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  useEffect(() => {
    fetchTasks()
  }, [projectId, phaseId, selectedSong])

  const fetchTasks = async () => {
    try {
      const url = `/api/projects/${projectId}/phases/${phaseId}/tasks${selectedSong ? `?songId=${selectedSong}` : ''}`
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error('Błąd podczas pobierania zadań')
      }

      const tasksData = await response.json()

      const newColumns = { ...columns }
      Object.values(newColumns).forEach((column) => {
        column.tasks = []
      })

      tasksData.forEach((task: Task) => {
        if (newColumns[task.status]) {
          newColumns[task.status].tasks.push(task)
        }
      })

      setColumns(newColumns)
      setError(null)
      setEditingTask(null)
    } catch (error) {
      console.error("Error fetching tasks:", error)
      setError("Nie udało się załadować zadań. Spróbuj odświeżyć stronę.")
    }
  }

  const onDragEnd = async (result: any) => {
    const { destination, source, draggableId } = result

    if (!destination) return

    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return
    }

    setColumns((prevColumns) => {
      const newColumns = { ...prevColumns }
      const sourceColumn = newColumns[source.droppableId]
      const destColumn = newColumns[destination.droppableId]
      const draggedTask = sourceColumn.tasks[source.index]

      sourceColumn.tasks.splice(source.index, 1)
      destColumn.tasks.splice(destination.index, 0, { ...draggedTask, status: destination.droppableId })

      return newColumns
    })

    try {
      const response = await fetch(`/api/tasks/${draggableId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: destination.droppableId }),
      })

      if (!response.ok) {
        throw new Error('Błąd podczas aktualizacji statusu zadania')
      }
    } catch (error) {
      console.error("Error updating task status:", error)
      setError("Nie udało się zaktualizować statusu zadania. Spróbuj ponownie.")
      fetchTasks()
    }
  }

  const deleteTask = async (taskId: number) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Błąd podczas usuwania zadania')
      }

      fetchTasks()
    } catch (error) {
      console.error("Error deleting task:", error)
      setError("Nie udało się usunąć zadania. Spróbuj ponownie.")
    }
  }

  const handleAddTask = (columnId: string) => {
    setCurrentColumn(columnId)
    setIsAddTaskOpen(true)
  }

  if (error) {
    return <div className="text-red-500 text-center py-4">{error}</div>
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Object.values(columns).map((column) => (
          <div key={column.id} className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[#fffcf2] font-montserrat">{column.title}</h3>
              {!isSongCompleted && (
                <Button variant="ghost" size="icon" className="text-[#ccc5b9]" onClick={() => handleAddTask(column.id)}>
                  <Plus className="w-4 h-4" />
                </Button>
              )}
            </div>

            <Droppable droppableId={column.id}>
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="h-[calc(100vh-400px)] overflow-y-auto bg-gradient-to-b from-[#252422] to-[#2a2826] rounded-xl p-6 space-y-4 scrollbar-hide border border-[#eb5e28]/30 shadow-lg shadow-[#eb5e28]/5 transition-all duration-300 hover:shadow-xl hover:shadow-[#eb5e28]/10"
                >
                  {column.tasks.map((task, index) => (
                    <Draggable key={task.id} draggableId={task.id.toString()} index={index}>
                      {(provided) => (
                        <Card
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="bg-[#403d39] border-none p-4 cursor-pointer hover:bg-[#403d39]/80 transition-colors"
                          onClick={() => setEditingTask(task)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="space-y-2">
                              <h4 className="text-[#fffcf2] font-semibold font-montserrat text-lg">{task.title}</h4>
                              <div className="flex items-center space-x-2">
                                <span className="text-xs text-[#ccc5b9] font-open-sans">
                                  Termin: {new Date(task.due_date).toLocaleDateString()}
                                </span>
                                <span
                                  className={`px-2 py-1 rounded-full text-xs ${
                                    task.priority === "Wysoki"
                                      ? "bg-red-500/10 text-red-500"
                                      : task.priority === "Średni"
                                        ? "bg-yellow-500/10 text-yellow-500"
                                        : "bg-green-500/10 text-green-500"
                                  }`}
                                >
                                  {task.priority}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="flex -space-x-2">
                                {task.assignees?.map((assignee, index) => (
                                  <Avatar key={index} className="w-6 h-6 border-2 border-[#403d39]">
                                    <AvatarFallback className="bg-[#eb5e28] text-[#fffcf2] text-xs">
                                      {assignee.name.slice(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                ))}
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="text-[#ccc5b9] h-6 w-6">
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56 bg-[#252422] border-[#403d39]">
                                  <DropdownMenuItem
                                    onClick={() => deleteTask(task.id)}
                                    className="text-red-500 focus:text-red-500 focus:bg-red-500/10"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    <span>Usuń zadanie</span>
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </Card>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
      <AddTaskDialog
        open={isAddTaskOpen || editingTask !== null}
        onOpenChange={(open) => {
          setIsAddTaskOpen(open)
          if (!open) setEditingTask(null)
        }}
        projectId={projectId}
        phaseId={phaseId}
        onTaskAdded={fetchTasks}
        currentColumn={currentColumn}
        taskToEdit={editingTask}
        selectedSong={selectedSong}
        songs={songs}
      />
      <style jsx>{`
        .scrollbar-hide {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </DragDropContext>
  )
}


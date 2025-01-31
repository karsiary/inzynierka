"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, MoreHorizontal, Trash2, Music2, MessageSquare, CheckSquare, Settings } from "lucide-react"
import { AddTaskDialog } from "./add-task-dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import dynamic from "next/dynamic"
import Link from "next/link"

const DragDropContext = dynamic(
  () => import("@hello-pangea/dnd").then(mod => mod.DragDropContext),
  { ssr: false }
)

const Droppable = dynamic(
  () => import("@hello-pangea/dnd").then(mod => mod.Droppable),
  { ssr: false }
)

const Draggable = dynamic(
  () => import("@hello-pangea/dnd").then(mod => mod.Draggable),
  { ssr: false }
)

interface Task {
  id: number
  title: string
  description: string
  status: 'todo' | 'inProgress' | 'done'
  priority: string
  assignee: string
  start_date: string | null
  end_date: string | null
  due_date: string
 | null
  song_id: number | null
  project_id: number
  phase_id: string
  assignees: Array<{ name: string; avatar?: string }>
  responsible?: {
    id: string
    name: string
    image?: string
  }
  commentsCount: number
  checklistStats: {
    total: number
    completed: number
  }
}

interface Column {
  id: 'todo' | 'inProgress' | 'done'
  title: string
  tasks: Task[]
}

interface ColumnType {
  todo: Column;
  inProgress: Column;
  done: Column;
}

interface KanbanBoardProps {
  projectId: string
  phaseId: string
  selectedSong: string | null
  completedSongs: Record<string, boolean>
  songs: any[]
}

export function KanbanBoard({ projectId, phaseId, selectedSong, completedSongs, songs }: KanbanBoardProps) {
  const [mounted, setMounted] = useState(false)
  const [columns, setColumns] = useState<ColumnType>({
    todo: {
      id: 'todo',
      title: "Do zrobienia",
      tasks: [] as Task[],
    },
    inProgress: {
      id: 'inProgress',
      title: "W trakcie",
      tasks: [] as Task[],
    },
    done: {
      id: 'done',
      title: "Zakończone",
      tasks: [] as Task[],
    },
  })
  const [error, setError] = useState<string | null>(null)
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false)
  const [currentColumn, setCurrentColumn] = useState("")
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      console.log("Aktualne propsy:", { projectId, phaseId, selectedSong, songs })
      fetchTasks()
    }
  }, [projectId, phaseId, selectedSong, mounted])

  const fetchTasks = async () => {
    try {
      const url = `/api/projects/${projectId}/phases/${phaseId}/tasks${selectedSong ? `?songId=${selectedSong}` : ''}`
      console.log("Pobieranie zadań z URL:", url)
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error('Błąd podczas pobierania zadań')
      }

      const tasksData = await response.json()
      console.log("Pobrane zadania:", tasksData)

      // Tworzymy nowy obiekt kolumn
      const newColumns: ColumnType = {
        todo: {
          id: 'todo',
          title: "Do zrobienia",
          tasks: [],
        },
        inProgress: {
          id: 'inProgress',
          title: "W trakcie",
          tasks: [],
        },
        done: {
          id: 'done',
          title: "Zakończone",
          tasks: [],
        },
      }

      // Grupujemy zadania po statusie, zapobiegając duplikatom
      const processedTaskIds = new Set()
      tasksData.forEach((task: Task) => {
        console.log("Przetwarzanie zadania:", task)
        if (!processedTaskIds.has(task.id) && task.status in newColumns) {
          newColumns[task.status as keyof ColumnType].tasks.push(task)
          processedTaskIds.add(task.id)
        }
      })

      console.log("Nowe kolumny:", newColumns)
      setColumns(newColumns)
      setError(null)
      setEditingTask(null)
    } catch (error) {
      console.error("Error fetching tasks:", error)
      setError("Nie udało się załadować zadań. Spróbuj odświeżyć stronę.")
    }
  }

  const onDragEnd = async (result: any) => {
    const { destination, source, draggableId } = result;
    console.log('Drag result:', result);

    if (!destination) return;

    if (
        destination.droppableId === source.droppableId &&
        destination.index === source.index
    ) {
        return;
    }

    const sourceColumn = columns[source.droppableId as keyof ColumnType];
    const destColumn = columns[destination.droppableId as keyof ColumnType];
    
    // Tworzymy kopie list zadań
    const sourceTasks = Array.from(sourceColumn.tasks);
    const destTasks = Array.from(destColumn.tasks);
    
    // Usuwamy zadanie ze źródłowej kolumny
    const [movedTask] = sourceTasks.splice(source.index, 1) as [Task];
    
    // Jeśli przenosimy w tej samej kolumnie
    if (source.droppableId === destination.droppableId) {
        sourceTasks.splice(destination.index, 0, movedTask);
        
        const newColumns = {
            ...columns,
            [source.droppableId]: {
                ...sourceColumn,
                tasks: sourceTasks,
            },
        } as ColumnType;
        
        setColumns(newColumns);
    } else {
        // Sprawdzamy, czy zadanie już istnieje w kolumnie docelowej
        const taskExists = destTasks.some(task => task.id === movedTask.id);
        if (taskExists) {
            console.log('Task already exists in destination column');
            return;
        }

        // Aktualizujemy status zadania
        const updatedTask = { ...movedTask, status: destination.droppableId };
        destTasks.splice(destination.index, 0, updatedTask);
        
        const newColumns = {
            ...columns,
            [source.droppableId]: {
                ...sourceColumn,
                tasks: sourceTasks,
            },
            [destination.droppableId]: {
                ...destColumn,
                tasks: destTasks,
            },
        } as ColumnType;
        
        setColumns(newColumns);
        
        try {
            const response = await fetch(`/api/tasks/${draggableId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...movedTask,
                    status: destination.droppableId,
                    // Ensure we send all task data including dates
                    start_date: movedTask.start_date,
                    due_date: movedTask.due_date,
                    end_date: movedTask.end_date
                }),
            });

            if (!response.ok) {
                throw new Error('Błąd podczas aktualizacji statusu zadania');
            }
        } catch (error) {
            console.error("Error updating task status:", error);
            setError("Nie udało się zaktualizować statusu zadania. Spróbuj ponownie.");
            
            // Przywracamy poprzedni stan w przypadku błędu
            setColumns({
                ...columns,
                [source.droppableId]: sourceColumn,
                [destination.droppableId]: destColumn,
            } as ColumnType);
        }
    }
  };

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

  const isTaskFromCompletedSong = (task: Task) => {
    return task.song_id && completedSongs[task.song_id.toString()]
  }

  if (!mounted) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Object.values(columns).map((column) => (
          <div key={column.id} className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[#fffcf2] font-montserrat">{column.title}</h3>
            </div>
            <div className="h-[calc(100vh-400px)] overflow-y-auto bg-gradient-to-b from-[#252422] to-[#2a2826] rounded-xl p-6 space-y-4 scrollbar-hide border border-[#eb5e28]/30">
              <div className="animate-pulse bg-[#403d39] h-24 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return <div className="text-red-500 text-center py-4">{error}</div>
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Object.values(columns).map((column) => (
          <div key={column.id} className="flex flex-col h-[calc(100vh-400px)]">
            <div className="flex items-center justify-between mb-4 flex-shrink-0">
              <h3 className="text-lg font-semibold text-[#fffcf2] font-montserrat">{column.title}</h3>
              <div className="flex items-center gap-2">
                {(selectedSong === "all" || !completedSongs[selectedSong]) && (
                  <Button variant="ghost" size="icon" className="text-[#ccc5b9]" onClick={() => handleAddTask(column.id)}>
                    <Plus className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>

            <Droppable
              droppableId={column.id}
              isDropDisabled={selectedSong !== "all" ? completedSongs[selectedSong] : false}
            >
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="flex-1 bg-gradient-to-b from-[#252422] to-[#2a2826] rounded-xl p-6 border border-[#eb5e28]/30 shadow-lg shadow-[#eb5e28]/5 transition-all duration-300 hover:shadow-xl hover:shadow-[#eb5e28]/10"
                  style={{ overflowY: 'auto', minHeight: '100px' }}
                >
                  {console.log("Renderowanie zadań dla kolumny:", column.id, column.tasks)}
                  {column.tasks.map((task: Task, index: number) => {
                    console.log("Renderowanie zadania:", task);
                    return (
                      <Draggable
                        key={task.id}
                        draggableId={task.id.toString()}
                        index={index}
                        isDragDisabled={isTaskFromCompletedSong(task)}
                      >
                        {(provided, snapshot) => (
                          <Card
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`bg-[#403d39] border-none p-4 cursor-move hover:bg-[#403d39]/90 transition-colors mb-4 
                              select-none
                              -webkit-user-select: none
                              -moz-user-select: none
                              -ms-user-select: none
                              ${
  
                              snapshot.isDragging ? 'shadow-lg ring-2 ring-[#eb5e28]/50' : ''
                            }`}
                            onClick={() => setEditingTask(task)}
                          >
                            <div className="flex flex-col space-y-2">
                              {/* Górny rząd */}
                              <div className="flex items-center justify-between mb-1">
                                <span
                                  className={`inline-flex items-center px-2 pt-[0.4rem] pb-1 text-xs font-medium rounded-sm ${
                                    task.priority === "Wysoki"
                                      ? "bg-red-500/20 text-red-500"
                                      : task.priority === "Średni"
                                        ? "bg-yellow-500/20 text-yellow-500"
                                        : "bg-green-500/20 text-green-500"
                                  }`}
                                >
                                  {task.priority}
                                </span>
                                {task.song_id && (
                                  <div className="flex items-center gap-1.5">
                                    <Music2 className="w-3.5 h-3.5 text-[#ccc5b9]" />
                                    <span className="text-xs text-[#ccc5b9] font-medium truncate max-w-[120px]">
                                      {songs.find(s => s.id === task.song_id)?.title || 'Nieznana'}
                                    </span>
                                  </div>
                                )}
                              </div>

                              {/* Tytuł zadania */}
                              <h4 className="text-[#fffcf2] font-semibold text-sm leading-tight">
                                {task.title}
                              </h4>

                              {/* Data */}
                              <div className="flex items-center">
                                <span className="text-xs text-[#ccc5b9]">
                                  {task.due_date ? new Date(task.due_date).toLocaleDateString('pl-PL', {
 day: 'numeric', month: 'short' }) : ''}
                                </span>
                              </div>

                              {/* Dolny rząd */}
                              <div className="flex items-center justify-between pt-6
                              ">
                                {/* Avatar i osoba odpowiedzialna */}
                                <div className="flex items-center gap-2">
                                  {task.responsible && (
                                    <div className="flex items-center gap-1.5">
                                      <div className="h-6 w-6 rounded-full bg-orange-500 flex items-center justify-center">
                                        <span className="text-xs font-medium text-white inline-flex items-center justify-center leading-none mt-0.5">
                                          {task.responsible.name.split(" ").map(n => n[0]).join("").toLowerCase()}
                                        </span>
                                      </div>
                                      <span className="text-xs text-[#ccc5b9]">
                                        {task.responsible.name}
                                      </span>
                                    </div>
                                  )}
                                </div>

                                {/* Liczniki w prawym dolnym rogu */}
                                <div className="flex items-center gap-3 ml-auto">
                                  <div className="flex items-center gap-1">
                                    <MessageSquare className="w-4 h-4 text-[#ccc5b9]" />
                                    <span className="text-xs text-[#ccc5b9]">{task.commentsCount || 0}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <CheckSquare className="w-4 h-4 text-[#ccc5b9]" />
                                    <span className="text-xs text-[#ccc5b9]">
                                      {task.checklistStats ? `${task.checklistStats.completed}/${task.checklistStats.total}` : '0/0'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </Card>
                        )}
                      </Draggable>
                    );
                  })}
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
      <div className="absolute top-4 right-4">
        <Link href={`/project/${projectId}/settings`} className="text-[#ccc5b9] hover:text-[#eb5e28] transition-colors mr-6">
          <Settings className="w-5 h-5" />
        </Link>
      </div>
      <style jsx>{`
        /* Prevent text selection during drag */
        [data-rbd-draggable-context-id] {
          user-select: none !important;
          -webkit-user-select: none !important;
          -moz-user-select: none !important;
          -ms-user-select: none !important;
          -webkit-tap-highlight-color: transparent;
        }

        .scrollbar-hide {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        
        /* Apply no-select to all draggable content */
        [data-rbd-drag-handle-draggable-id] * {
          pointer-events: none;
          user-select: none !important;
        }
      `}</style>
    </DragDropContext>
  )
}


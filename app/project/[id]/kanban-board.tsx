"use client"

import { useState, useEffect } from "react"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, MoreHorizontal, Trash2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { AddTaskDialog } from "./add-task-dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface Task {
  id: string
  title: string
  description: string
  status: string
  priority: string
  assignee: string
  due_date: string
  song_id: string
  project_id: string
  phase_id: string
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
  isSongCompleted: boolean // Add this line
}

// Sample tasks data
const sampleTasks = [
  // Letnia przygoda
  {
    id: "1",
    title: "Nagranie wokalu głównego",
    description: "Nagranie głównej ścieżki wokalnej dla utworu 'Letnia przygoda'",
    status: "done",
    priority: "Wysoki",
    assignee: "Anna Nowak",
    due_date: "2024-02-01",
    song_id: "1",
    project_id: "test2",
    phase_id: "1",
    assignees: [
      { name: "Anna Nowak", avatar: "/placeholder.svg?height=32&width=32" },
      { name: "Jan Kowalski", avatar: "/placeholder.svg?height=32&width=32" },
    ],
  },
  {
    id: "2",
    title: "Aranżacja instrumentów",
    description: "Przygotowanie aranżacji instrumentalnej dla 'Letnia przygoda'",
    status: "inProgress",
    priority: "Średni",
    assignee: "Piotr Wiśniewski",
    due_date: "2024-02-05",
    song_id: "1",
    project_id: "test2",
    phase_id: "1",
    assignees: [
      { name: "Piotr Wiśniewski", avatar: "/placeholder.svg?height=32&width=32" },
      { name: "Jan Kowalski", avatar: "/placeholder.svg?height=32&width=32" },
    ],
  },
  {
    id: "3",
    title: "Mix wstępny",
    description: "Wstępne zmiksowanie ścieżek 'Letnia przygoda'",
    status: "todo",
    priority: "Niski",
    assignee: "Jan Kowalski",
    due_date: "2024-02-10",
    song_id: "1",
    project_id: "test2",
    phase_id: "2",
    assignees: [
      { name: "Jan Kowalski", avatar: "/placeholder.svg?height=32&width=32" },
      { name: "Anna Nowak", avatar: "/placeholder.svg?height=32&width=32" },
    ],
  },
  {
    id: "4",
    title: "Dodanie efektów przestrzennych",
    description: "Dodanie pogłosu i delaya do wokalu w 'Letnia przygoda'",
    status: "todo",
    priority: "Średni",
    assignee: "Anna Nowak",
    due_date: "2024-02-12",
    song_id: "1",
    project_id: "test2",
    phase_id: "3",
    assignees: [
      { name: "Anna Nowak", avatar: "/placeholder.svg?height=32&width=32" },
      { name: "Piotr Wiśniewski", avatar: "/placeholder.svg?height=32&width=32" },
    ],
  },

  // Zimowy sen
  {
    id: "5",
    title: "Nagranie partii fortepianu",
    description: "Nagranie głównego motywu fortepianowego dla 'Zimowy sen'",
    status: "done",
    priority: "Wysoki",
    assignee: "Piotr Wiśniewski",
    due_date: "2024-02-03",
    song_id: "2",
    project_id: "test2",
    phase_id: "1",
    assignees: [{ name: "Piotr Wiśniewski", avatar: "/placeholder.svg?height=32&width=32" }],
  },
  {
    id: "6",
    title: "Edycja perkusji",
    description: "Edycja i kwantyzacja ścieżki perkusyjnej w 'Zimowy sen'",
    status: "inProgress",
    priority: "Średni",
    assignee: "Jan Kowalski",
    due_date: "2024-02-07",
    song_id: "2",
    project_id: "test2",
    phase_id: "2",
    assignees: [
      { name: "Jan Kowalski", avatar: "/placeholder.svg?height=32&width=32" },
      { name: "Anna Nowak", avatar: "/placeholder.svg?height=32&width=32" },
    ],
  },
  {
    id: "7",
    title: "Nagranie chórków",
    description: "Nagranie partii chóralnych do 'Zimowy sen'",
    status: "todo",
    priority: "Niski",
    assignee: "Anna Nowak",
    due_date: "2024-02-09",
    song_id: "2",
    project_id: "test2",
    phase_id: "2",
    assignees: [{ name: "Anna Nowak", avatar: "/placeholder.svg?height=32&width=32" }],
  },
  {
    id: "8",
    title: "Mastering",
    description: "Finalne dostrojenie i mastering 'Zimowy sen'",
    status: "todo",
    priority: "Wysoki",
    assignee: "Jan Kowalski",
    due_date: "2024-02-15",
    song_id: "2",
    project_id: "test2",
    phase_id: "4",
    assignees: [
      { name: "Jan Kowalski", avatar: "/placeholder.svg?height=32&width=32" },
      { name: "Piotr Wiśniewski", avatar: "/placeholder.svg?height=32&width=32" },
    ],
  },

  // Jesienny blues
  {
    id: "9",
    title: "Nagranie gitary basowej",
    description: "Nagranie linii basu dla 'Jesienny blues'",
    status: "done",
    priority: "Średni",
    assignee: "Piotr Wiśniewski",
    due_date: "2024-02-02",
    song_id: "3",
    project_id: "test2",
    phase_id: "1",
    assignees: [{ name: "Piotr Wiśniewski", avatar: "/placeholder.svg?height=32&width=32" }],
  },
  {
    id: "10",
    title: "Dodanie efektów gitarowych",
    description: "Dodanie efektów do ścieżek gitarowych w 'Jesienny blues'",
    status: "inProgress",
    priority: "Niski",
    assignee: "Jan Kowalski",
    due_date: "2024-02-08",
    song_id: "3",
    project_id: "test2",
    phase_id: "2",
    assignees: [{ name: "Jan Kowalski", avatar: "/placeholder.svg?height=32&width=32" }],
  },
  {
    id: "11",
    title: "Nagranie harmonijki",
    description: "Nagranie partii harmonijki do 'Jesienny blues'",
    status: "todo",
    priority: "Wysoki",
    assignee: "Anna Nowak",
    due_date: "2024-02-11",
    song_id: "3",
    project_id: "test2",
    phase_id: "2",
    assignees: [{ name: "Anna Nowak", avatar: "/placeholder.svg?height=32&width=32" }],
  },
  {
    id: "12",
    title: "Finalna korekcja EQ",
    description: "Końcowa korekcja equalizacji dla 'Jesienny blues'",
    status: "todo",
    priority: "Średni",
    assignee: "Jan Kowalski",
    due_date: "2024-02-14",
    song_id: "3",
    project_id: "test2",
    phase_id: "3",
    assignees: [
      { name: "Jan Kowalski", avatar: "/placeholder.svg?height=32&width=32" },
      { name: "Anna Nowak", avatar: "/placeholder.svg?height=32&width=32" },
    ],
  },

  // Wiosenny powiew
  {
    id: "13",
    title: "Kompozycja melodii",
    description: "Stworzenie głównej melodii dla 'Wiosenny powiew'",
    status: "done",
    priority: "Wysoki",
    assignee: "Piotr Wiśniewski",
    due_date: "2024-02-01",
    song_id: "4",
    project_id: "test2",
    phase_id: "1",
    assignees: [{ name: "Piotr Wiśniewski", avatar: "/placeholder.svg?height=32&width=32" }],
  },
  {
    id: "14",
    title: "Nagranie skrzypiec",
    description: "Nagranie partii skrzypcowej do 'Wiosenny powiew'",
    status: "inProgress",
    priority: "Średni",
    assignee: "Anna Nowak",
    due_date: "2024-02-06",
    song_id: "4",
    project_id: "test2",
    phase_id: "2",
    assignees: [{ name: "Anna Nowak", avatar: "/placeholder.svg?height=32&width=32" }],
  },
  {
    id: "15",
    title: "Dodanie syntezatorów",
    description: "Dodanie ścieżek syntezatorowych do 'Wiosenny powiew'",
    status: "todo",
    priority: "Niski",
    assignee: "Jan Kowalski",
    due_date: "2024-02-09",
    song_id: "4",
    project_id: "test2",
    phase_id: "2",
    assignees: [{ name: "Jan Kowalski", avatar: "/placeholder.svg?height=32&width=32" }],
  },
  {
    id: "16",
    title: "Automatyzacja głośności",
    description: "Ustawienie automatyzacji głośności dla 'Wiosenny powiew'",
    status: "todo",
    priority: "Średni",
    assignee: "Piotr Wiśniewski",
    due_date: "2024-02-13",
    song_id: "4",
    project_id: "test2",
    phase_id: "3",
    assignees: [
      { name: "Piotr Wiśniewski", avatar: "/placeholder.svg?height=32&width=32" },
      { name: "Anna Nowak", avatar: "/placeholder.svg?height=32&width=32" },
    ],
  },
  {
    id: "lp1",
    title: "Nagranie wokalu głównego",
    description: "Sesja nagraniowa głównej ścieżki wokalnej dla 'Letnia przygoda'",
    status: "done",
    priority: "Wysoki",
    assignee: "Anna Nowak",
    due_date: "2024-02-05",
    song_id: "1",
    project_id: "test2",
    phase_id: "1",
    assignees: [
      { name: "Anna Nowak", avatar: "/placeholder.svg?height=32&width=32" },
      { name: "Jan Kowalski", avatar: "/placeholder.svg?height=32&width=32" },
    ],
  },
  {
    id: "lp2",
    title: "Aranżacja instrumentów",
    description: "Przygotowanie aranżacji instrumentalnej dla 'Letnia przygoda'",
    status: "inProgress",
    priority: "Średni",
    assignee: "Piotr Wiśniewski",
    due_date: "2024-02-10",
    song_id: "1",
    project_id: "test2",
    phase_id: "1",
    assignees: [{ name: "Piotr Wiśniewski", avatar: "/placeholder.svg?height=32&width=32" }],
  },
  {
    id: "lp3",
    title: "Nagranie gitary akustycznej",
    description: "Sesja nagraniowa gitary akustycznej dla 'Letnia przygoda'",
    status: "todo",
    priority: "Niski",
    assignee: "Jan Kowalski",
    due_date: "2024-02-15",
    song_id: "1",
    project_id: "test2",
    phase_id: "1",
    assignees: [{ name: "Jan Kowalski", avatar: "/placeholder.svg?height=32&width=32" }],
  },
  {
    id: "lp4",
    title: "Mix wstępny",
    description: "Przygotowanie wstępnego miksu dla 'Letnia przygoda'",
    status: "todo",
    priority: "Średni",
    assignee: "Anna Nowak",
    due_date: "2024-02-20",
    song_id: "1",
    project_id: "test2",
    phase_id: "2",
    assignees: [
      { name: "Anna Nowak", avatar: "/placeholder.svg?height=32&width=32" },
      { name: "Piotr Wiśniewski", avatar: "/placeholder.svg?height=32&width=32" },
    ],
  },
  {
    id: "lp5",
    title: "Dodanie efektów wokalnych",
    description: "Dodanie efektów do ścieżki wokalnej w 'Letnia przygoda'",
    status: "todo",
    priority: "Niski",
    assignee: "Piotr Wiśniewski",
    due_date: "2024-02-25",
    song_id: "1",
    project_id: "test2",
    phase_id: "2",
    assignees: [{ name: "Piotr Wiśniewski", avatar: "/placeholder.svg?height=32&width=32" }],
  },
]

export function KanbanBoard({ projectId, phaseId, selectedSong, isSongCompleted }: KanbanBoardProps) {
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

  const fetchTasks = async (newTask?: Task) => {
    try {
      let tasksData: Task[]
      if (newTask) {
        tasksData = [...Object.values(columns).flatMap((col) => col.tasks), newTask]
      } else {
        // Try to fetch from Supabase first
        const query = supabase.from("tasks").select("*").eq("project_id", projectId).eq("phase_id", phaseId)

        const { data, error } = await query

        // If there's an error or no data from Supabase, use sample data
        if (error || data.length === 0) {
          console.log("Using sample tasks data")
          tasksData = sampleTasks.filter(
            (task) =>
              task.project_id === projectId &&
              task.phase_id === phaseId &&
              (selectedSong === "all" || task.song_id === selectedSong),
          )
        } else {
          // Map the data to include song_id if it doesn't exist
          tasksData = data.map((task) => ({
            ...task,
            song_id: task.song_id || "all", // Provide a default value if song_id doesn't exist
            assignees: task.assignees || [], // Provide a default value if assignees doesn't exist
          }))

          // Filter by selected song if needed
          if (selectedSong && selectedSong !== "all") {
            tasksData = tasksData.filter((task) => task.song_id === selectedSong)
          }
        }
      }

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
      await supabase.from("tasks").update({ status: destination.droppableId }).eq("id", draggableId)
    } catch (error) {
      console.error("Error updating task status:", error)
      setError("Nie udało się zaktualizować statusu zadania. Spróbuj ponownie.")
      fetchTasks()
    }
  }

  const deleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase.from("tasks").delete().eq("id", taskId)
      if (error) throw error
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
                    <Draggable key={task.id} draggableId={task.id} index={index}>
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
        songs={[
          { id: "1", title: "Letnia przygoda" },
          { id: "2", title: "Zimowy sen" },
          { id: "3", title: "Jesienny blues" },
          { id: "4", title: "Wiosenny powiew" },
        ]}
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


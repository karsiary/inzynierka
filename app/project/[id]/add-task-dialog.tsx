"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { NewTaskForm, EditTaskForm } from "@/components/TaskForm"
import type { Song } from "@prisma/client"

interface AddTaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId: string
  phaseId: string
  onTaskAdded: () => void
  taskToEdit?: any
  currentColumn: string
  selectedSong: string | null
  songs: Song[]
}

export function AddTaskDialog({
  open,
  onOpenChange,
  projectId,
  phaseId,
  onTaskAdded,
  taskToEdit,
  currentColumn,
  selectedSong,
  songs,
}: AddTaskDialogProps) {
  const [error, setError] = useState<string | null>(null)
  
  console.log("AddTaskDialog - otrzymane piosenki:", songs)
  console.log("AddTaskDialog - wybrany song:", selectedSong)

  const handleSubmit = async (taskData: any) => {
    setError(null)

    try {
      const songId = taskData.song_id || selectedSong
      const newTask = {
        ...taskData,
        project_id: parseInt(projectId),
        phase_id: phaseId,
        status: taskToEdit ? taskToEdit.status : currentColumn,
        song_id: songId === 'all' ? null : parseInt(songId),
        start_date: taskData.start_date || null,
        end_date: taskData.end_date || null,
        due_date: taskData.due_date || null,
        // Only include budget fields if they have values
        ...(taskData.planned_budget ? { planned_budget: parseFloat(taskData.planned_budget) } : {}),
        ...(taskData.actual_budget ? { actual_budget: parseFloat(taskData.actual_budget) } : {}),
      }

      console.log("Dane zadania do wysłania:", newTask)

      if (taskToEdit) {
        const response = await fetch(`/api/tasks/${taskToEdit.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newTask),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Błąd podczas aktualizacji zadania')
        }
      } else {
        const response = await fetch('/api/tasks', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newTask),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Błąd podczas tworzenia zadania')
        }
      }

      onTaskAdded()
      onOpenChange(false)
    } catch (error) {
      console.error("Error:", error)
      setError(error.message)
    }
  }

  const handleDelete = async () => {
    if (!taskToEdit?.id) return

    try {
      const response = await fetch(`/api/tasks/${taskToEdit.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Błąd podczas usuwania zadania')
      }

      onTaskAdded()
      onOpenChange(false)
    } catch (error) {
      console.error("Error deleting task:", error)
      setError("Wystąpił błąd podczas usuwania zadania")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#252422] border-[#403d39] text-[#fffcf2] max-w-4xl max-h-[90vh] overflow-hidden p-6">
        <DialogHeader>
          <DialogTitle className="text-2xl font-montserrat">
            {taskToEdit ? "Edytuj zadanie" : "Nowe zadanie"}
          </DialogTitle>
          <DialogDescription className="text-[#ccc5b9] font-open-sans">
            {taskToEdit ? "Zmodyfikuj szczegóły zadania poniżej" : "Wypełnij formularz, aby dodać nowe zadanie"}
          </DialogDescription>
        </DialogHeader>

        {taskToEdit ? (
          <EditTaskForm
            taskToEdit={taskToEdit}
            onSubmit={handleSubmit}
            onDelete={handleDelete}
            selectedSong={selectedSong}
            songs={songs}
            projectId={projectId}
            phaseId={phaseId}
          />
        ) : (
          <NewTaskForm
            onSubmit={handleSubmit}
            selectedSong={selectedSong}
            songs={songs}
            projectId={projectId}
            phaseId={phaseId}
            defaultStatus={currentColumn}
          />
        )}

        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </DialogContent>
    </Dialog>
  )
}


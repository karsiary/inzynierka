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
  onTaskAdded: (task: any) => void
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

  const handleSubmit = async (values: any) => {
    try {
      const endpoint = taskToEdit ? `/api/tasks/${taskToEdit.id}` : '/api/tasks'
      const method = taskToEdit ? 'PUT' : 'POST'

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...values,
          project_id: projectId,
          phase_id: phaseId,
          song_id: taskToEdit ? values.song_id : (selectedSong === 'all' ? null : selectedSong),
        }),
      })

      if (!response.ok) {
        throw new Error('Błąd podczas zapisywania zadania')
      }

      const data = await response.json()
      if (data.shouldRefreshStats) {
        window.dispatchEvent(new Event('taskUpdated'))
      }

      onOpenChange(false)
      if (onTaskAdded) {
        onTaskAdded()
      }
    } catch (error) {
      console.error('Error saving task:', error)
      setError('Wystąpił błąd podczas zapisywania zadania')
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
            songs={songs.filter(song => song.status !== 'completed')}
            projectId={projectId}
            phaseId={phaseId}
          />
        ) : (
          <NewTaskForm
            onSubmit={handleSubmit}
            selectedSong={selectedSong}
            songs={songs.filter(song => song.status !== 'completed')}
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

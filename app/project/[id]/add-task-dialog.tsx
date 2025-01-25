"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { TaskForm } from "@/components/TaskForm"
import { supabase } from "@/lib/supabase"
import type { Song } from "@/types/supabase"

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

  const handleSubmit = async (taskData: any) => {
    setError(null)

    try {
      const newTask = {
        ...taskData,
        project_id: projectId,
        phase_id: phaseId,
        status: taskToEdit ? taskToEdit.status : currentColumn,
        song_id: taskData.song_id || selectedSong,
        // Only include budget fields if they have values
        ...(taskData.planned_budget ? { planned_budget: taskData.planned_budget } : {}),
        ...(taskData.actual_budget ? { actual_budget: taskData.actual_budget } : {}),
      }

      if (taskToEdit) {
        const { error: updateError } = await supabase.from("tasks").update(newTask).eq("id", taskToEdit.id)

        if (updateError) throw updateError
      } else {
        const { error: insertError } = await supabase.from("tasks").insert([newTask])

        if (insertError) throw insertError
      }

      onTaskAdded()
      onOpenChange(false)
    } catch (error) {
      console.error("Error saving task:", error)
      setError("Wystąpił błąd podczas zapisywania zadania")
    }
  }

  const handleDelete = async () => {
    if (!taskToEdit?.id) return

    try {
      const { error } = await supabase.from("tasks").delete().eq("id", taskToEdit.id)

      if (error) throw error

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

        <TaskForm
          taskToEdit={taskToEdit}
          onSubmit={handleSubmit}
          onDelete={taskToEdit ? handleDelete : undefined}
          selectedSong={selectedSong}
          songs={songs}
        />

        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </DialogContent>
    </Dialog>
  )
}


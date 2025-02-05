"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { TaskForm } from "@/components/TaskForm"
import { useSession } from "next-auth/react"

interface AddEventDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onTaskAdded: (task: any) => void
}

export function AddEventDialog({ open, onOpenChange, onTaskAdded }: AddEventDialogProps) {
  const { data: session } = useSession()
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (taskData: any) => {
    setError(null)

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...taskData,
          created_by: session?.user?.id,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Błąd podczas tworzenia zadania')
      }

      const createdTask = await response.json()
      onTaskAdded(createdTask)
      onOpenChange(false)
    } catch (error) {
      console.error("Error:", error)
      setError(error.message)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#252422] border-[#403d39] text-[#fffcf2] max-w-4xl max-h-[90vh] overflow-hidden p-6">
        <DialogHeader>
          <DialogTitle className="text-2xl font-montserrat">
            Nowe wydarzenie
          </DialogTitle>
          <DialogDescription className="text-[#ccc5b9] font-open-sans">
            Wypełnij formularz, aby dodać nowe wydarzenie do kalendarza
          </DialogDescription>
        </DialogHeader>

        <TaskForm
          onSubmit={handleSubmit}
          selectedSong={null}
          songs={[]}
          projectId=""
          phaseId=""
          isCalendarEvent={true}
        />

        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </DialogContent>
    </Dialog>
  )
}


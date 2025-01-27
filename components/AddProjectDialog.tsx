"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ProjectForm } from "./ProjectForm"

interface AddProjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onProjectAdded: () => void
}

export function AddProjectDialog({ open, onOpenChange, onProjectAdded }: AddProjectDialogProps) {
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (projectData: any) => {
    setError(null)

    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(projectData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Wystąpił błąd podczas dodawania projektu")
      }

      const data = await response.json()
      if (!data) {
        throw new Error("Brak danych zwróconych po utworzeniu projektu")
      }

      onProjectAdded()
      onOpenChange(false)
    } catch (error) {
      console.error("Error adding project:", error)
      setError(
        error instanceof Error
          ? `Wystąpił błąd podczas dodawania projektu: ${error.message}`
          : "Wystąpił nieznany błąd podczas dodawania projektu."
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#252422] border-[#403d39] text-[#fffcf2] max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-2xl font-montserrat">Nowy projekt</DialogTitle>
          <DialogDescription className="text-[#ccc5b9] font-open-sans">
            Utwórz nowy projekt muzyczny, aby rozpocząć pracę.
          </DialogDescription>
        </DialogHeader>

        <ProjectForm onSubmit={handleSubmit} onCancel={() => onOpenChange(false)} />

        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </DialogContent>
    </Dialog>
  )
}


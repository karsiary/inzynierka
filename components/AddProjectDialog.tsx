"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ProjectForm } from "./ProjectForm"
import { supabase } from "@/lib/supabase"

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
      const { data: userData, error: userError } = await supabase.auth.getUser()
      if (userError) {
        console.error("Error getting user:", userError)
        throw userError
      }

      if (!userData.user) {
        throw new Error("No user data available")
      }

      const newProject = {
        ...projectData,
        user_id: userData.user.id,
      }

      const { data, error: insertError } = await supabase.from("projects").insert([newProject]).select()

      if (insertError) {
        console.error("Error inserting project:", insertError)
        throw insertError
      }

      if (!data || data.length === 0) {
        throw new Error("No data returned after inserting project")
      }

      const { error: activityError } = await supabase.from("activity").insert([
        {
          user_id: userData.user.id,
          project_id: data[0].id,
          action: "create_project",
          description: `Utworzono projekt: ${projectData.name}`,
        },
      ])

      if (activityError) {
        console.error("Error inserting activity:", activityError)
        // We don't throw here as the project was successfully created
      }

      onProjectAdded()
      onOpenChange(false)
    } catch (error) {
      console.error("Error adding project:", error)
      setError(
        error instanceof Error
          ? `Wystąpił błąd podczas dodawania projektu: ${error.message}`
          : "Wystąpił nieznany błąd podczas dodawania projektu.",
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


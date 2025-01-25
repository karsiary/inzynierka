import { Progress } from "@/components/ui/progress"
import type { Project } from "@/types/supabase"

interface ProjectHeaderProps {
  project: Project
}

export function ProjectHeader({ project }: ProjectHeaderProps) {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#fffcf2] mb-2 font-montserrat">{project.name}</h1>
          <div className="flex items-center space-x-4">
            <Progress value={project.progress} className="w-48 bg-[#403d39]" />
            <span className="text-[#ccc5b9] text-sm font-open-sans">{project.progress}% ukończono</span>
          </div>
        </div>
      </div>
    </div>
  )
}


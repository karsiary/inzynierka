import { Card } from "@/components/ui/card"
import { Calendar, DollarSign, Clock } from "lucide-react"
import type { Project } from "@/types/supabase"

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("pl-PL", { style: "currency", currency: "PLN" }).format(amount)
}

interface ProjectStatsProps {
  project: Project
  currentPhase: string
  selectedSong: string | null
}

export type Project = {
  // ... other properties
  budget_planned: number
  phase: string
  due_date: string
  // ... other properties
}

export function ProjectStats({ project, currentPhase, selectedSong }: ProjectStatsProps) {
  const remainingDays = Math.ceil((new Date(project.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-[#403d39] border-none p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-[#eb5e28]/10 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-[#eb5e28]" />
            </div>
            <div>
              <p className="text-[#ccc5b9] text-sm font-open-sans">
                {selectedSong !== "all" ? "Faza piosenki" : "Faza projektu"}
              </p>
              <h3 className="text-xl font-bold text-[#fffcf2] font-montserrat">
                {currentPhase === "Zakończona"
                  ? "Zakończona"
                  : currentPhase === "1"
                    ? "Preprodukcja"
                    : currentPhase === "2"
                      ? "Produkcja"
                      : currentPhase === "3"
                        ? "Inżynieria"
                        : currentPhase === "4"
                          ? "Publishing"
                          : "Nieznana"}
              </h3>
            </div>
          </div>
        </Card>

        <Card className="bg-[#403d39] border-none p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-[#eb5e28]/10 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-[#eb5e28]" />
            </div>
            <div>
              <p className="text-[#ccc5b9] text-sm font-open-sans">
                Budżet fazy{" "}
                {currentPhase === "1"
                  ? "Preprodukcja"
                  : currentPhase === "2"
                    ? "Produkcja"
                    : currentPhase === "3"
                      ? "Inżynieria"
                      : currentPhase === "4"
                        ? "Publishing"
                        : "Nieznana"}
              </p>
              <h3 className="text-xl font-bold text-[#fffcf2] font-montserrat">
                {formatCurrency(project.budget_planned / 4)} {/* Assuming equal distribution across 4 phases */}
              </h3>
            </div>
          </div>
        </Card>

        <Card className="bg-[#403d39] border-none p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-[#eb5e28]/10 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-[#eb5e28]" />
            </div>
            <div>
              <p className="text-[#ccc5b9] text-sm font-open-sans">Budżet globalny</p>
              <h3 className="text-xl font-bold text-[#fffcf2] font-montserrat">
                {formatCurrency(project.budget_planned)}
              </h3>
            </div>
          </div>
        </Card>

        <Card className="bg-[#403d39] border-none p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-[#eb5e28]/10 flex items-center justify-center">
              <Clock className="w-6 h-6 text-[#eb5e28]" />
            </div>
            <div>
              <p className="text-[#ccc5b9] text-sm font-open-sans">Pozostało dni</p>
              <h3 className="text-xl font-bold text-[#fffcf2] font-montserrat">{remainingDays} dni</h3>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}


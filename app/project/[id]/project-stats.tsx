import { Card } from "@/components/ui/card"
import { Calendar, DollarSign, Clock } from "lucide-react"

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("pl-PL", { style: "currency", currency: "PLN" }).format(amount)
}

interface Project {
  budget_planned: number
  phase: string
  due_date: string
  budgetType: string
  budgetGlobal?: number
  budgetPhase1?: number
  budgetPhase2?: number
  budgetPhase3?: number
  budgetPhase4?: number
}

interface ProjectStatsProps {
  project: Project
  currentPhase: string
  selectedSong: string | null
}

export function ProjectStats({ project, currentPhase, selectedSong }: ProjectStatsProps) {
  const remainingDays = Math.ceil((new Date(project.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))

  console.log("ProjectStats - dane projektu:", {
    budgetType: project.budgetType,
    budgetGlobal: project.budgetGlobal,
    budgetPhases: [project.budgetPhase1, project.budgetPhase2, project.budgetPhase3, project.budgetPhase4]
  });

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
                {formatCurrency(
                  project.budgetType === 'phases' 
                    ? (currentPhase === "1" ? project.budgetPhase1 || 0
                      : currentPhase === "2" ? project.budgetPhase2 || 0
                      : currentPhase === "3" ? project.budgetPhase3 || 0
                      : currentPhase === "4" ? project.budgetPhase4 || 0
                      : 0)
                    : (project.budgetGlobal || 0) / 4
                )}
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
                {formatCurrency(project.budgetType === 'global' ? 
                  (project.budgetGlobal || 0) : 
                  ((project.budgetPhase1 || 0) + (project.budgetPhase2 || 0) + (project.budgetPhase3 || 0) + (project.budgetPhase4 || 0))
                )}
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


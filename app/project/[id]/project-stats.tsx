import { Card } from "@/components/ui/card"
import { Calendar, DollarSign, Clock } from "lucide-react"
import { useEffect, useState } from "react"
import { formatCurrency } from "@/lib/utils"

interface Project {
  id: number
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
  const [remainingDays, setRemainingDays] = useState<string | number>("...")
  const [totalActualBudget, setTotalActualBudget] = useState<number>(0)

  const fetchTotalActualBudget = async () => {
    try {
      const response = await fetch(`/api/projects/${project.id}/actual-budget`)
      if (!response.ok) {
        throw new Error('Failed to fetch total actual budget')
      }
      const data = await response.json()
      setTotalActualBudget(data.totalActualBudget)
    } catch (error) {
      console.error('Error fetching total actual budget:', error)
    }
  }

  useEffect(() => {
    const fetchRemainingDays = async () => {
      try {
        const response = await fetch(`/api/projects/${project.id}/remaining-days`)
        if (!response.ok) {
          throw new Error('Failed to fetch remaining days')
        }
        const data = await response.json()
        setRemainingDays(data.remainingDays)
      } catch (error) {
        console.error('Error fetching remaining days:', error)
        setRemainingDays("Błąd")
      }
    }

    fetchRemainingDays()
    fetchTotalActualBudget()
  }, [project.id])

  // Nasłuchuj na zdarzenie aktualizacji zadania
  useEffect(() => {
    const handleTaskUpdate = () => {
      fetchTotalActualBudget()
    }

    window.addEventListener('taskUpdated', handleTaskUpdate)
    return () => {
      window.removeEventListener('taskUpdated', handleTaskUpdate)
    }
  }, [])

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
              <DollarSign className="w-6 h-6 text-[#eb5e28]" />
            </div>
            <div>
              <p className="text-[#ccc5b9] text-sm font-open-sans">Budżet wykorzystany</p>
              <h3 className="text-xl font-bold text-[#fffcf2] font-montserrat">
                {formatCurrency(totalActualBudget)}
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
              <h3 className="text-xl font-bold text-[#fffcf2] font-montserrat">
                {typeof remainingDays === 'number' ? `${remainingDays} dni` : remainingDays}
              </h3>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}


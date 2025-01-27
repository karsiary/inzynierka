"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronLeft, Plus, Calendar, Users, DollarSign, Clock, MoreVertical, Search, Bell } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { KanbanBoard } from "./kanban-board"
import { ProjectStats } from "./project-stats"
import { ProjectHeader } from "./project-header"
import { AddTaskDialog } from "./add-task-dialog"
import { SongSelector } from "./song-selector"
import type { Project, Song } from "@prisma/client"
import { useParams } from "next/navigation"
import { NotificationsPopover } from "@/components/NotificationsPopover"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"

const noSelectClass = "select-none"

// Przykładowe dane piosenek
const sampleSongs: Song[] = [
  { id: "1", title: "Letnia przygoda" },
  { id: "2", title: "Zimowy sen" },
  { id: "3", title: "Jesienny blues" },
  { id: "4", title: "Wiosenny powiew" },
]

export default function ProjectPage() {
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false)
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentPhase, setCurrentPhase] = useState("1")
  const [selectedSong, setSelectedSong] = useState<string>("all")
  const [viewPhase, setViewPhase] = useState("1")
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
  const [isProjectEndModalOpen, setIsProjectEndModalOpen] = useState(false)
  const [songPhases, setSongPhases] = useState<Record<string, string>>({})
  const [completedSongs, setCompletedSongs] = useState<Record<string, boolean>>({})
  const params = useParams()
  const projectId = params.id as string

  useEffect(() => {
    fetchProject()
  }, [projectId])

  async function fetchProject() {
    try {
      setLoading(true)
      console.log("Pobieranie projektu o ID:", projectId)
      const response = await fetch(`/api/projects/${projectId}/`)
      console.log("Status odpowiedzi:", response.status)
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error("Błąd odpowiedzi:", errorData)
        throw new Error(errorData.error || 'Błąd podczas pobierania projektu')
      }
      
      const data = await response.json()
      console.log("Pobrane dane projektu:", data)
      setProject(data)
    } catch (error) {
      console.error("Error fetching project:", error)
    } finally {
      setLoading(false)
    }
  }

  const handlePhaseChange = () => {
    if (selectedSong !== "all") {
      const currentSongPhase = songPhases[selectedSong] || "1"
      if (currentSongPhase !== "4") {
        const nextPhase = ((Number.parseInt(currentSongPhase) % 4) + 1).toString()
        setSongPhases((prev) => ({ ...prev, [selectedSong]: nextPhase }))
        setViewPhase(nextPhase)
      }
    } else if (currentPhase !== "4") {
      const nextPhase = ((Number.parseInt(currentPhase) % 4) + 1).toString()
      setCurrentPhase(nextPhase)
      setViewPhase(nextPhase)
    }
    setIsConfirmModalOpen(false)
  }

  const handleAddTask = () => {
    setIsAddTaskOpen(true)
  }

  const handleTaskAdded = () => {
    // Refresh the Kanban board
    // This could be optimized to just fetch the new task instead of all tasks
    fetchProject()
  }

  const handleSongChange = (songId: string) => {
    setSelectedSong(songId)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#252422] flex items-center justify-center">
        <p className="text-[#fffcf2] text-xl">Ładowanie projektu...</p>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-[#252422] flex items-center justify-center">
        <p className="text-[#fffcf2] text-xl">Projekt nie znaleziony</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#252422]">
      {/* Gradient Background */}
      <div className="absolute top-0 left-0 w-full h-full z-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(235,94,40,0.15),rgba(37,36,34,0))]" />

      <div className="relative z-10">
        {/* Top Navigation */}
        <nav className="border-b border-[#403d39] bg-[#252422]/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link
                  href="/projects"
                  className="text-[#ccc5b9] hover:text-[#eb5e28] transition-colors flex items-center"
                >
                  <ChevronLeft className="w-5 h-5 mr-2" />
                  Powrót do projektów
                </Link>
              </div>
              <div className="flex items-center gap-4">
                <NotificationsPopover />
                <div className="w-10 h-10 rounded-full bg-[#403d39] flex items-center justify-center">
                  <span className="text-[#fffcf2] font-semibold font-montserrat">JK</span>
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Project Header */}
        <ProjectHeader project={project} />

        {/* Project Stats */}
        <ProjectStats
          project={project}
          currentPhase={
            selectedSong !== "all"
              ? completedSongs[selectedSong]
                ? "Zakończona"
                : songPhases[selectedSong] || "1"
              : currentPhase
          }
          selectedSong={selectedSong}
        />

        {/* Main Content */}
        <main className="container mx-auto px-4 py-6">
          <Card className="bg-[#403d39] border-none p-6 relative">
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-4">
                  <Input
                    placeholder="Szukaj zadań..."
                    className="w-full sm:w-64 bg-[#252422] border-none text-[#ccc5b9] placeholder:text-[#ccc5b9]/50"
                  />
                  <SongSelector
                    songs={project.songs}
                    selectedSong={selectedSong}
                    onSongChange={handleSongChange}
                    showAllOption={true}
                  />
                </div>
                <div className="flex items-center gap-4">
                  {selectedSong !== "all" && !completedSongs[selectedSong] && (
                    <Button
                      onClick={() => {
                        if (selectedSong !== "all") {
                          const currentSongPhase = songPhases[selectedSong] || "1"
                          if (currentSongPhase === "4") {
                            setIsProjectEndModalOpen(true)
                          } else if (viewPhase === currentSongPhase) {
                            setIsConfirmModalOpen(true)
                          } else {
                            setViewPhase(currentSongPhase)
                          }
                        }
                      }}
                      className={`bg-[#eb5e28] hover:bg-[#eb5e28]/90 text-white ${noSelectClass}`}
                    >
                      {viewPhase === (songPhases[selectedSong] || "1")
                        ? "Następna faza utworu"
                        : "Pokaż aktualną fazę utworu"}
                    </Button>
                  )}
                </div>
              </div>

              <Tabs defaultValue="1" value={viewPhase} onValueChange={setViewPhase} className="w-full">
                <TabsList className="w-full bg-[#252422] border-none mb-6 flex flex-wrap">
                  {["Preprodukcja", "Produkcja", "Inżynieria", "Publishing"].map((phase, index) => (
                    <TabsTrigger
                      key={index}
                      value={`${index + 1}`}
                      className={`flex-1 ${
                        selectedSong !== "all" && completedSongs[selectedSong]
                          ? "bg-red-500 text-white"
                          : "data-[state=active]:bg-[#eb5e28] data-[state=active]:text-white"
                      } ${
                        selectedSong !== "all" &&
                        `${index + 1}` === (selectedSong !== "all" ? songPhases[selectedSong] || "1" : currentPhase)
                          ? "default-phase"
                          : ""
                      }`}
                    >
                      {phase}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {["1", "2", "3", "4"].map((phaseId) => (
                  <TabsContent key={phaseId} value={phaseId} className="h-[calc(100vh-300px)] overflow-y-auto">
                    <KanbanBoard
                      projectId={project.id}
                      phaseId={viewPhase}
                      selectedSong={selectedSong}
                      currentPhase={selectedSong !== "all" ? songPhases[selectedSong] || "1" : currentPhase}
                      isSongCompleted={selectedSong !== "all" && completedSongs[selectedSong]}
                    />
                  </TabsContent>
                ))}
              </Tabs>
            </div>
            <Dialog open={isProjectEndModalOpen} onOpenChange={setIsProjectEndModalOpen}>
              <DialogContent className="bg-[#252422] border-[#403d39] text-[#fffcf2]">
                <DialogHeader>
                  <DialogTitle className="text-xl font-semibold">Potwierdzenie zakończenia utworu</DialogTitle>
                  <DialogDescription className="text-[#ccc5b9]">
                    Czy na pewno chcesz zakończyć utwór? Ta akcja jest nieodwracalna i zamknie wszystkie aktywne zadania.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button
                    variant="ghost"
                    onClick={() => setIsProjectEndModalOpen(false)}
                    className="text-[#ccc5b9] hover:text-[#fffcf2] hover:bg-[#403d39]"
                  >
                    Anuluj
                  </Button>
                  <Button
                    onClick={() => {
                      setCompletedSongs((prev) => ({ ...prev, [selectedSong]: true }))
                      setIsProjectEndModalOpen(false)
                    }}
                    className="bg-[#eb5e28] hover:bg-[#eb5e28]/90 text-white"
                  >
                    Zakończ utwór
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Dialog open={isConfirmModalOpen} onOpenChange={setIsConfirmModalOpen}>
              <DialogContent className="bg-[#252422] border-[#403d39] text-[#fffcf2]">
                <DialogHeader>
                  <DialogTitle className="text-xl font-semibold">Potwierdzenie zmiany fazy</DialogTitle>
                  <DialogDescription className="text-[#ccc5b9]">
                    Czy na pewno chcesz przejść do następnej fazy? Upewnij się, że wszystkie zadania w obecnej fazie są
                    zakończone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button
                    variant="ghost"
                    onClick={() => setIsConfirmModalOpen(false)}
                    className="text-[#ccc5b9] hover:text-[#fffcf2] hover:bg-[#403d39]"
                  >
                    Anuluj
                  </Button>
                  <Button
                    onClick={handlePhaseChange}
                    className="bg-[#eb5e28] hover:bg-[#eb5e28]/90 text-white"
                  >
                    Przejdź do następnej fazy
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </Card>
        </main>
      </div>
    </div>
  )
}


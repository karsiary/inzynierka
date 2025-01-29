"use client"

import { useEffect, useState, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart3, Users, FolderKanban, Bell, Settings, LogOut, Plus, Calendar, Music2, ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"
import Link from "next/link"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { usePathname, useRouter } from "next/navigation"
import { AddProjectDialog } from "@/components/AddProjectDialog"
import { NotificationsPopover } from "@/components/NotificationsPopover"
import { format } from "date-fns"
import { pl } from "date-fns/locale"
import { useSession, signOut } from "next-auth/react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export default function DashboardPage() {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session, status } = useSession()
  const [projects, setProjects] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [activityData, setActivityData] = useState<any[]>([])
  const [isAddProjectOpen, setIsAddProjectOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalProjects, setTotalProjects] = useState(0)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [projectToDelete, setProjectToDelete] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const projectsPerPage = 4

  const fetchData = useCallback(async () => {
    if (!session?.user?.id) {
      router.push("/login")
      return
    }

    try {
      const response = await fetch(`/api/dashboard?page=${currentPage}`)
      if (!response.ok) {
        throw new Error("Błąd podczas pobierania danych")
      }
      const data = await response.json()
      
      setProjects(data.projects)
      setStats(data.stats)
      setActivityData(data.activity)
      setTotalProjects(data.totalProjects)
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setIsLoading(false)
    }
  }, [router, session, currentPage])

  useEffect(() => {
    if (status === "authenticated") {
      fetchData()
    } else if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, fetchData])

  const totalPages = Math.ceil(totalProjects / projectsPerPage)

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1)
    }
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1)
    }
  }

  const handleDeleteProject = async () => {
    if (!projectToDelete) return
    
    setIsDeleting(true)
    setDeleteError(null)

    try {
      const response = await fetch(`/api/projects/${projectToDelete}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Błąd podczas usuwania projektu')
      }

      await fetchData()
      setIsDeleteDialogOpen(false)
      setProjectToDelete(null)
    } catch (error) {
      console.error("Error deleting project:", error)
      setDeleteError(error instanceof Error ? error.message : 'Wystąpił błąd podczas usuwania projektu')
    } finally {
      setIsDeleting(false)
    }
  }

  if (status === "loading" || isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  const userName = session?.user?.name?.split(" ")[0] || "Użytkowniku"
  const userInitials = session?.user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("") || "U"

  return (
    <>
      <div className="min-h-screen bg-[#252422]">
        {/* Gradient Background */}
        <div className="absolute top-0 left-0 w-full h-full z-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(235,94,40,0.15),rgba(37,36,34,0))]" />

        <div className="relative z-10 flex">
          {/* Sidebar */}
          <aside className="w-64 min-h-screen bg-[#403d39]/50 backdrop-blur-sm border-r border-[#403d39] p-6">
            <div className="flex items-center mb-8">
              <span className="text-[#eb5e28] text-2xl font-bold font-montserrat">Audio</span>
              <span className="text-[#fffcf2] text-2xl font-bold font-montserrat">Plan</span>
            </div>

            <nav className="space-y-2">
              <Link
                href="/dashboard"
                className={`flex items-center gap-3 text-[#ccc5b9] px-4 py-2 rounded-lg ${
                  pathname === "/dashboard" ? "text-[#fffcf2] bg-[#eb5e28]/10" : "hover:bg-[#403d39]"
                }`}
              >
                <BarChart3 className="w-5 h-5" />
                <span className="font-roboto">Dashboard</span>
              </Link>
              <Link
                href="/projects"
                className={`flex items-center gap-3 px-4 py-2 rounded-lg ${
                  pathname === "/projects" ? "text-[#fffcf2] bg-[#eb5e28]/10" : "text-[#ccc5b9] hover:bg-[#403d39]"
                }`}
              >
                <FolderKanban className="w-5 h-5" />
                <span className="font-roboto">Projekty</span>
              </Link>
              <Link
                href="/team"
                className={`flex items-center gap-3 px-4 py-2 rounded-lg ${
                  pathname === "/team" ? "text-[#fffcf2] bg-[#eb5e28]/10" : "text-[#ccc5b9] hover:bg-[#403d39]"
                }`}
              >
                <Users className="w-5 h-5" />
                <span className="font-roboto">Zespół</span>
              </Link>
              <Link
                href="/calendar"
                className={`flex items-center gap-3 px-4 py-2 rounded-lg ${
                  pathname === "/calendar" ? "text-[#fffcf2] bg-[#eb5e28]/10" : "text-[#ccc5b9] hover:bg-[#403d39]"
                }`}
              >
                <Calendar className="w-5 h-5" />
                <span className="font-roboto">Kalendarz</span>
              </Link>
            </nav>

            <div className="absolute bottom-8 left-6 space-y-2">
              <Link
                href="/settings"
                className="flex items-center gap-3 text-[#ccc5b9] px-4 py-2 rounded-lg hover:bg-[#403d39]"
              >
                <Settings className="w-5 h-5" />
                <span className="font-roboto">Ustawienia</span>
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="flex items-center gap-3 text-[#ccc5b9] px-4 py-2 rounded-lg hover:bg-[#403d39] w-full text-left"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-roboto">Wyloguj</span>
              </button>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 p-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-2xl font-bold text-[#fffcf2] mb-2 font-montserrat">
                  Witaj, {userName}! 👋
                </h1>
                <p className="text-[#ccc5b9] font-open-sans">Sprawdź postęp swoich projektów muzycznych</p>
              </div>
              <div className="flex items-center gap-4">
                <NotificationsPopover />
                <div className="w-10 h-10 rounded-full bg-[#403d39] flex items-center justify-center">
                  <span className="text-[#fffcf2] font-semibold font-montserrat">
                    {userInitials}
                  </span>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="bg-[#403d39] border-none p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-[#eb5e28]/10 flex items-center justify-center">
                    <Music2 className="w-6 h-6 text-[#eb5e28]" />
                  </div>
                  <div>
                    <p className="text-[#ccc5b9] text-sm font-open-sans">Aktywne Projekty</p>
                    <h3 className="text-2xl font-bold text-[#fffcf2] font-montserrat">{stats?.activeProjects || 0}</h3>
                  </div>
                </div>
              </Card>
              <Card className="bg-[#403d39] border-none p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-[#eb5e28]/10 flex items-center justify-center">
                    <Users className="w-6 h-6 text-[#eb5e28]" />
                  </div>
                  <div>
                    <p className="text-[#ccc5b9] text-sm font-open-sans">Członkowie Zespołu</p>
                    <h3 className="text-2xl font-bold text-[#fffcf2] font-montserrat">{stats?.teamMembers || 0}</h3>
                  </div>
                </div>
              </Card>
              <Card className="bg-[#403d39] border-none p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-[#eb5e28]/10 flex items-center justify-center">
                    <FolderKanban className="w-6 h-6 text-[#eb5e28]" />
                  </div>
                  <div>
                    <p className="text-[#ccc5b9] text-sm font-open-sans">Ukończone Projekty</p>
                    <h3 className="text-2xl font-bold text-[#fffcf2] font-montserrat">{stats?.completedProjects || 0}</h3>
                  </div>
                </div>
              </Card>
              <Card className="bg-[#403d39] border-none p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-[#eb5e28]/10 flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-[#eb5e28]" />
                  </div>
                  <div>
                    <p className="text-[#ccc5b9] text-sm font-open-sans">Nadchodzące Terminy</p>
                    <h3 className="text-2xl font-bold text-[#fffcf2] font-montserrat">{stats?.upcomingDeadlines || 0}</h3>
                  </div>
                </div>
              </Card>
            </div>

            {/* Chart and Projects Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Chart */}
              <Card className="lg:col-span-2 bg-[#403d39] border-none p-6 pb-2">
                <h3 className="text-lg font-semibold text-[#fffcf2] mb-4 font-montserrat">Aktywność Projektowa</h3>
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={activityData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ccc5b9" opacity={0.1} />
                      <XAxis dataKey="name" stroke="#ccc5b9" tickFormatter={(value) => value} />
                      <YAxis stroke="#ccc5b9" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#403d39",
                          border: "none",
                          borderRadius: "8px",
                        }}
                        labelStyle={{ color: "#fffcf2" }}
                        formatter={(value, name) => [`${value} ${name === "projekty" ? "projektów" : name}`, ""]}
                        labelFormatter={(label) =>
                          `${label}, ${format(activityData.find((d) => d.name === label)?.date || new Date(), "d MMM", { locale: pl })}`
                        }
                      />
                      <Line
                        type="monotone"
                        dataKey="projekty"
                        stroke="#eb5e28"
                        strokeWidth={2}
                        dot={{ fill: "#eb5e28" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* Recent Activity */}
              <Card className="bg-[#403d39] border-none p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-[#fffcf2] font-montserrat">Ostatnia Aktywność</h3>
                  <Button variant="ghost" size="sm" className="text-[#eb5e28] hover:text-[#eb5e28]/80">
                    Zobacz wszystko
                  </Button>
                </div>
                <div className="space-y-4">
                  {stats?.recentActivity.map((activity: any, index: number) => (
                    <div key={index} className="flex items-center gap-4">
                      <div className="w-2 h-2 rounded-full bg-[#eb5e28]" />
                      <div>
                        <p className="text-[#fffcf2] font-open-sans">{activity.description}</p>
                        <p className="text-sm text-[#ccc5b9]">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Projects List */}
            <Card className="bg-[#403d39] border-none p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-[#fffcf2] font-montserrat">Twoje Projekty</h3>
                <Button
                  className="bg-[#eb5e28] text-white hover:bg-[#eb5e28]/90"
                  onClick={() => setIsAddProjectOpen(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Nowy Projekt
                </Button>
              </div>
              <div className="space-y-4">
                {projects.map((project) => (
                  <div key={project.id} className="bg-[#252422] rounded-lg p-4 flex items-center justify-between hover:bg-[#252422]/80 transition-colors">
                    <Link href={`/project/${project.id}`} className="flex items-center gap-4 flex-1">
                      <div className="w-10 h-10 rounded-lg bg-[#eb5e28]/10 flex items-center justify-center">
                        <Music2 className="w-5 h-5 text-[#eb5e28]" />
                      </div>
                      <div>
                        <h4 className="text-[#fffcf2] font-semibold font-montserrat">{project.name}</h4>
                        <p className="text-sm text-[#ccc5b9] font-open-sans">
                          {project.role} • Termin: {new Date(project.due_date).toLocaleDateString()}
                        </p>
                      </div>
                    </Link>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm text-[#ccc5b9] font-open-sans">{project.status}</p>
                        <p className="text-sm text-[#eb5e28] font-open-sans">{project.progress}%</p>
                      </div>
                      <div className="w-24 h-2 bg-[#403d39] rounded-full overflow-hidden">
                        <div className="h-full bg-[#eb5e28] rounded-full" style={{ width: `${project.progress}%` }} />
                      </div>
                      {project.userId === session?.user?.id && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-[#ccc5b9] hover:text-[#fffcf2]">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="bg-[#252422] border-[#403d39]">
                            <DropdownMenuItem 
                              className="text-red-500 focus:text-red-500 focus:bg-[#403d39]"
                              onClick={() => {
                                setProjectToDelete(project.id)
                                setIsDeleteDialogOpen(true)
                              }}
                            >
                              Usuń projekt
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Pagination Controls */}
              {totalProjects > projectsPerPage && (
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-[#ccc5b9]/20">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1}
                    className="text-[#ccc5b9] hover:text-[#fffcf2] disabled:opacity-50"
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Poprzednia
                  </Button>
                  <span className="text-[#ccc5b9]">
                    Strona {currentPage} z {totalPages}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className="text-[#ccc5b9] hover:text-[#fffcf2] disabled:opacity-50"
                  >
                    Następna
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              )}
            </Card>
            <AddProjectDialog open={isAddProjectOpen} onOpenChange={setIsAddProjectOpen} onProjectAdded={fetchData} />
          </main>
        </div>
      </div>

      <Dialog 
        open={isDeleteDialogOpen} 
        onOpenChange={(open) => {
          if (!isDeleting) {
            setIsDeleteDialogOpen(open)
            if (!open) {
              setProjectToDelete(null)
              setDeleteError(null)
            }
          }
        }}
      >
        <DialogContent className="bg-[#252422] border-[#403d39] text-[#fffcf2]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Potwierdzenie usunięcia</DialogTitle>
            <DialogDescription className="text-[#ccc5b9]">
              Czy na pewno chcesz usunąć ten projekt? Ta akcja jest nieodwracalna.
            </DialogDescription>
          </DialogHeader>
          {deleteError && (
            <div className="text-red-500 text-sm mt-2 mb-4">
              {deleteError}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                if (!isDeleting) {
                  setIsDeleteDialogOpen(false)
                  setProjectToDelete(null)
                  setDeleteError(null)
                }
              }}
              disabled={isDeleting}
              className="text-[#ccc5b9] hover:text-[#fffcf2] hover:bg-[#403d39]"
            >
              Anuluj
            </Button>
            <Button
              onClick={handleDeleteProject}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {isDeleting ? "Usuwanie..." : "Usuń projekt"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}


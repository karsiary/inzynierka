"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  BarChart3,
  Users,
  FolderKanban,
  Bell,
  Settings,
  LogOut,
  Plus,
  Calendar,
  Music2,
  Clock,
  Filter,
  Search,
} from "lucide-react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { usePathname } from "next/navigation"
import { supabase } from "@/lib/supabase"
import type { Project } from "@/types/supabase"
import { NotificationsPopover } from "@/components/NotificationsPopover"

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const pathname = usePathname()

  useEffect(() => {
    fetchProjects()
  }, [])

  async function fetchProjects() {
    try {
      setLoading(true)
      const { data, error } = await supabase.from("projects").select("*")

      if (error) {
        throw error
      }

      if (data) {
        setProjects(data)
      }
    } catch (error) {
      console.error("Error fetching projects:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
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
              className={`flex items-center gap-3 text-[#ccc5b9] px-4 py-2 rounded-lg ${
                pathname === "/team" ? "text-[#fffcf2] bg-[#eb5e28]/10" : "hover:bg-[#403d39]"
              }`}
            >
              <Users className="w-5 h-5" />
              <span className="font-roboto">Zespół</span>
            </Link>
            <Link
              href="/calendar"
              className={`flex items-center gap-3 text-[#ccc5b9] px-4 py-2 rounded-lg ${
                pathname === "/calendar" ? "text-[#fffcf2] bg-[#eb5e28]/10" : "hover:bg-[#403d39]"
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
            <Link
              href="/logout"
              className="flex items-center gap-3 text-[#ccc5b9] px-4 py-2 rounded-lg hover:bg-[#403d39]"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-roboto">Wyloguj</span>
            </Link>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold text-[#fffcf2] mb-2 font-montserrat">Projekty</h1>
              <p className="text-[#ccc5b9] font-open-sans">Zarządzaj swoimi projektami muzycznymi</p>
            </div>
            <div className="flex items-center gap-4">
              <NotificationsPopover />
              <div className="w-10 h-10 rounded-full bg-[#403d39] flex items-center justify-center">
                <span className="text-[#fffcf2] font-semibold font-montserrat">JK</span>
              </div>
            </div>
          </div>

          {/* Filters & Search */}
          <Card className="bg-[#403d39] border-none p-6 mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex flex-wrap gap-4 flex-1">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#ccc5b9]" />
                  <Input
                    placeholder="Szukaj projektów..."
                    className="pl-10 bg-[#252422] border-none text-white placeholder:text-[#ccc5b9]/50 font-open-sans"
                  />
                </div>
                <Select>
                  <SelectTrigger className="w-[180px] bg-[#252422] border-none font-open-sans text-white">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#252422] border-[#403d39]">
                    <SelectItem value="all" className="font-open-sans text-white">
                      Wszystkie
                    </SelectItem>
                    <SelectItem value="active" className="font-open-sans text-white">
                      Aktywne
                    </SelectItem>
                    <SelectItem value="completed" className="font-open-sans text-white">
                      Zakończone
                    </SelectItem>
                  </SelectContent>
                </Select>
                <Select>
                  <SelectTrigger className="w-[180px] bg-[#252422] border-none font-open-sans text-white">
                    <SelectValue placeholder="Faza" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#252422] border-[#403d39]">
                    <SelectItem value="all" className="font-open-sans text-white">
                      Wszystkie
                    </SelectItem>
                    <SelectItem value="pre" className="font-open-sans text-white">
                      Preprodukcja
                    </SelectItem>
                    <SelectItem value="prod" className="font-open-sans text-white">
                      Produkcja
                    </SelectItem>
                    <SelectItem value="post" className="font-open-sans text-white">
                      Postprodukcja
                    </SelectItem>
                    <SelectItem value="master" className="font-open-sans text-white">
                      Mastering
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          {/* Projects List */}
          <Card className="bg-[#403d39] border-none">
            <div className="grid divide-y divide-[#252422]">
              {loading ? (
                <div className="p-6 text-center text-[#ccc5b9]">Ładowanie projektów...</div>
              ) : projects.length === 0 ? (
                <div className="p-6 text-center text-[#ccc5b9]">Brak projektów do wyświetlenia.</div>
              ) : (
                projects.map((project) => (
                  <Link
                    key={project.id}
                    href={`/project/${project.id}`}
                    className="p-6 hover:bg-[#403d39]/80 transition-colors"
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                      {/* Project Info */}
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-lg bg-[#eb5e28]/10 flex items-center justify-center shrink-0">
                          <Music2 className="w-6 h-6 text-[#eb5e28]" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-[#fffcf2] font-montserrat">{project.name}</h3>
                          <p className="text-sm text-[#ccc5b9] font-open-sans">{project.role}</p>
                        </div>
                      </div>

                      {/* Status & Progress */}
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              project.status === "Zakończony"
                                ? "bg-green-500"
                                : project.status === "W trakcie"
                                  ? "bg-[#eb5e28]"
                                  : "bg-yellow-500"
                            }`}
                          />
                          <span className="text-sm text-[#ccc5b9]">{project.status}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-[#252422] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#eb5e28] rounded-full"
                              style={{ width: `${project.progress}%` }}
                            />
                          </div>
                          <span className="text-sm text-[#eb5e28]">{project.progress}%</span>
                        </div>
                      </div>

                      {/* Team & Phase */}
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex -space-x-2">
                            {project.team.slice(0, 3).map((member, index) => (
                              <div
                                key={index}
                                className="w-8 h-8 rounded-full bg-[#252422] flex items-center justify-center border-2 border-[#403d39]"
                              >
                                <span className="text-xs text-[#ccc5b9]">{member.slice(0, 2)}</span>
                              </div>
                            ))}
                          </div>
                          <span className="text-sm text-[#ccc5b9]">{project.team.length} członków</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-[#ccc5b9]" />
                          <span className="text-sm text-[#ccc5b9]">{project.phase}</span>
                        </div>
                      </div>

                      {/* Budget & Due Date */}
                      <div className="text-right">
                        <div className="text-lg font-semibold text-[#fffcf2] font-montserrat">
                          {project.budget_actual.toLocaleString()} zł
                          <span className="text-sm text-[#ccc5b9] ml-1">
                            / {project.budget_planned.toLocaleString()} zł
                          </span>
                        </div>
                        <p className="text-sm text-[#ccc5b9]">
                          Termin: {new Date(project.due_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </Card>
        </main>
      </div>
    </div>
  )
}


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
import { usePathname, useRouter } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import type { Project } from "@/types"
import { NotificationsPopover } from "@/components/NotificationsPopover"
import { Layout } from "@/components/Layout"

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [error, setError] = useState<string | null>(null)
  const pathname = usePathname()
  const router = useRouter()
  const { data: session, status } = useSession()

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  useEffect(() => {
    if (status === "authenticated") {
      fetchProjects()
    } else if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, debouncedSearchQuery, statusFilter])

  async function fetchProjects() {
    try {
      setLoading(true)
      setError(null)
      const queryParams = new URLSearchParams()
      
      if (debouncedSearchQuery) {
        queryParams.append("query", debouncedSearchQuery)
      }
      if (statusFilter && statusFilter !== "all") {
        queryParams.append("status", statusFilter)
      }

      const response = await fetch(`/api/projects?${queryParams.toString()}`)
      
      if (!response.ok) {
        throw new Error("Błąd podczas pobierania projektów")
      }

      const data = await response.json()
      setProjects(data)
    } catch (error) {
      console.error("Error fetching projects:", error)
      setError("Wystąpił błąd podczas pobierania projektów")
    } finally {
      setLoading(false)
    }
  }

  if (status === "loading") {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  const userInitials = session?.user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("") || "U"

  return (
    <Layout>
      {/* Main Content */}
      <div>
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#fffcf2] mb-2 font-montserrat">Projekty</h1>
            <p className="text-[#ccc5b9] font-open-sans">Zarządzaj swoimi projektami muzycznymi</p>
          </div>
          <div className="flex items-center gap-4">
            <NotificationsPopover />
            <div className="w-10 h-10 rounded-full bg-[#403d39] flex items-center justify-center">
              <span className="text-[#fffcf2] font-semibold font-montserrat">{userInitials}</span>
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
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
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
            </div>
          </div>
        </Card>

        {/* Projects List */}
        <Card className="bg-[#403d39] border-none">
          <div className="grid divide-y divide-[#252422]">
            {loading ? (
              <div className="p-6 text-center text-[#ccc5b9]">Ładowanie projektów...</div>
            ) : error ? (
              <div className="p-6 text-center text-red-500">{error}</div>
            ) : projects.length === 0 ? (
              <div className="p-6 text-center text-[#ccc5b9]">
                {searchQuery ? "Nie znaleziono projektów spełniających kryteria wyszukiwania." : "Brak projektów do wyświetlenia."}
              </div>
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
                    <div className="flex flex-col gap-2 w-[180px] -ml-4">
                      <div className="flex items-center gap-2 ml-4">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            project.progress === 100
                              ? "bg-green-500"
                              : "bg-[#eb5e28]"
                          }`}
                        />
                        <span className="text-sm text-[#ccc5b9]">{project.progress === 100 ? "Zakończony" : "W trakcie"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-[100px] bg-[#252422] rounded-full h-2">
                          <div
                            className="h-full bg-[#eb5e28] rounded-full"
                            style={{ width: `${Math.round(project.progress)}%` }}
                          />
                        </div>
                        <span className="text-sm text-[#eb5e28] min-w-[45px] text-right">{Math.round(project.progress)}%</span>
                      </div>
                    </div>

                    {/* Phase & Due Date */}
                    <div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-[#ccc5b9]" />
                        <span className="text-sm text-[#ccc5b9]">
                          Termin: {project.endDate ? new Date(project.endDate).toLocaleDateString() : "Brak"}
                        </span>
                      </div>
                    </div>

                    {/* Budget */}
                    <div className="text-right">
                      <p className="text-sm text-[#ccc5b9]">Budżet</p>
                      <p className="text-[#fffcf2] font-semibold">
                        {new Intl.NumberFormat('pl-PL').format(project.budget_actual)} / {new Intl.NumberFormat('pl-PL').format(project.budget_planned)} PLN
                      </p>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </Card>
      </div>
    </Layout>
  )
}


"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { BarChart3, Users, FolderKanban, Bell, Settings, LogOut, Plus, Calendar, Search, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { AddTeamDialog } from "./add-team-dialog"
import { TeamDetailsDialog } from "./TeamDetailsDialog"
import { NotificationsPopover } from "@/components/NotificationsPopover"
import { useSession, signOut } from "next-auth/react"
import type { Team } from "@/types"
import { Layout } from "@/components/Layout"

export default function TeamPage() {
  const [teams, setTeams] = useState<Team[]>([])
  const [isAddTeamOpen, setIsAddTeamOpen] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)
  const [isTeamDetailsOpen, setIsTeamDetailsOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("")
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, status } = useSession()

  // Odczytaj parametr "openTeam"
  const openTeamId = searchParams.get("openTeam")

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  useEffect(() => {
    if (status === "authenticated") {
      fetchTeams()
    } else if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, debouncedSearchQuery])

  useEffect(() => {
    if (openTeamId && teams.length > 0) {
      const teamToOpen = teams.find(team => team.id === parseInt(openTeamId))
      if (teamToOpen) {
        setSelectedTeam(teamToOpen)
        setIsTeamDetailsOpen(true)
        
        // Usuń parametr openTeam z URL
        const params = new URLSearchParams(searchParams.toString())
        params.delete("openTeam")
        router.replace(`/team${params.toString() ? `?${params.toString()}` : ''}`)
      } else {
        setError("Nie znaleziono zespołu lub brak uprawnień")
      }
    }
  }, [openTeamId, teams, searchParams, router])

  const fetchTeams = async () => {
    try {
      setError(null)
      const url = debouncedSearchQuery
        ? `/api/teams/search?q=${encodeURIComponent(debouncedSearchQuery)}`
        : "/api/teams"
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error("Błąd podczas pobierania zespołów")
      }
      const data = await response.json()
      setTeams(data)
    } catch (error) {
      console.error("Error fetching teams:", error)
      setError("Wystąpił błąd podczas pobierania zespołów")
    } finally {
      setLoading(false)
    }
  }

  const handleTeamClick = (team: Team) => {
    setSelectedTeam(team)
    setIsTeamDetailsOpen(true)
  }

  const handleSaveTeam = async (updatedTeam: Team) => {
    try {
      const response = await fetch(`/api/teams/${updatedTeam.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedTeam),
      })

      if (!response.ok) {
        throw new Error("Błąd podczas aktualizacji zespołu")
      }

      await fetchTeams()
      setIsTeamDetailsOpen(false)
    } catch (error) {
      console.error("Error updating team:", error)
    }
  }

  const handleTeamDeleted = async () => {
    await fetchTeams()
    setSelectedTeam(null)
    setIsTeamDetailsOpen(false)
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
            <h1 className="text-2xl font-bold text-[#fffcf2] mb-2 font-montserrat">Zespół</h1>
            <p className="text-[#ccc5b9] font-open-sans">Zarządzaj członkami zespołu i ich rolami</p>
            {error && (
              <p className="text-[#eb5e28] mt-2">{error}</p>
            )}
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
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Szukaj zespołów..."
                  className="pl-10 bg-[#252422] border-none text-[#ccc5b9] placeholder:text-[#ccc5b9]/50"
                />
              </div>
            </div>
            <Button
              onClick={() => setIsAddTeamOpen(true)}
              className="bg-[#eb5e28] text-white hover:bg-[#eb5e28]/90 whitespace-nowrap"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nowy Zespół
            </Button>
          </div>
        </Card>

        {/* Teams List */}
        <Card className="bg-[#403d39] border-none">
          <Table>
            <TableHeader>
              <TableRow className="border-[#252422] hover:bg-transparent">
                <TableHead className="text-[#ccc5b9]">Nazwa zespołu</TableHead>
                <TableHead className="text-[#ccc5b9]">Członkowie</TableHead>
                <TableHead className="text-[#ccc5b9]">Data utworzenia</TableHead>
                <TableHead className="text-[#ccc5b9]">Ostatnia aktywność</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-[#ccc5b9]">
                    Ładowanie zespołów...
                  </TableCell>
                </TableRow>
              ) : teams.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-[#ccc5b9]">
                    Brak zespołów do wyświetlenia
                  </TableCell>
                </TableRow>
              ) : (
                teams.map((team) => (
                  <TableRow
                    key={team.id}
                    className="border-[#252422] hover:bg-[#403d39]/80 cursor-pointer"
                    onClick={() => handleTeamClick(team)}
                  >
                    <TableCell className="font-medium text-[#fffcf2]">{team.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <div className="flex -space-x-2">
                          {team.members.slice(0, 3).map((member) => (
                            <div
                              key={member.id}
                              className="w-8 h-8 rounded-full bg-[#252422] flex items-center justify-center border-2 border-[#403d39]"
                              title={member.user.name || ""}
                            >
                              <span className="text-xs text-[#ccc5b9]">
                                {member.user.name?.split(" ").map((n) => n[0]).join("") || "U"}
                              </span>
                            </div>
                          ))}
                        </div>
                        {team.members.length > 3 && (
                          <div className="w-8 h-8 rounded-full bg-[#252422] flex items-center justify-center border-2 border-[#403d39] -ml-2">
                            <span className="text-xs text-[#ccc5b9]">+{team.members.length - 3}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-[#ccc5b9]">
                      {new Date(team.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-[#ccc5b9]">
                      {new Date(team.updated_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </div>

      {/* Add Team Dialog */}
      <AddTeamDialog
        open={isAddTeamOpen}
        onOpenChange={setIsAddTeamOpen}
        onTeamAdded={fetchTeams}
      />
      <TeamDetailsDialog
        open={isTeamDetailsOpen}
        onOpenChange={setIsTeamDetailsOpen}
        team={selectedTeam}
        onSave={handleSaveTeam}
        onTeamDeleted={handleTeamDeleted}
      />
    </Layout>
  )
}


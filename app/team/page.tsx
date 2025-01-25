"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, Users, FolderKanban, Bell, Settings, LogOut, Plus, Calendar, Search, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { AddTeamDialog } from "./add-team-dialog"
import { TeamDetailsDialog } from "./TeamDetailsDialog"
import { NotificationsPopover } from "@/components/NotificationsPopover"

// Przykładowe dane zespołów
const teams = [
  {
    id: 1,
    name: "Zespół Producencki A",
    members: [
      { id: 1, name: "Jan Kowalski", avatar: "JK", role: "Producent" },
      { id: 2, name: "Anna Nowak", avatar: "AN", role: "Inżynier dźwięku" },
      { id: 3, name: "Piotr Wiśniewski", avatar: "PW", role: "Artysta" },
    ],
    createdAt: "2024-01-15",
    lastActive: "2024-01-20",
  },
  {
    id: 2,
    name: "Studio Nagrań XYZ",
    members: [
      { id: 4, name: "Maria Kowalczyk", avatar: "MK", role: "Inżynier dźwięku" },
      { id: 5, name: "Tomasz Lewandowski", avatar: "TL", role: "Producent" },
    ],
    createdAt: "2024-01-10",
    lastActive: "2024-01-19",
  },
]

export default function TeamPage() {
  const [isAddTeamOpen, setIsAddTeamOpen] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState<(typeof teams)[0] | null>(null)
  const [isTeamDetailsOpen, setIsTeamDetailsOpen] = useState(false)
  const pathname = usePathname()

  const handleTeamClick = (team: (typeof teams)[0]) => {
    setSelectedTeam(team)
    setIsTeamDetailsOpen(true)
  }

  const handleSaveTeam = (updatedTeam: (typeof teams)[0]) => {
    // In a real application, you would update the team in your database here
    console.log("Saving updated team:", updatedTeam)
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
              className={`flex items-center gap-3 text-[#ccc5b9] px-4 py-2 rounded-lg ${
                pathname === "/projects" ? "text-[#fffcf2] bg-[#eb5e28]/10" : "hover:bg-[#403d39]"
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
              <h1 className="text-2xl font-bold text-[#fffcf2] mb-2 font-montserrat">Zespoły</h1>
              <p className="text-[#ccc5b9] font-open-sans">Zarządzaj zespołami i ich członkami</p>
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
                    placeholder="Szukaj zespołów..."
                    className="pl-10 bg-[#252422] border-none text-[#ccc5b9] placeholder:text-[#ccc5b9]/50"
                  />
                </div>
                <Select>
                  <SelectTrigger className="w-[180px] bg-[#252422] border-none text-white">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#252422] border-[#403d39]">
                    <SelectItem value="all" className="text-white">
                      Wszystkie
                    </SelectItem>
                    <SelectItem value="active" className="text-white">
                      Aktywne
                    </SelectItem>
                    <SelectItem value="archived" className="text-white">
                      Zarchiwizowane
                    </SelectItem>
                  </SelectContent>
                </Select>
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
                {teams.map((team) => (
                  <TableRow
                    key={team.id}
                    className="border-[#252422] hover:bg-[#403d39]/80 cursor-pointer"
                    onClick={() => handleTeamClick(team)}
                  >
                    <TableCell className="font-medium text-[#fffcf2]">{team.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <div className="flex -space-x-2">
                          {team.members.slice(0, 3).map((member, index) => (
                            <div
                              key={member.id}
                              className="w-8 h-8 rounded-full bg-[#252422] flex items-center justify-center border-2 border-[#403d39]"
                              title={member.name}
                            >
                              <span className="text-xs text-[#ccc5b9]">{member.avatar}</span>
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
                    <TableCell className="text-[#ccc5b9]">{new Date(team.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-[#ccc5b9]">{new Date(team.lastActive).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </main>
      </div>

      {/* Add Team Dialog */}
      <AddTeamDialog open={isAddTeamOpen} onOpenChange={setIsAddTeamOpen} />
      <TeamDetailsDialog
        open={isTeamDetailsOpen}
        onOpenChange={setIsTeamDetailsOpen}
        team={selectedTeam}
        onSave={handleSaveTeam}
      />
    </div>
  )
}


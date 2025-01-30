"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Layout } from "@/components/Layout"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { ChevronLeft, Settings } from "lucide-react"
import { NotificationsPopover } from "@/components/NotificationsPopover"
import { useSession } from "next-auth/react"
import type { Project, User } from "@/types"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

const roles = [
  "muzyk",
  "producent",
  "inżynier mixu",
  "inżynier masteringu",
  "wydawca",
  "social media",
  "menadżer",
  "edytor",
  "kompozytor"
]

interface ExtendedUser extends User {
  projectRole?: string;
  userRoles?: string[];
}

export default function ProjectSettingsPage() {
  const { data: session } = useSession()
  const params = useParams()
  const router = useRouter()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [members, setMembers] = useState<ExtendedUser[]>([])
  const projectId = params.id as string

  const userInitials = session?.user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("") || "U"

  const isCurrentUserAdmin = members.find(
    member => member.id === session?.user?.id
  )?.projectRole === "admin"

  useEffect(() => {
    fetchProject()
  }, [projectId])

  async function fetchProject() {
    try {
      setLoading(true)
      const response = await fetch(`/api/projects/${projectId}/`)
      
      if (!response.ok) {
        throw new Error('Błąd podczas pobierania projektu')
      }
      
      const data = await response.json()
      console.log("Pobrane dane projektu:", data)
      setProject(data)

      // Przygotowanie listy członków z rolami
      const projectMembers = data.members?.map(member => ({
        ...member.user,
        projectRole: member.user.id === data.userId ? "admin" : "user",
        userRoles: member.userRoles || []
      })) || []
      
      const teamMembers = data.teams?.flatMap(team => 
        team.members?.map(member => ({
          ...member.user,
          projectRole: member.user.id === data.userId ? "admin" : "user",
          userRoles: member.userRoles || []
        })) || []
      ) || []

      // Usuwanie duplikatów i ustawianie stanu
      const allMembersArray = [...projectMembers, ...teamMembers]
      const uniqueMembers = allMembersArray.filter((member, index, self) =>
        index === self.findIndex((m) => m.id === member.id)
      )
      setMembers(uniqueMembers)
    } catch (error) {
      console.error("Error fetching project:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleProjectRoleChange = async (userId: string, newRole: string) => {
    // Sprawdzenie czy użytkownik próbuje zmienić swoją własną rolę
    if (userId === session?.user?.id) {
      return
    }

    // Sprawdzenie czy obecny użytkownik jest administratorem
    if (!isCurrentUserAdmin) {
      return
    }

    try {
      const member = members.find(m => m.id === userId)
      if (!member) return

      const response = await fetch(`/api/projects/${projectId}/members/${userId}/roles`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectRole: newRole,
          userRoles: member.userRoles ? JSON.parse(member.userRoles) : []
        })
      })

      if (!response.ok) {
        throw new Error('Błąd podczas aktualizacji roli')
      }

      const updatedMembers = members.map(member => 
        member.id === userId ? { ...member, projectRole: newRole } : member
      )
      setMembers(updatedMembers)
    } catch (error) {
      console.error("Error updating project role:", error)
    }
  }

  const handleUserRolesChange = async (userId: string, newRole: string) => {
    try {
      const member = members.find(m => m.id === userId)
      if (!member) return

      let currentRoles: string[] = []
      try {
        currentRoles = member.userRoles ? JSON.parse(member.userRoles) : []
      } catch {
        currentRoles = []
      }

      const updatedRoles = currentRoles.includes(newRole)
        ? currentRoles.filter(role => role !== newRole)
        : [...currentRoles, newRole]

      const response = await fetch(`/api/projects/${projectId}/members/${userId}/roles`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectRole: member.projectRole || 'user',
          userRoles: updatedRoles
        })
      })

      if (!response.ok) {
        throw new Error('Błąd podczas aktualizacji ról')
      }

      const updatedMembers = members.map(m => {
        if (m.id === userId) {
          return { ...m, userRoles: JSON.stringify(updatedRoles) }
        }
        return m
      })
      setMembers(updatedMembers)
    } catch (error) {
      console.error("Error updating user roles:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#252422] flex items-center justify-center">
        <p className="text-[#fffcf2] text-xl">Ładowanie...</p>
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
    <div className="min-h-screen bg-[#252422] select-none">
      {/* Gradient Background */}
      <div className="absolute top-0 left-0 w-full h-full z-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(235,94,40,0.15),rgba(37,36,34,0))]" />

      <div className="relative z-10">
        {/* Top Navigation */}
        <nav className="border-b border-[#403d39] bg-[#252422]/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link
                href={`/project/${projectId}`}
                className="text-[#ccc5b9] hover:text-[#eb5e28] transition-colors flex items-center select-none"
              >
                <ChevronLeft className="w-5 h-5 mr-2" />
                Powrót do projektu
              </Link>
              <div className="flex items-center gap-4">
                <NotificationsPopover />
                <div className="w-10 h-10 rounded-full bg-[#403d39] flex items-center justify-center select-none">
                  <span className="text-[#fffcf2] font-semibold font-montserrat">{userInitials}</span>
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Project Settings Header */}
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#fffcf2] mb-2 font-montserrat">Ustawienia projektu</h1>
              <p className="text-[#ccc5b9] font-open-sans">{project.name}</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-6">
          <Card className="bg-[#403d39] border-none p-6">
            <h2 className="text-xl font-bold text-[#fffcf2] mb-6 font-montserrat">Osoby zaangażowane w projekt</h2>
            <div className="grid gap-4">
              {members.map((member) => (
                <div key={member.id} className="flex items-center justify-between bg-[#252422] p-4 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-[#eb5e28] flex items-center justify-center">
                      <span className="text-sm font-semibold text-[#fffcf2]">
                        {member.name?.split(" ").map((n) => n[0]).join("") || "U"}
                      </span>
                    </div>
                    <div>
                      <p className="text-[#fffcf2] font-medium">{member.name}</p>
                      <p className="text-sm text-[#ccc5b9]">{member.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex flex-wrap gap-1 min-w-[200px] justify-end">
                      {(() => {
                        try {
                          const roles = member.userRoles ? JSON.parse(member.userRoles) : []
                          return roles.map((role: string) => (
                            <Badge 
                              key={role}
                              variant="secondary" 
                              className={`bg-[#403d39] text-[#fffcf2] ${
                                isCurrentUserAdmin || member.id === session?.user?.id
                                  ? "cursor-pointer hover:bg-[#eb5e28]"
                                  : "opacity-75"
                              } whitespace-nowrap`}
                              onClick={() => {
                                if (isCurrentUserAdmin || member.id === session?.user?.id) {
                                  handleUserRolesChange(member.id, role)
                                }
                              }}
                            >
                              {role}
                            </Badge>
                          ))
                        } catch {
                          return null
                        }
                      })()}
                    </div>

                    <Select
                      value={member.projectRole || "user"}
                      onValueChange={(value) => handleProjectRoleChange(member.id, value)}
                      disabled={
                        member.id === session?.user?.id || // Nie można zmienić własnej roli
                        !isCurrentUserAdmin || // Tylko admin może zmieniać role
                        member.id === project.userId // Nie można zmienić roli twórcy projektu
                      }
                    >
                      <SelectTrigger className="w-[140px] bg-[#403d39] border-none text-[#fffcf2]">
                        <SelectValue placeholder="Wybierz typ" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#252422] border-[#403d39]">
                        <SelectItem value="admin" className="text-[#fffcf2]">Administrator</SelectItem>
                        <SelectItem value="user" className="text-[#fffcf2]">Użytkownik</SelectItem>
                      </SelectContent>
                    </Select>

                    <div className="flex flex-wrap gap-2 min-w-[200px]">
                      <Select 
                        onValueChange={(value) => handleUserRolesChange(member.id, value)}
                        value=""
                        disabled={!isCurrentUserAdmin && member.id !== session?.user?.id}
                      >
                        <SelectTrigger className={`w-[200px] bg-[#403d39] border-none text-[#fffcf2] ${
                          !isCurrentUserAdmin && member.id !== session?.user?.id ? "opacity-50" : ""
                        }`}>
                          <SelectValue placeholder="Dodaj role" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#252422] border-[#403d39]">
                          <ScrollArea className="h-[200px]">
                            {roles.filter(role => {
                              try {
                                const currentRoles = member.userRoles ? JSON.parse(member.userRoles) : []
                                return !currentRoles.includes(role)
                              } catch {
                                return true
                              }
                            }).map((role) => (
                              <SelectItem key={role} value={role} className="text-[#fffcf2]">
                                {role}
                              </SelectItem>
                            ))}
                          </ScrollArea>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ))}
              {members.length === 0 && (
                <div className="text-center text-[#ccc5b9] py-4">
                  Brak osób zaangażowanych w projekt
                </div>
              )}
            </div>
          </Card>
        </main>
      </div>
    </div>
  )
} 
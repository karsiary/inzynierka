"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Layout } from "@/components/Layout"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { ChevronLeft, Settings, User as UserIcon, Users, Plus, X } from "lucide-react"
import { NotificationsPopover } from "@/components/NotificationsPopover"
import { useSession } from "next-auth/react"
import type { Project, User, Song, SongAuthor, Team } from "@/types"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

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

interface ExtendedProject extends Project {
  songs?: (Song & {
    authors?: (SongAuthor & {
      user?: User;
      team?: Team;
    })[];
  })[];
}

interface SongAuthorWithDetails extends SongAuthor {
  user?: User;
  team?: Team;
}

export default function ProjectSettingsPage() {
  const { data: session } = useSession()
  const params = useParams()
  const router = useRouter()
  const [project, setProject] = useState<ExtendedProject | null>(null)
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

  const [newSongTitle, setNewSongTitle] = useState("")
  const [searchSongAuthor, setSearchSongAuthor] = useState("")
  const [currentSongAuthors, setCurrentSongAuthors] = useState<any[]>([])
  const [songAuthorSearchResults, setSongAuthorSearchResults] = useState<any[]>([])

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

  const handleSongPhaseChange = async (songId: number, newPhase: string) => {
    try {
      const response = await fetch(`/api/songs/${songId}/phase`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phase: newPhase })
      })

      if (!response.ok) {
        throw new Error('Błąd podczas aktualizacji fazy')
      }

      // Aktualizacja stanu lokalnego
      setProject(prev => {
        if (!prev) return null
        return {
          ...prev,
          songs: prev.songs?.map(song => 
            song.id === songId ? { ...song, phase: newPhase } : song
          )
        }
      })

      // Odśwież projekt, aby pobrać zaktualizowany postęp
      fetchProject()
    } catch (error) {
      console.error("Error updating song phase:", error)
    }
  }

  const handleAddSongAuthor = (author: any) => {
    if (!currentSongAuthors.find(a => a.id === author.id)) {
      setCurrentSongAuthors([...currentSongAuthors, author])
    }
    setSearchSongAuthor("")
    setSongAuthorSearchResults([])
  }

  const handleRemoveSongAuthor = (authorId: string) => {
    setCurrentSongAuthors(currentSongAuthors.filter(author => author.id !== authorId))
  }

  const handleAddSong = async () => {
    if (!newSongTitle || currentSongAuthors.length === 0) return

    try {
      const response = await fetch(`/api/projects/${projectId}/songs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newSongTitle,
          authors: currentSongAuthors
        })
      })

      if (!response.ok) {
        throw new Error('Błąd podczas dodawania piosenki')
      }

      setNewSongTitle("")
      setCurrentSongAuthors([])
      fetchProject() // Odśwież projekt, aby pobrać nową piosenkę
    } catch (error) {
      console.error("Error adding song:", error)
    }
  }

  const searchSongAuthors = async (query: string) => {
    if (!query) {
      setSongAuthorSearchResults([])
      return
    }

    try {
      // Pobierz zalogowanego użytkownika
      const currentUser = session?.user
      
      // Przygotuj listę wyników
      let results = []

      // Wyszukaj wśród dodanych użytkowników (zalogowany użytkownik już tam jest)
      const usersResults = members.filter(user => 
        user.name?.toLowerCase().includes(query.toLowerCase()) || 
        user.email?.toLowerCase().includes(query.toLowerCase())
      ).map(user => ({
        ...user,
        type: 'user'
      }))

      results = [...usersResults]
      setSongAuthorSearchResults(results)
    } catch (error) {
      console.error("Error searching song authors:", error)
      setSongAuthorSearchResults([])
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
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center",
                      member.projectRole === "admin" ? "bg-[#fffcf2]" : "bg-[#eb5e28]"
                    )}>
                      <span className={cn(
                        "text-sm font-semibold",
                        member.projectRole === "admin" ? "text-[#eb5e28]" : "text-[#fffcf2]"
                      )}>
                        {member.name?.split(" ").map((n) => n[0]).join("") || "U"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div>
                        <p className={cn(
                          "font-medium",
                          member.projectRole === "admin" ? "text-[#eb5e28]" : "text-[#fffcf2]"
                        )}>{member.name}</p>
                        <p className="text-sm text-[#ccc5b9]">{member.email}</p>
                      </div>
                      {isCurrentUserAdmin && member.id !== session?.user?.id && (
                        <Select
                          value={member.projectRole || "user"}
                          onValueChange={(value) => handleProjectRoleChange(member.id, value)}
                        >
                          <SelectTrigger className="w-[120px] bg-[#252422] border-[#252422] text-[#fffcf2]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-[#252422] border-[#403d39]">
                            <SelectItem value="admin" className="text-[#fffcf2]">
                              Admin
                            </SelectItem>
                            <SelectItem value="user" className="text-[#fffcf2]">
                              Użytkownik
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex flex-wrap gap-1 min-w-[200px] justify-end">
                      {roles.map((role) => (
                        <Badge
                          key={role}
                          variant="secondary"
                          className={cn(
                            "cursor-pointer transition-colors",
                            member.userRoles?.includes(role)
                              ? "bg-[#eb5e28] text-[#fffcf2]"
                              : "bg-[#252422] text-[#ccc5b9] hover:bg-[#eb5e28]/10"
                          )}
                          onClick={() => handleUserRolesChange(member.id, role)}
                        >
                          {role}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Zakładka Piosenki */}
          <Card className="bg-[#403d39] border-none p-6 mt-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-[#fffcf2] font-montserrat">Piosenki w projekcie</h2>
              <Badge variant="secondary" className="bg-[#eb5e28] text-[#fffcf2]">
                {project.songs?.length || 0} piosenek
              </Badge>
            </div>

            {/* Formularz dodawania nowej piosenki */}
            <Card className="bg-[#252422] border-none p-4 mb-6">
              <div className="space-y-4">
                <h3 className="text-[#fffcf2] font-semibold font-montserrat">Dodaj nową piosenkę</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="newSongTitle" className="text-[#fffcf2] font-roboto">
                    Tytuł piosenki
                  </Label>
                  <Input
                    id="newSongTitle"
                    value={newSongTitle}
                    onChange={(e) => setNewSongTitle(e.target.value)}
                    className="bg-[#403d39] border-[#403d39] text-[#fffcf2]"
                    placeholder="Wprowadź tytuł piosenki"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[#fffcf2] font-roboto">Autorzy</Label>
                  <div className="space-y-2">
                    <Input
                      value={searchSongAuthor}
                      onChange={(e) => {
                        setSearchSongAuthor(e.target.value)
                        searchSongAuthors(e.target.value)
                      }}
                      placeholder="Wyszukaj autora"
                      className="bg-[#403d39] border-[#403d39] text-[#fffcf2]"
                    />
                    {songAuthorSearchResults.length > 0 && searchSongAuthor && (
                      <div className="border rounded-md p-2 bg-[#403d39] border-[#252422] max-h-[200px] overflow-y-auto">
                        {songAuthorSearchResults.map((author) => (
                          <div
                            key={`${author.type}-${author.id}`}
                            className="p-2 hover:bg-[#252422] cursor-pointer text-[#fffcf2] flex items-center justify-between"
                            onClick={() => handleAddSongAuthor(author)}
                          >
                            <div className="flex items-center gap-2">
                              <span>{author.name}</span>
                            </div>
                            {author.type === 'user' ? (
                              <UserIcon className="h-4 w-4" />
                            ) : (
                              <Users className="h-4 w-4" />
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {currentSongAuthors.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-[#fffcf2] font-roboto">Wybrani autorzy</Label>
                    <div className="flex flex-wrap gap-2 p-2 bg-[#403d39] rounded-lg min-h-[40px]">
                      {currentSongAuthors.map((author) => (
                        <Badge
                          key={`${author.type}-${author.id}`}
                          variant="secondary"
                          className="bg-[#252422] text-[#fffcf2] px-3 py-1.5 flex items-center gap-2"
                        >
                          {author.type === 'user' ? (
                            <UserIcon className="h-3.5 w-3.5 text-[#eb5e28]" />
                          ) : (
                            <Users className="h-3.5 w-3.5 text-[#eb5e28]" />
                          )}
                          <span className="text-sm">{author.name}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-4 w-4 p-0 hover:bg-transparent ml-1 -mr-1"
                            onClick={() => handleRemoveSongAuthor(author.id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <Button 
                  type="button" 
                  onClick={handleAddSong}
                  disabled={!newSongTitle || currentSongAuthors.length === 0}
                  className="w-full bg-[#eb5e28] text-white hover:bg-[#eb5e28]/90 mt-4"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Dodaj piosenkę
                </Button>
              </div>
            </Card>

            {/* Lista piosenek */}
            <div className="space-y-4">
              {project.songs?.map((song, index) => (
                <div key={song.id} className="bg-[#252422] p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[#eb5e28] font-semibold">{index + 1}.</span>
                      <h4 className="text-[#fffcf2] font-semibold">{song.title}</h4>
                      <div className="flex items-center gap-2">
                        {song.authors?.map((author: SongAuthorWithDetails) => (
                          <Badge
                            key={`${author.type}-${author.id}`}
                            variant="secondary"
                            className="bg-[#403d39] text-[#ccc5b9] px-2 py-1 flex items-center gap-1 text-xs"
                          >
                            {author.type === 'user' ? (
                              <UserIcon className="h-3 w-3 text-[#eb5e28]" />
                            ) : (
                              <Users className="h-3 w-3 text-[#eb5e28]" />
                            )}
                            <span>
                              {author.type === 'user' ? author.user?.name : author.team?.name}
                            </span>
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Select
                      value={song.phase}
                      onValueChange={(value) => handleSongPhaseChange(song.id, value)}
                    >
                      <SelectTrigger className="w-[100px] bg-[#403d39] border-[#403d39] text-[#fffcf2] h-8 text-sm mr-6">
                        <SelectValue placeholder="Faza" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#252422] border-[#403d39]">
                        <SelectItem value="1" className="text-[#fffcf2]">Faza 1</SelectItem>
                        <SelectItem value="2" className="text-[#fffcf2]">Faza 2</SelectItem>
                        <SelectItem value="3" className="text-[#fffcf2]">Faza 3</SelectItem>
                        <SelectItem value="4" className="text-[#fffcf2]">Faza 4</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </main>
      </div>
    </div>
  )
} 
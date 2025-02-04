"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
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
import { format } from "date-fns"
import { pl } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

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
  const [newProjectName, setNewProjectName] = useState("")
  const [newEndDate, setNewEndDate] = useState<Date>()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [isDeleteSongDialogOpen, setIsDeleteSongDialogOpen] = useState(false)
  const [songToDelete, setSongToDelete] = useState<number | null>(null)
  const [isDeletingSong, setIsDeletingSong] = useState(false)
  const [deleteSongError, setDeleteSongError] = useState<string | null>(null)

  useEffect(() => {
    fetchProject()
  }, [projectId])

  useEffect(() => {
    // Ustaw domyślną datę zakończenia z projektu
    if (project?.endDate) {
      setNewEndDate(new Date(project.endDate))
    }
  }, [project])

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

  const handleUpdateProject = async () => {
    if (!isCurrentUserAdmin) return

    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newProjectName || project?.name,
          endDate: newEndDate ? format(newEndDate, "yyyy-MM-dd") : project?.endDate
        })
      })

      if (!response.ok) {
        throw new Error('Błąd podczas aktualizacji projektu')
      }

      const updatedProject = await response.json()
      setProject(updatedProject)
      setNewProjectName("")
      setNewEndDate(undefined)
    } catch (error) {
      console.error("Error updating project:", error)
    }
  }

  const handleDeleteProject = async () => {
    if (!isCurrentUserAdmin) return

    try {
      setIsDeleting(true)
      setDeleteError(null)

      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Błąd podczas usuwania projektu')
      }

      router.push('/dashboard')
    } catch (error) {
      console.error("Error deleting project:", error)
      setDeleteError(error instanceof Error ? error.message : "Wystąpił błąd podczas usuwania projektu")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDeleteSong = async (songId: number) => {
    try {
      setIsDeletingSong(true)
      setDeleteSongError(null)

      const response = await fetch(`/api/projects/${projectId}/songs/${songId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Błąd podczas usuwania piosenki')
      }

      // Odśwież projekt po usunięciu piosenki
      await fetchProject()
      setIsDeleteSongDialogOpen(false)
      setSongToDelete(null)
    } catch (error) {
      console.error("Error deleting song:", error)
      setDeleteSongError(error.message || 'Wystąpił błąd podczas usuwania piosenki')
    } finally {
      setIsDeletingSong(false)
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
                    <div className="flex items-center gap-4">
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
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => {
                          setSongToDelete(song.id)
                          setIsDeleteSongDialogOpen(true)
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {isCurrentUserAdmin && (
            <Card className="bg-[#403d39] border-none p-6 mt-6">
              <h2 className="text-xl font-bold text-[#fffcf2] mb-6 font-montserrat">Ustawienia projektu</h2>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="projectName" className="text-[#fffcf2] font-roboto">Nazwa projektu</Label>
                  <Input
                    id="projectName"
                    placeholder={project?.name}
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    className="bg-[#252422] border-[#252422] text-[#fffcf2]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate" className="text-[#fffcf2] font-roboto">Data zakończenia</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal bg-[#252422] border-[#252422] text-[#fffcf2] hover:bg-[#252422]/80",
                          !newEndDate && "text-[#ccc5b9]"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {newEndDate ? format(newEndDate, "PPP", { locale: pl }) : <span>Wybierz datę</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-[#252422] border-[#403d39]" align="start">
                      <Calendar
                        mode="single"
                        selected={newEndDate}
                        onSelect={setNewEndDate}
                        initialFocus
                        className="bg-[#252422] text-[#fffcf2]"
                        classNames={{
                          months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                          month: "space-y-4",
                          caption: "flex justify-center pt-1 relative items-center text-[#fffcf2]",
                          caption_label: "text-sm font-medium text-[#fffcf2]",
                          nav: "space-x-1 flex items-center",
                          nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 text-[#fffcf2]",
                          nav_button_previous: "absolute left-1",
                          nav_button_next: "absolute right-1",
                          table: "w-full border-collapse space-y-1",
                          head_row: "flex",
                          head_cell: "text-[#fffcf2] rounded-md w-9 font-normal text-[0.8rem]",
                          row: "flex w-full mt-2",
                          cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-[#403d39] first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                          day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 text-[#fffcf2]",
                          day_selected: "bg-[#eb5e28] text-[#fffcf2] hover:bg-[#eb5e28] hover:text-[#fffcf2] focus:bg-[#eb5e28] focus:text-[#fffcf2]",
                          day_today: "bg-[#403d39] text-[#fffcf2]",
                          day_outside: "text-[#ccc5b9] opacity-50",
                          day_disabled: "text-[#ccc5b9] opacity-50",
                          day_range_middle: "aria-selected:bg-[#403d39] aria-selected:text-[#fffcf2]",
                          day_hidden: "invisible",
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="flex justify-between pt-4">
                  <Button 
                    onClick={handleUpdateProject}
                    className="bg-[#eb5e28] text-[#fffcf2] hover:bg-[#eb5e28]/90"
                  >
                    Zapisz zmiany
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={() => setIsDeleteDialogOpen(true)}
                    className="bg-red-600 text-[#fffcf2] hover:bg-red-700"
                  >
                    Usuń projekt
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </main>
      </div>

      <Dialog 
        open={isDeleteDialogOpen} 
        onOpenChange={(open) => {
          if (!isDeleting) {
            setIsDeleteDialogOpen(open)
            if (!open) {
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

      <Dialog open={isDeleteSongDialogOpen} onOpenChange={setIsDeleteSongDialogOpen}>
        <DialogContent className="bg-[#252422] border-[#403d39]">
          <DialogHeader>
            <DialogTitle className="text-[#fffcf2]">Usuń piosenkę</DialogTitle>
            <DialogDescription className="text-[#d3d1cb]">
              Czy na pewno chcesz usunąć tę piosenkę? Tej operacji nie można cofnąć.
            </DialogDescription>
          </DialogHeader>
          {deleteSongError && (
            <div className="text-red-500 text-sm">{deleteSongError}</div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteSongDialogOpen(false)
                setSongToDelete(null)
              }}
              className="bg-[#403d39] border-[#403d39] text-[#fffcf2] hover:bg-[#4a4642] hover:text-[#fffcf2]"
            >
              Anuluj
            </Button>
            <Button
              variant="destructive"
              onClick={() => songToDelete && handleDeleteSong(songToDelete)}
              disabled={isDeletingSong}
            >
              {isDeletingSong ? "Usuwanie..." : "Usuń"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 
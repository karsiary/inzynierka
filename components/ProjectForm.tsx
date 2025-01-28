"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { X, Plus } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { pl } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { useSession } from "next-auth/react"

interface ProjectFormProps {
  onSuccess: () => void
  onCancel: () => void
  initialData?: any
}

export function ProjectForm({ onSuccess, onCancel, initialData }: ProjectFormProps) {
  const router = useRouter()
  const session = useSession()
  const [activeTab, setActiveTab] = useState("details")
  const [name, setName] = useState(initialData?.name || "")
  const [description, setDescription] = useState(initialData?.description || "")
  const [status, setStatus] = useState<string>(initialData?.status || "active")
  const [startDate, setStartDate] = useState<Date | undefined>(
    initialData?.startDate ? new Date(initialData.startDate) : undefined,
  )
  const [endDate, setEndDate] = useState<Date | undefined>(
    initialData?.endDate ? new Date(initialData.endDate) : undefined,
  )
  const [budgetType, setBudgetType] = useState<"global" | "phases">("global")
  const [budgetGlobal, setBudgetGlobal] = useState(initialData?.budgetGlobal || "")
  const [budgetPhase1, setBudgetPhase1] = useState(initialData?.budgetPhase1 || "")
  const [budgetPhase2, setBudgetPhase2] = useState(initialData?.budgetPhase2 || "")
  const [budgetPhase3, setBudgetPhase3] = useState(initialData?.budgetPhase3 || "")
  const [budgetPhase4, setBudgetPhase4] = useState(initialData?.budgetPhase4 || "")
  const [teams, setTeams] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [songs, setSongs] = useState<any[]>([])
  const [searchTeam, setSearchTeam] = useState("")
  const [searchUser, setSearchUser] = useState("")
  const [newSongTitle, setNewSongTitle] = useState("")
  const [searchSongAuthor, setSearchSongAuthor] = useState("")
  const [currentSongAuthors, setCurrentSongAuthors] = useState<any[]>([])
  const [songAuthorSearchResults, setSongAuthorSearchResults] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [teamSearchResults, setTeamSearchResults] = useState<any[]>([])
  const [userSearchResults, setUserSearchResults] = useState<any[]>([])

  // Dodanie stanów walidacji
  const [isNameInvalid, setIsNameInvalid] = useState(false)
  const [isStartDateInvalid, setIsStartDateInvalid] = useState(false)
  const [isEndDateInvalid, setIsEndDateInvalid] = useState(false)
  const [isStatusInvalid, setIsStatusInvalid] = useState(false)
  const [isSongsInvalid, setIsSongsInvalid] = useState(false)

  const sampleAuthors = ["Jan Kowalski", "Anna Nowak", "Piotr Wiśniewski", "Maria Kowalczyk", "Tomasz Lewandowski"]

  const handleAddTeam = (team: any) => {
    if (!teams.find(t => t.id === team.id)) {
      setTeams([...teams, team])
    }
    setSearchTeam("")
    setTeamSearchResults([])
  }

  const handleRemoveTeam = (teamId: string) => {
    setTeams(teams.filter(team => team.id !== teamId))
  }

  const handleAddUser = (user: any) => {
    if (!users.find(u => u.id === user.id)) {
      setUsers([...users, user])
    }
    setSearchUser("")
    setUserSearchResults([])
  }

  const handleRemoveUser = (userId: string) => {
    setUsers(users.filter(user => user.id !== userId))
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

  const handleAddSong = () => {
    if (newSongTitle && currentSongAuthors.length > 0) {
      setSongs([...songs, { 
        title: newSongTitle, 
        authors: currentSongAuthors
      }])
      setNewSongTitle("")
      setCurrentSongAuthors([])
    }
  }

  const handleRemoveSong = (index: number) => {
    setSongs(songs.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Walidacja wszystkich pól jednocześnie
    const isFormValid = 
      name.trim() && 
      startDate && 
      endDate && 
      status &&
      songs.length > 0

    // Ustawiamy stany walidacji dla wszystkich pól
    setIsNameInvalid(!name.trim())
    setIsStartDateInvalid(!startDate)
    setIsEndDateInvalid(!endDate)
    setIsStatusInvalid(!status)
    setIsSongsInvalid(songs.length === 0)

    if (!isFormValid) {
      setError("Wypełnij wszystkie wymagane pola")
      return
    }

    try {
      setIsLoading(true)

    const projectData = {
      name,
      description,
      status,
      startDate: startDate?.toISOString(),
      endDate: endDate?.toISOString(),
      budgetType,
      budgetGlobal: budgetType === "global" ? Number(budgetGlobal) : undefined,
      budgetPhases:
        budgetType === "phases"
          ? [Number(budgetPhase1), Number(budgetPhase2), Number(budgetPhase3), Number(budgetPhase4)]
          : undefined,
      teams,
      users,
      songs,
    }

      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(projectData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Wystąpił błąd podczas tworzenia projektu")
      }

      const project = await response.json()
      toast.success("Projekt został utworzony")
      onSuccess()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const searchTeams = async (query: string) => {
    if (!query) {
      setTeamSearchResults([])
      return
    }

    try {
      const response = await fetch(`/api/teams/search?q=${encodeURIComponent(query)}`)
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Błąd wyszukiwania zespołów")
      }
      const data = await response.json()
      setTeamSearchResults(data)
    } catch (error) {
      console.error("Error searching teams:", error)
      toast.error("Wystąpił błąd podczas wyszukiwania zespołów")
      setTeamSearchResults([])
    }
  }

  const searchUsers = async (query: string) => {
    if (!query) {
      setUserSearchResults([])
      return
    }

    try {
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`)
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Błąd wyszukiwania użytkowników")
      }
      const data = await response.json()
      setUserSearchResults(data)
    } catch (error) {
      console.error("Error searching users:", error)
      toast.error("Wystąpił błąd podczas wyszukiwania użytkowników")
      setUserSearchResults([])
    }
  }

  const searchSongAuthors = async (query: string) => {
    if (!query) {
      setSongAuthorSearchResults([])
      return
    }

    try {
      // Wyszukaj użytkowników
      const usersResponse = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`)
      if (!usersResponse.ok) {
        throw new Error("Błąd wyszukiwania użytkowników")
      }
      const users = await usersResponse.json()

      // Wyszukaj zespoły
      const teamsResponse = await fetch(`/api/teams/search?q=${encodeURIComponent(query)}`)
      if (!teamsResponse.ok) {
        throw new Error("Błąd wyszukiwania zespołów")
      }
      const teams = await teamsResponse.json()

      // Połącz wyniki, dodając typ dla rozróżnienia
      const results = [
        ...users.map((user: any) => ({ ...user, type: 'user' })),
        ...teams.map((team: any) => ({ ...team, type: 'team' }))
      ]

      setSongAuthorSearchResults(results)
    } catch (error) {
      console.error("Error searching authors:", error)
      toast.error("Wystąpił błąd podczas wyszukiwania autorów")
      setSongAuthorSearchResults([])
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full bg-[#403d39] border-none mb-6">
          <TabsTrigger
            value="details"
            className="flex-1 data-[state=active]:bg-[#eb5e28] data-[state=active]:text-white"
          >
            Szczegóły
          </TabsTrigger>
          <TabsTrigger value="team" className="flex-1 data-[state=active]:bg-[#eb5e28] data-[state=active]:text-white">
            Zespół
          </TabsTrigger>
          <TabsTrigger value="songs" className="flex-1 data-[state=active]:bg-[#eb5e28] data-[state=active]:text-white">
            Piosenki
          </TabsTrigger>
        </TabsList>

        <ScrollArea className="h-[60vh]">
          <div className="p-6">
            <TabsContent value="details" className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-[#fffcf2] font-roboto">
                  Nazwa projektu
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={cn(
                    "bg-[#403d39] border-[#403d39] text-[#fffcf2]",
                    isNameInvalid && "border-red-500 focus:border-red-500"
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-[#fffcf2] font-roboto">
                  Opis projektu
                </Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="bg-[#403d39] border-[#403d39] text-[#fffcf2] min-h-[100px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate" className="text-[#fffcf2] font-roboto">
                    Data rozpoczęcia
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal bg-[#403d39] border-[#403d39] text-[#fffcf2]",
                          !startDate && "text-[#ccc5b9]",
                          isStartDateInvalid && "border-red-500 focus:border-red-500"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, "PPP", { locale: pl }) : <span>Wybierz datę</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-[#252422] border border-[#403d39]">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={setStartDate}
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
                <div className="space-y-2">
                  <Label htmlFor="endDate" className="text-[#fffcf2] font-roboto">
                    Data zakończenia
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal bg-[#403d39] border-[#403d39] text-[#fffcf2]",
                          !endDate && "text-[#ccc5b9]",
                          isEndDateInvalid && "border-red-500 focus:border-red-500"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, "PPP", { locale: pl }) : <span>Wybierz datę</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-[#252422] border border-[#403d39]">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={setEndDate}
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="status" className="text-[#fffcf2] font-roboto">
                  Status projektu
                </Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger 
                    className={cn(
                      "bg-[#403d39] border-[#403d39] text-[#fffcf2]",
                      isStatusInvalid && "border-red-500 focus:border-red-500"
                    )}
                  >
                    <SelectValue placeholder="Wybierz status" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#252422] border-[#403d39]">
                    <SelectItem value="active" className="text-[#fffcf2]">
                      Aktywny
                    </SelectItem>
                    <SelectItem value="completed" className="text-[#fffcf2]">
                      Zakończony
                    </SelectItem>
                    <SelectItem value="on_hold" className="text-[#fffcf2]">
                      Wstrzymany
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <Label className="text-[#fffcf2] font-roboto">Typ budżetu</Label>
                  <Switch
                    checked={budgetType === "phases"}
                    onCheckedChange={(checked) => setBudgetType(checked ? "phases" : "global")}
                  />
                </div>

                {budgetType === "global" ? (
                  <div className="space-y-2">
                    <Label htmlFor="budgetGlobal" className="text-[#fffcf2] font-roboto">
                      Budżet globalny
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#ccc5b9]">PLN</span>
                      <Input
                        id="budgetGlobal"
                        type="number"
                        value={budgetGlobal}
                        onChange={(e) => setBudgetGlobal(e.target.value)}
                        className="bg-[#403d39] border-[#403d39] text-[#fffcf2] pl-12"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { id: "budgetPhase1", label: "Budżet faza 1", value: budgetPhase1, setter: setBudgetPhase1 },
                      { id: "budgetPhase2", label: "Budżet faza 2", value: budgetPhase2, setter: setBudgetPhase2 },
                      { id: "budgetPhase3", label: "Budżet faza 3", value: budgetPhase3, setter: setBudgetPhase3 },
                      { id: "budgetPhase4", label: "Budżet faza 4", value: budgetPhase4, setter: setBudgetPhase4 },
                    ].map((phase) => (
                      <div key={phase.id} className="space-y-2">
                        <Label htmlFor={phase.id} className="text-[#fffcf2] font-roboto">
                          {phase.label}
                        </Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#ccc5b9]">PLN</span>
                          <Input
                            id={phase.id}
                            type="number"
                            value={phase.value}
                            onChange={(e) => phase.setter(e.target.value)}
                            className="bg-[#403d39] border-[#403d39] text-[#fffcf2] pl-12"
                            placeholder="0.00"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="team" className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[#fffcf2] font-roboto">Dodaj zespół</Label>
                  <div className="space-y-2">
                    <Input
                      value={searchTeam}
                      onChange={(e) => {
                        setSearchTeam(e.target.value)
                        searchTeams(e.target.value)
                      }}
                      placeholder="Wyszukaj zespół"
                      className="bg-[#403d39] border-[#403d39] text-[#fffcf2]"
                    />
                    {teamSearchResults.length > 0 && searchTeam && (
                      <div className="border rounded-md p-2 bg-[#252422] border-[#403d39]">
                        {teamSearchResults.map((team) => (
                          <div
                            key={team.id}
                            className="p-2 hover:bg-[#403d39] cursor-pointer text-[#fffcf2]"
                            onClick={() => handleAddTeam(team)}
                          >
                          {team.name}
                          </div>
                      ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {teams.map((team) => (
                    <Badge
                      key={team.id}
                      variant="secondary"
                      className="bg-[#403d39] text-[#fffcf2] flex items-center gap-1"
                    >
                      {team.name}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 hover:bg-transparent"
                        onClick={() => handleRemoveTeam(team.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[#fffcf2] font-roboto">Dodaj użytkownika</Label>
                  <div className="space-y-2">
                    <Input
                      value={searchUser}
                      onChange={(e) => {
                        setSearchUser(e.target.value)
                        searchUsers(e.target.value)
                      }}
                      placeholder="Wyszukaj użytkownika"
                      className="bg-[#403d39] border-[#403d39] text-[#fffcf2]"
                    />
                    {userSearchResults.length > 0 && searchUser && (
                      <div className="border rounded-md p-2 bg-[#252422] border-[#403d39]">
                        {userSearchResults.map((user) => (
                          <div
                            key={user.id}
                            className="p-2 hover:bg-[#403d39] cursor-pointer text-[#fffcf2]"
                            onClick={() => handleAddUser(user)}
                          >
                            {user.name} ({user.email})
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {users.map((user) => (
                    <Badge
                      key={user.id}
                      variant="secondary"
                      className="bg-[#403d39] text-[#fffcf2] flex items-center gap-1"
                    >
                      {user.name}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 hover:bg-transparent"
                        onClick={() => handleRemoveUser(user.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="songs" className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newSongTitle" className="text-[#fffcf2] font-roboto">
                    Tytuł piosenki
                  </Label>
                  <Input
                    id="newSongTitle"
                    value={newSongTitle}
                    onChange={(e) => setNewSongTitle(e.target.value)}
                    className={cn(
                      "bg-[#403d39] border-[#403d39] text-[#fffcf2]",
                      isSongsInvalid && songs.length === 0 && "border-red-500 focus:border-red-500"
                    )}
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
                      placeholder="Wyszukaj autora (użytkownik lub zespół)"
                      className="bg-[#403d39] border-[#403d39] text-[#fffcf2]"
                    />
                    {songAuthorSearchResults.length > 0 && searchSongAuthor && (
                      <div className="border rounded-md p-2 bg-[#252422] border-[#403d39]">
                        {songAuthorSearchResults.map((author) => (
                          <div
                            key={`${author.type}-${author.id}`}
                            className="p-2 hover:bg-[#403d39] cursor-pointer text-[#fffcf2]"
                            onClick={() => handleAddSongAuthor(author)}
                          >
                            {author.name} ({author.type === 'user' ? 'Użytkownik' : 'Zespół'})
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {currentSongAuthors.map((author) => (
                      <Badge
                        key={`${author.type}-${author.id}`}
                        variant="secondary"
                        className="bg-[#403d39] text-[#fffcf2] flex items-center gap-1"
                      >
                        {author.name} ({author.type === 'user' ? 'Użytkownik' : 'Zespół'})
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0 hover:bg-transparent"
                          onClick={() => handleRemoveSongAuthor(author.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </div>

                <Button 
                  type="button" 
                  onClick={handleAddSong} 
                  className="bg-[#eb5e28] text-white hover:bg-[#eb5e28]/90"
                  disabled={!newSongTitle || currentSongAuthors.length === 0}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Dodaj piosenkę
                </Button>
              </div>
              <div className="space-y-2">
                {songs.map((song, index) => (
                  <div key={index} className="flex items-center justify-between bg-[#403d39] p-3 rounded-lg">
                    <div>
                      <p className="text-[#fffcf2] font-medium">{song.title}</p>
                      <p className="text-[#ccc5b9] text-sm">
                        {song.authors.map((author: any) => author.name).join(", ")}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveSong(index)}
                      className="text-[#ccc5b9] hover:text-[#eb5e28]"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </TabsContent>
          </div>
        </ScrollArea>
      </Tabs>

      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

      <DialogFooter className="gap-2 sm:gap-0">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="border-2 hover:bg-[#403d39] hover:text-[#fffcf2]"
        >
          Anuluj
        </Button>
        <Button type="submit" className="bg-[#eb5e28] text-white hover:bg-[#eb5e28]/90" disabled={isLoading}>
          {isLoading ? "Tworzenie..." : "Utwórz projekt"}
        </Button>
      </DialogFooter>
    </form>
  )
}


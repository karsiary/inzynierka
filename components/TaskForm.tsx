"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { pl } from "date-fns/locale"
import { CalendarIcon, Plus, Trash2, X, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Song } from "@prisma/client"
import { useSession } from "next-auth/react"

interface ChecklistItem {
  id: number
  text: string
  completed: boolean
}

interface Comment {
  id: number
  text: string
  author: string
  timestamp: string
  content?: string
  userId?: string
  created_at?: string
  user?: {
    name: string
    image: string | null
  }
}

interface User {
  id: string
  name: string
  email: string
  image?: string
}

interface TaskData {
  id?: number
  title: string
  description: string | null
  status: string
  priority: string
  start_date?: string | null
  end_date?: string | null
  due_date: string | null
  phase_id: string
  project_id: number
  song_id: number | null
  created_by: string
  activityType: string | null
  assigned_to: string[] | null
  responsible_user: string | null
  planned_budget: number | null
  actual_budget: number | null
  checklist: ChecklistItem[] | null
  comments: Comment[] | null
  checklistItems?: {
    id: number
    content: string
    isCompleted: boolean
    taskId: number
  }[]
}

interface BaseTaskFormProps {
  onSubmit: (taskData: TaskData) => void
  selectedSong: string | null
  songs: Song[]
  projectId: string
  phaseId: string
  defaultStatus?: string
}

interface NewTaskFormProps extends BaseTaskFormProps {}

interface EditTaskFormProps extends BaseTaskFormProps {
  taskToEdit: TaskData
  onDelete: () => void
}

function BaseTaskForm({
  taskToEdit, 
  onSubmit, 
  onDelete, 
  selectedSong, 
  songs = [],
  projectId,
  phaseId,
  defaultStatus,
  isEditMode
}: BaseTaskFormProps & { taskToEdit?: TaskData | null; onDelete?: () => void; isEditMode: boolean }) {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState("details")
  const [title, setTitle] = useState(taskToEdit?.title || "")
  const [description, setDescription] = useState(taskToEdit?.description || "")
  const [startDate, setStartDate] = useState<Date | undefined>(
    taskToEdit?.start_date ? new Date(taskToEdit.start_date) : undefined,
  )
  const [endDate, setEndDate] = useState<Date | undefined>(
    taskToEdit?.end_date ? new Date(taskToEdit.end_date) : undefined,
  )
  const [endTime, setEndTime] = useState(
    taskToEdit?.end_date ? format(new Date(taskToEdit.end_date), "HH:mm") : ""
  )
  const [status, setStatus] = useState(taskToEdit?.status || defaultStatus || "todo")
  const [priority, setPriority] = useState(taskToEdit?.priority || "Średni")
  const [assignedTo, setAssignedTo] = useState(taskToEdit?.assigned_to || [])
  const [responsibleUser, setResponsibleUser] = useState(taskToEdit?.responsible_user || "")
  const [responsibleUserDetails, setResponsibleUserDetails] = useState<User | null>(null)
  const [searchResponsibleUser, setSearchResponsibleUser] = useState("")
  const [responsibleUserResults, setResponsibleUserResults] = useState<User[]>([])
  const [plannedBudget, setPlannedBudget] = useState(taskToEdit?.planned_budget?.toString() || "")
  const [actualBudget, setActualBudget] = useState(taskToEdit?.actual_budget?.toString() || "")
  const [checklist, setChecklist] = useState<ChecklistItem[]>(
    taskToEdit?.checklistItems 
      ? taskToEdit.checklistItems.map((item: any) => ({
          id: item.id,
          text: item.content,
          completed: item.isCompleted
        }))
      : []
  )
  const [newChecklistItem, setNewChecklistItem] = useState("")
  const [comments, setComments] = useState<Comment[]>(
    taskToEdit?.comments 
      ? taskToEdit.comments.map((comment: any) => ({
          id: comment.id,
          text: comment.content || comment.text,
          author: comment.user?.name || "Użytkownik",
          timestamp: comment.created_at || new Date().toISOString()
        }))
      : []
  )
  const [newComment, setNewComment] = useState("")
  const [error, setError] = useState("")
  const [isTitleInvalid, setIsTitleInvalid] = useState(false)
  const [isActivityTypeInvalid, setIsActivityTypeInvalid] = useState(false)
  const [isSongInvalid, setIsSongInvalid] = useState(false)
  const [isStatusInvalid, setIsStatusInvalid] = useState(false)
  const [isStartDateInvalid, setIsStartDateInvalid] = useState(false)
  const [isEndDateInvalid, setIsEndDateInvalid] = useState(false)
  const [isResponsibleUserInvalid, setIsResponsibleUserInvalid] = useState(false)
  const [isPlannedBudgetInvalid, setIsPlannedBudgetInvalid] = useState(false)
  const [songId, setSongId] = useState(
    taskToEdit?.song_id 
      ? taskToEdit.song_id.toString() 
      : (selectedSong && selectedSong !== "all" ? selectedSong.toString() : "")
  )
  const [activityType, setActivityType] = useState(taskToEdit?.activityType || "")

  useEffect(() => {
    if (taskToEdit?.activityType) {
      setActivityType(taskToEdit.activityType)
    }
  }, [taskToEdit])

  useEffect(() => {
    if (selectedSong && selectedSong !== "all" && !taskToEdit) {
      setSongId(selectedSong.toString());
    }
  }, [selectedSong, taskToEdit]);

  useEffect(() => {
    if (searchResponsibleUser.length >= 2) {
      searchProjectUsers()
    } else {
      setResponsibleUserResults([])
    }
  }, [searchResponsibleUser])

  useEffect(() => {
    if (responsibleUser) {
      fetchResponsibleUserDetails()
    }
  }, [responsibleUser])

  const searchProjectUsers = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/users`)
      if (!response.ok) {
        throw new Error("Błąd podczas wyszukiwania użytkowników")
      }
      const users = await response.json()
      setResponsibleUserResults(users.filter((user: User) => 
        user.name.toLowerCase().includes(searchResponsibleUser.toLowerCase()) ||
        user.email.toLowerCase().includes(searchResponsibleUser.toLowerCase())
      ))
    } catch (error) {
      console.error("Error searching project users:", error)
      setError("Wystąpił błąd podczas wyszukiwania użytkowników")
    }
  }

  const fetchResponsibleUserDetails = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/users`)
      if (!response.ok) {
        throw new Error("Błąd podczas pobierania danych użytkownika")
      }
      const users = await response.json()
      const user = users.find((u: any) => u.id === responsibleUser)
      if (user) {
        setResponsibleUserDetails(user)
      }
    } catch (error) {
      console.error("Error fetching responsible user details:", error)
    }
  }

  const handleSelectResponsibleUser = (user: any) => {
    setResponsibleUser(user.id)
    setResponsibleUserDetails(user)
    setSearchResponsibleUser("")
    setResponsibleUserResults([])
  }

  const handleRemoveResponsibleUser = () => {
    setResponsibleUser("")
    setResponsibleUserDetails(null)
  }

  console.log("TaskForm - otrzymane piosenki:", songs)
  console.log("TaskForm - wybrany song:", selectedSong)
  console.log("TaskForm - aktualny songId:", songId)

  // Mock team members data - replace with actual data from your backend
  const teamMembers = [
    { id: "1", name: "Jan Kowalski", role: "Producent" },
    { id: "2", name: "Anna Nowak", role: "Inżynier dźwięku" },
    { id: "3", name: "Piotr Wiśniewski", role: "Artysta" },
  ]

  const handleAddChecklistItem = () => {
    if (newChecklistItem.trim()) {
      setChecklist([...checklist, { id: Date.now(), text: newChecklistItem, completed: false }])
      setNewChecklistItem("")
    }
  }

  const handleToggleChecklistItem = (id: number) => {
    setChecklist(checklist.map((item: ChecklistItem) => (item.id === id ? { ...item, completed: !item.completed } : item)))
  }

  const handleAddComment = () => {
    if (newComment.trim() && session?.user) {
      const now = new Date().toISOString()
      setComments([
        ...comments,
        {
          id: Date.now(),
          text: newComment,
          author: session.user.name || "Użytkownik",
          timestamp: now
        },
      ])
      setNewComment("")
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Walidacja wszystkich pól jednocześnie
    const isFormValid = 
      title.trim() && 
      activityType && 
      status && 
      songId && 
      startDate && 
      endDate && 
      endTime && 
      responsibleUser && 
      (!isEditMode ? (plannedBudget !== "" && !isNaN(parseFloat(plannedBudget))) : true)

    // Ustawiamy stany walidacji dla wszystkich pól
    setIsTitleInvalid(!title.trim())
    setIsActivityTypeInvalid(!activityType)
    setIsStatusInvalid(!status)
    setIsSongInvalid(!songId)
    setIsStartDateInvalid(!startDate)
    setIsEndDateInvalid(!endDate || !endTime)
    setIsResponsibleUserInvalid(!responsibleUser)
    setIsPlannedBudgetInvalid(!isEditMode && (plannedBudget === "" || isNaN(parseFloat(plannedBudget))))

    if (!isFormValid) {
      return;
    }

    // Łączymy datę z godziną
    const endDateTime = endDate ? new Date(
      endDate.getFullYear(),
      endDate.getMonth(),
      endDate.getDate(),
      parseInt(endTime.split(':')[0]),
      parseInt(endTime.split(':')[1])
    ) : undefined;

    const taskData: TaskData = {
      ...(taskToEdit?.id ? { id: taskToEdit.id } : {}),
      title: title.trim(),
      description: description.trim() || null,
      status,
      priority,
      start_date: startDate ? startDate.toISOString() : null,
      due_date: endDateTime ? endDateTime.toISOString() : null,
      end_date: endDateTime ? endDateTime.toISOString() : null,
      phase_id: phaseId,
      project_id: parseInt(projectId),
      song_id: songId ? parseInt(songId) : null,
      created_by: taskToEdit?.created_by || "",
      activityType: activityType || null,
      responsible_user: responsibleUser || null,
      planned_budget: plannedBudget ? parseFloat(plannedBudget) : null,
      actual_budget: actualBudget ? parseFloat(actualBudget) : null,
      checklist: checklist.length > 0 ? checklist : null,
      comments: comments.length > 0 ? comments : null,
      assigned_to: assignedTo.length > 0 ? assignedTo : null
    }

    console.log("Wysyłane dane zadania:", taskData)
    onSubmit(taskData)
  }

  const getUserInitials = (name: string | null) => {
    if (!name) return "u"
    return name.split(" ").map(n => n[0].toLowerCase()).join("")
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
          <TabsTrigger
            value="checklist"
            className="flex-1 data-[state=active]:bg-[#eb5e28] data-[state=active]:text-white"
          >
            Checklista
          </TabsTrigger>
          <TabsTrigger
            value="comments"
            className="flex-1 data-[state=active]:bg-[#eb5e28] data-[state=active]:text-white"
          >
            Komentarze
          </TabsTrigger>
        </TabsList>

        <ScrollArea className="h-[60vh]">
          <div className="p-6">
            <TabsContent value="details" className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-[#fffcf2] font-roboto">
                    Nazwa zadania
                  </Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className={cn(
                      "bg-[#403d39] border-[#403d39] text-[#fffcf2]",
                      isTitleInvalid && "border-red-500 focus:border-red-500"
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="activityType" className="text-[#fffcf2] font-roboto">
                    Rodzaj czynności
                  </Label>
                  <Select 
                    value={activityType} 
                    onValueChange={(value) => setActivityType(value)}
                  >
                    <SelectTrigger 
                      id="activityType" 
                      className={cn(
                        "bg-[#403d39] border-[#403d39] text-[#fffcf2]",
                        isActivityTypeInvalid && "border-red-500 focus:border-red-500"
                      )}
                    >
                      <SelectValue placeholder="Wybierz rodzaj czynności" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#252422] border-[#403d39]">
                      <SelectItem value="Mastering" className="text-[#fffcf2]">
                        Mastering
                      </SelectItem>
                      <SelectItem value="Nagrywanie" className="text-[#fffcf2]">
                        Nagrywanie
                      </SelectItem>
                      <SelectItem value="Miks" className="text-[#fffcf2]">
                        Miks
                      </SelectItem>
                      <SelectItem value="Spotkanie" className="text-[#fffcf2]">
                        Spotkanie
                      </SelectItem>
                      <SelectItem value="Publishing" className="text-[#fffcf2]">
                        Publishing
                      </SelectItem>
                      <SelectItem value="Inne" className="text-[#fffcf2]">
                        Inne
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status" className="text-[#fffcf2] font-roboto">
                    Status
                  </Label>
                  <Select value={status} onValueChange={(value) => setStatus(value)} disabled>
                    <SelectTrigger 
                      className={cn(
                        "bg-[#403d39] border-[#403d39] text-[#fffcf2] opacity-50 cursor-not-allowed",
                        isStatusInvalid && "border-red-500 focus:border-red-500"
                      )}
                    >
                      <SelectValue placeholder="Wybierz status">
                        {status === "todo" && "Do zrobienia"}
                        {status === "inProgress" && "W trakcie"}
                        {status === "done" && "Zakończone"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="bg-[#252422] border-[#403d39]">
                      <SelectItem value="todo" className="text-[#fffcf2]">
                        Do zrobienia
                      </SelectItem>
                      <SelectItem value="inProgress" className="text-[#fffcf2]">
                        W trakcie
                      </SelectItem>
                      <SelectItem value="done" className="text-[#fffcf2]">
                        Zakończone
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="songId" className="text-[#fffcf2] font-roboto">
                    Piosenka
                  </Label>
                  <Select 
                    value={songId} 
                    onValueChange={(value) => setSongId(value)}
                  >
                    <SelectTrigger 
                      className={cn(
                        "bg-[#403d39] border-[#403d39] text-[#fffcf2]",
                        isSongInvalid && "border-red-500 focus:border-red-500"
                      )}
                    >
                      <SelectValue placeholder="Wybierz piosenkę">
                        {songs.find(song => song.id.toString() === songId)?.title}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="bg-[#252422] border-[#403d39]">
                      {songs.map((song) => (
                        <SelectItem key={song.id} value={song.id.toString()} className="text-[#fffcf2]">
                          {song.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="startDate" className="text-[#fffcf2] font-roboto">
                    Data rozpoczęcia
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal bg-[#403d39] border-[#403d39] text-[#fffcf2] hover:bg-[#403d39]/80",
                          !startDate && "text-muted-foreground",
                          isStartDateInvalid && "border-red-500 focus:border-red-500"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, "PPP", { locale: pl }) : <span>Wybierz datę</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-[#252422] border-[#403d39]" align="start">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={(date) => setStartDate(date)}
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
                    Data i godzina zakończenia
                  </Label>
                  <div className="relative">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal bg-[#403d39] border-[#403d39] text-[#fffcf2] hover:bg-[#403d39]/80",
                            !endDate && "text-muted-foreground",
                            isEndDateInvalid && "border-red-500 focus:border-red-500"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          <div className="flex-1">
                            {endDate ? format(endDate, "PPP", { locale: pl }) : <span>Wybierz datę</span>}
                          </div>
                          {endTime && <span className="mr-8">{endTime}</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-[#252422] border-[#403d39]" align="start">
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
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute right-2 top-1/2 -translate-y-1/2 hover:bg-transparent hover:text-[#eb5e28]"
                        >
                          <Clock className="h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-48 p-0 bg-[#252422] border-[#403d39]">
                        <ScrollArea className="h-[300px]">
                          <div className="p-2">
                            {Array.from({ length: 24 }, (_, i) => (
                              <div
                                key={i}
                                className={cn(
                                  "px-3 py-2 text-sm rounded-md cursor-pointer hover:bg-[#403d39] text-[#fffcf2]",
                                  endTime === `${i.toString().padStart(2, "0")}:00` && "bg-[#eb5e28]"
                                )}
                                onClick={() => setEndTime(`${i.toString().padStart(2, "0")}:00`)}
                              >
                                {`${i.toString().padStart(2, "0")}:00`}
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority" className="text-[#fffcf2] font-roboto">
                    Priorytet
                  </Label>
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger className="bg-[#403d39] border-[#403d39] text-[#fffcf2]">
                      <SelectValue placeholder="Wybierz priorytet" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#252422] border-[#403d39]">
                      <SelectItem value="Niski" className="text-[#fffcf2]">
                        Niski
                      </SelectItem>
                      <SelectItem value="Średni" className="text-[#fffcf2]">
                        Średni
                      </SelectItem>
                      <SelectItem value="Wysoki" className="text-[#fffcf2]">
                        Wysoki
                      </SelectItem>
                      <SelectItem value="Krytyczny" className="text-[#fffcf2]">
                        Krytyczny
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="responsibleUser" className="text-[#fffcf2] font-roboto">
                    Osoba odpowiedzialna
                  </Label>
                  {responsibleUserDetails ? (
                    <div className={cn(
                      "flex items-center justify-between p-2 bg-[#403d39] rounded-md",
                      isResponsibleUserInvalid && "border border-red-500"
                    )}>
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full bg-[#eb5e28] flex items-center justify-center">
                          <span className="text-sm font-semibold text-[#fffcf2] leading-none mt-0.5">
                            {getUserInitials(responsibleUserDetails.name)}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[#fffcf2]">{responsibleUserDetails.name}</p>
                          <p className="text-xs text-[#ccc5b9]">{responsibleUserDetails.email}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleRemoveResponsibleUser}
                        className="h-8 w-8 p-0 hover:bg-[#eb5e28]/20"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="relative">
                      <Input
                        id="responsibleUser"
                        value={searchResponsibleUser}
                        onChange={(e) => setSearchResponsibleUser(e.target.value)}
                        placeholder="Wyszukaj osobę..."
                        className={cn(
                          "bg-[#403d39] border-[#403d39] text-[#fffcf2]",
                          isResponsibleUserInvalid && "border-red-500 focus:border-red-500"
                        )}
                      />
                      {responsibleUserResults.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-[#252422] border border-[#403d39] rounded-md shadow-lg">
                          <ScrollArea className="h-[200px] rounded-md">
                            <div className="p-2">
                              {responsibleUserResults.map((user) => (
                                <div
                                  key={user.id}
                                  className="flex items-center justify-between p-2 cursor-pointer hover:bg-[#403d39] rounded-md"
                                  onClick={() => handleSelectResponsibleUser(user)}
                                >
                                  <div className="flex items-center space-x-2">
                                    <div className="w-8 h-8 rounded-full bg-[#eb5e28] flex items-center justify-center">
                                      <span className="text-sm font-semibold text-[#fffcf2] leading-none mt-0.5">
                                        {getUserInitials(user.name)}
                                      </span>
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium text-[#fffcf2]">{user.name}</p>
                                      <p className="text-xs text-[#ccc5b9]">{user.email}</p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </ScrollArea>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="col-span-2 space-y-2">
                  <Label htmlFor="description" className="text-[#fffcf2] font-roboto">
                    Opis zadania
                  </Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="bg-[#403d39] border-[#403d39] text-[#fffcf2] min-h-[100px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="plannedBudget" className="text-[#fffcf2] font-roboto">
                    Budżet planowany
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#ccc5b9]">PLN</span>
                    <Input
                      id="plannedBudget"
                      type="number"
                      value={plannedBudget}
                      onChange={(e) => setPlannedBudget(e.target.value)}
                      disabled={isEditMode}
                      className={cn(
                        "bg-[#403d39] border-[#403d39] text-[#fffcf2] pl-12",
                        isPlannedBudgetInvalid && "border-red-500 focus:border-red-500",
                        isEditMode && "opacity-50 cursor-not-allowed"
                      )}
                    />
                  </div>
                </div>

                {taskToEdit && (
                  <div className="space-y-2">
                    <Label htmlFor="actualBudget" className="text-[#fffcf2] font-roboto">
                      Budżet rzeczywisty
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#ccc5b9]">PLN</span>
                      <Input
                        id="actualBudget"
                        type="number"
                        value={actualBudget}
                        onChange={(e) => setActualBudget(e.target.value)}
                        className="bg-[#403d39] border-[#403d39] text-[#fffcf2] pl-12"
                      />
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="checklist" className="space-y-6">
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={newChecklistItem}
                    onChange={(e) => setNewChecklistItem(e.target.value)}
                    placeholder="Dodaj nowy element listy..."
                    className="bg-[#403d39] border-[#403d39] text-[#fffcf2]"
                  />
                  <Button
                    type="button"
                    onClick={handleAddChecklistItem}
                    className="bg-[#eb5e28] text-white hover:bg-[#eb5e28]/90"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-2">
                  {checklist.map((item: ChecklistItem) => (
                    <div key={item.id} className="flex items-center gap-2 bg-[#403d39] p-3 rounded-lg">
                      <Checkbox
                        checked={item.completed}
                        onCheckedChange={() => handleToggleChecklistItem(item.id)}
                        className="border-[#ccc5b9] data-[state=checked]:bg-[#eb5e28] data-[state=checked]:border-[#eb5e28]"
                      />
                      <span className={cn("flex-1", item.completed && "line-through text-[#ccc5b9]")}>{item.text}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setChecklist(checklist.filter((i: ChecklistItem) => i.id !== item.id))}
                        className="text-[#ccc5b9] hover:text-[#eb5e28]"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="comments" className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-4">
                  {comments.map((comment: Comment) => (
                    <div key={comment.id} className="bg-[#403d39] p-4 rounded-lg space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-[#fffcf2]">{comment.author}</span>
                        <span className="text-sm text-[#ccc5b9]">
                          {format(new Date(comment.timestamp), "dd.MM.yyyy HH:mm", { locale: pl })}
                        </span>
                      </div>
                      <p className="text-[#ccc5b9]">{comment.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </div>
        </ScrollArea>
      </Tabs>

      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

      {activeTab === "comments" && (
        <div className="flex gap-2">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Dodaj komentarz..."
            className="bg-[#403d39] border-[#403d39] text-[#fffcf2] min-h-[100px]"
          />
          <Button
            type="button"
            onClick={handleAddComment}
            className="bg-[#eb5e28] text-white hover:bg-[#eb5e28]/90"
          >
            Dodaj
          </Button>
        </div>
      )}

      <div className="flex justify-end gap-4">
        {onDelete && (
          <Button
            type="button"
            variant="destructive"
            onClick={onDelete}
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Usuń zadanie
          </Button>
        )}
        <Button
          type="submit"
          className="bg-[#eb5e28] text-white hover:bg-[#eb5e28]/90"
        >
          {taskToEdit ? "Zapisz zmiany" : "Dodaj zadanie"}
        </Button>
      </div>
    </form>
  )
}

export function NewTaskForm(props: NewTaskFormProps) {
  return (
    <BaseTaskForm
      {...props}
      taskToEdit={null}
      onDelete={undefined}
      isEditMode={false}
    />
  )
}

export function EditTaskForm({ taskToEdit, onDelete, ...props }: EditTaskFormProps) {
  return (
    <BaseTaskForm
      {...props}
      taskToEdit={taskToEdit}
      onDelete={onDelete}
      isEditMode={true}
    />
  )
}

// Eksportujemy również bazowy komponent dla wstecznej kompatybilności
export function TaskForm(props: BaseTaskFormProps & { taskToEdit?: TaskData | null; onDelete?: () => void }) {
  return (
    <BaseTaskForm
      {...props}
      isEditMode={!!props.taskToEdit}
    />
  )
}


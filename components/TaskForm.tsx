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
import { CalendarIcon, Plus, Trash2, X } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Song } from "@/types/supabase"

interface TaskFormProps {
  taskToEdit?: any
  onSubmit: (taskData: any) => void
  onDelete?: () => void
  selectedSong: string | null
  songs?: Song[]
}

export function TaskForm({ taskToEdit, onSubmit, onDelete, selectedSong, songs = [] }: TaskFormProps) {
  const [activeTab, setActiveTab] = useState("details")
  const [title, setTitle] = useState(taskToEdit?.title || "")
  const [description, setDescription] = useState(taskToEdit?.description || "")
  const [startDate, setStartDate] = useState<Date | undefined>(
    taskToEdit?.start_date ? new Date(taskToEdit.start_date) : undefined,
  )
  const [endDate, setEndDate] = useState<Date | undefined>(
    taskToEdit?.end_date ? new Date(taskToEdit.end_date) : undefined,
  )
  const [status, setStatus] = useState(taskToEdit?.status || "todo")
  const [priority, setPriority] = useState(taskToEdit?.priority || "Średni")
  const [assignedTo, setAssignedTo] = useState(taskToEdit?.assigned_to || [])
  const [responsibleUser, setResponsibleUser] = useState(taskToEdit?.responsible_user || "")
  const [plannedBudget, setPlannedBudget] = useState(taskToEdit?.planned_budget?.toString() || "")
  const [actualBudget, setActualBudget] = useState(taskToEdit?.actual_budget?.toString() || "")
  const [checklist, setChecklist] = useState(taskToEdit?.checklist || [])
  const [newChecklistItem, setNewChecklistItem] = useState("")
  const [comments, setComments] = useState(taskToEdit?.comments || [])
  const [newComment, setNewComment] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [songId, setSongId] = useState(taskToEdit?.song_id || selectedSong || "")
  const [activityType, setActivityType] = useState(taskToEdit?.activityType || "")

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
    setChecklist(checklist.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item)))
  }

  const handleAddComment = () => {
    if (newComment.trim()) {
      setComments([
        ...comments,
        {
          id: Date.now(),
          text: newComment,
          author: "Aktualny użytkownik", // Replace with actual user data
          timestamp: new Date().toISOString(),
        },
      ])
      setNewComment("")
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!title.trim()) {
      setError("Nazwa zadania jest wymagana")
      return
    }

    const taskData = {
      title,
      description,
      start_date: startDate?.toISOString(),
      end_date: endDate?.toISOString(),
      status,
      priority,
      assigned_to: assignedTo,
      responsible_user: responsibleUser,
      song_id: songId,
      activityType,
      // Only include budget values if they're valid numbers
      ...(plannedBudget && !isNaN(Number(plannedBudget)) ? { planned_budget: Number(plannedBudget) } : {}),
      ...(actualBudget && !isNaN(Number(actualBudget)) ? { actual_budget: Number(actualBudget) } : {}),
    }

    onSubmit(taskData)
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
                    className="bg-[#403d39] border-[#403d39] text-[#fffcf2]"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="activityType" className="text-[#fffcf2] font-roboto">
                    Rodzaj czynności
                  </Label>
                  <Select value={activityType} onValueChange={setActivityType}>
                    <SelectTrigger id="activityType" className="bg-[#403d39] border-[#403d39] text-[#fffcf2]">
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
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger className="bg-[#403d39] border-[#403d39] text-[#fffcf2]">
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
                  <Select value={songId} onValueChange={setSongId}>
                    <SelectTrigger className="bg-[#403d39] border-[#403d39] text-[#fffcf2]">
                      <SelectValue placeholder="Wybierz piosenkę" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#252422] border-[#403d39]">
                      {songs.map((song) => (
                        <SelectItem key={song.id} value={song.id} className="text-[#fffcf2]">
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
                          "w-full justify-start text-left font-normal bg-[#403d39] border-[#403d39] text-[#fffcf2]",
                          !startDate && "text-[#ccc5b9]",
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
                        className="text-[#fffcf2]"
                        classNames={{
                          day_selected: "bg-[#eb5e28] text-[#fffcf2] hover:bg-[#eb5e28] focus:bg-[#eb5e28]",
                          day: "text-[#ccc5b9] hover:bg-[#403d39] focus:bg-[#403d39]",
                          day_today: "bg-[#403d39] text-[#fffcf2]",
                          head_cell: "text-[#ccc5b9]",
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
                        className="text-[#fffcf2]"
                        classNames={{
                          day_selected: "bg-[#eb5e28] text-[#fffcf2] hover:bg-[#eb5e28] focus:bg-[#eb5e28]",
                          day: "text-[#ccc5b9] hover:bg-[#403d39] focus:bg-[#403d39]",
                          day_today: "bg-[#403d39] text-[#fffcf2]",
                          head_cell: "text-[#ccc5b9]",
                        }}
                      />
                    </PopoverContent>
                  </Popover>
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
                  <Select value={responsibleUser} onValueChange={setResponsibleUser}>
                    <SelectTrigger className="bg-[#403d39] border-[#403d39] text-[#fffcf2]">
                      <SelectValue placeholder="Wybierz osobę" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#252422] border-[#403d39]">
                      {teamMembers.map((member) => (
                        <SelectItem key={member.id} value={member.id} className="text-[#fffcf2]">
                          {member.name} ({member.role})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                      className="bg-[#403d39] border-[#403d39] text-[#fffcf2] pl-12"
                    />
                  </div>
                </div>

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
                  {checklist.map((item) => (
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
                        onClick={() => setChecklist(checklist.filter((i) => i.id !== item.id))}
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

                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="bg-[#403d39] p-4 rounded-lg space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-[#fffcf2]">{comment.author}</span>
                        <span className="text-sm text-[#ccc5b9]">
                          {format(new Date(comment.timestamp), "PPp", { locale: pl })}
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

      <div className="flex justify-between px-6 pb-6">
        {taskToEdit && onDelete && (
          <Button type="button" variant="destructive" onClick={onDelete} className="mr-auto">
            <Trash2 className="w-4 h-4 mr-2" />
            Usuń zadanie
          </Button>
        )}
        <Button type="submit" className="bg-[#eb5e28] text-white hover:bg-[#eb5e28]/90">
          {taskToEdit ? "Zapisz zmiany" : "Dodaj zadanie"}
        </Button>
      </div>
    </form>
  )
}


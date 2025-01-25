"use client"

import { useState } from "react"
import { format } from "date-fns"
import { pl } from "date-fns/locale"
import { CalendarIcon, Clock, Users } from "lucide-react"
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
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

interface AddEventDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddEvent: (event: any) => void
}

export function AddEventDialog({ open, onOpenChange, onAddEvent }: AddEventDialogProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [date, setDate] = useState<Date>()
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")
  const [attendees, setAttendees] = useState<string[]>([])

  const handleSubmit = () => {
    if (!title || !date || !startTime || !endTime) {
      // You might want to show an error message here
      return
    }

    const newEvent = {
      title,
      description,
      start: new Date(`${format(date, "yyyy-MM-dd")}T${startTime}`),
      end: new Date(`${format(date, "yyyy-MM-dd")}T${endTime}`),
      attendees,
      color: "#" + Math.floor(Math.random() * 16777215).toString(16), // Random color
    }

    onAddEvent(newEvent)
    onOpenChange(false)

    // Reset form
    setTitle("")
    setDescription("")
    setDate(undefined)
    setStartTime("")
    setEndTime("")
    setAttendees([])
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#252422] border-[#403d39] text-[#fffcf2] max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-montserrat">Nowe wydarzenie</DialogTitle>
          <DialogDescription className="text-[#ccc5b9] font-open-sans">
            Dodaj nowe wydarzenie do kalendarza
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-[#fffcf2] font-roboto">
              Tytuł
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-[#403d39] border-[#403d39] text-[#fffcf2] placeholder:text-[#ccc5b9]/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-[#fffcf2] font-roboto">
              Opis
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-[#403d39] border-[#403d39] text-[#fffcf2] placeholder:text-[#ccc5b9]/50 min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-[#fffcf2] font-roboto">Data</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal bg-[#403d39] border-[#403d39] text-[#fffcf2]",
                    !date && "text-[#ccc5b9]",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP", { locale: pl }) : <span>Wybierz datę</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-[#252422] border border-[#403d39]">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime" className="text-[#fffcf2] font-roboto">
                Czas rozpoczęcia
              </Label>
              <Select value={startTime} onValueChange={setStartTime}>
                <SelectTrigger className="bg-[#403d39] border-[#403d39] text-[#fffcf2]">
                  <SelectValue placeholder="Wybierz czas" />
                </SelectTrigger>
                <SelectContent className="bg-[#252422] border-[#403d39]">
                  {Array.from({ length: 24 }, (_, i) => (
                    <SelectItem key={i} value={`${i.toString().padStart(2, "0")}:00`} className="text-[#fffcf2]">
                      {`${i.toString().padStart(2, "0")}:00`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="endTime" className="text-[#fffcf2] font-roboto">
                Czas zakończenia
              </Label>
              <Select value={endTime} onValueChange={setEndTime}>
                <SelectTrigger className="bg-[#403d39] border-[#403d39] text-[#fffcf2]">
                  <SelectValue placeholder="Wybierz czas" />
                </SelectTrigger>
                <SelectContent className="bg-[#252422] border-[#403d39]">
                  {Array.from({ length: 24 }, (_, i) => (
                    <SelectItem key={i} value={`${i.toString().padStart(2, "0")}:00`} className="text-[#fffcf2]">
                      {`${i.toString().padStart(2, "0")}:00`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[#fffcf2] font-roboto">Uczestnicy</Label>
            <Select onValueChange={(value) => setAttendees([value])}>
              <SelectTrigger className="bg-[#403d39] border-[#403d39] text-[#fffcf2]">
                <SelectValue placeholder="Wybierz uczestnika" />
              </SelectTrigger>
              <SelectContent className="bg-[#252422] border-[#403d39]">
                <SelectItem value="Jan Kowalski" className="text-[#fffcf2]">
                  Jan Kowalski
                </SelectItem>
                <SelectItem value="Anna Nowak" className="text-[#fffcf2]">
                  Anna Nowak
                </SelectItem>
                <SelectItem value="Piotr Wiśniewski" className="text-[#fffcf2]">
                  Piotr Wiśniewski
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-2 hover:bg-[#403d39] hover:text-[#fffcf2]"
          >
            Anuluj
          </Button>
          <Button onClick={handleSubmit} className="bg-[#eb5e28] text-white hover:bg-[#eb5e28]/90">
            {" "}
            Dodaj wydarzenie
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


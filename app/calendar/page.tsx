"use client"

import { useState, useRef, useEffect } from "react"
import { format, addDays, subDays, startOfWeek, endOfWeek, isSameDay, parseISO, isWithinInterval } from "date-fns"
import { pl } from "date-fns/locale"
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  Mic,
  Settings2,
  Music2,
  HeadphonesIcon,
  Users,
  VideoIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AddEventDialog } from "./add-event-dialog"
import { Layout } from "@/components/Layout"
import { Header } from "@/components/Header"
import { CalendarEvent } from "./CalendarEvent"

// Przykładowe wydarzenia muzyczne
const initialEvents = [
  {
    id: 1,
    title: "Sesja nagraniowa - wokal",
    type: "recording",
    start: parseISO("2024-01-20T10:00"),
    end: parseISO("2024-01-20T12:00"),
    description: "Nagranie partii wokalnych dla 'Zimowa Ballada'",
    participants: ["Anna Nowak", "Jan Kowalski"],
    color: "#eb5e28",
    icon: Mic,
  },
  {
    id: 2,
    title: "Mix instrumentów",
    type: "mixing",
    start: parseISO("2024-01-21T14:00"),
    end: parseISO("2024-01-21T17:00"),
    description: "Mixing ścieżek instrumentalnych 'Letni Deszcz'",
    participants: ["Piotr Wiśniewski"],
    color: "#403d39",
    icon: Settings2,
  },
  {
    id: 3,
    title: "Spotkanie zespołu",
    type: "meeting",
    start: parseISO("2024-01-22T11:00"),
    end: parseISO("2024-01-22T12:30"),
    description: "Omówienie postępów i planów na najbliższy miesiąc",
    participants: ["Jan Kowalski", "Anna Nowak", "Piotr Wiśniewski", "Maria Kowalczyk"],
    color: "#2a9d8f",
    icon: Users,
  },
  {
    id: 4,
    title: "Nagranie teledysku",
    type: "video",
    start: parseISO("2024-01-23T09:00"),
    end: parseISO("2024-01-23T17:00"),
    description: "Całodniowa sesja nagraniowa teledysku do 'Zimowa Ballada'",
    participants: ["Cały zespół", "Ekipa filmowa"],
    color: "#e76f51",
    icon: VideoIcon,
  },
  {
    id: 5,
    title: "Mastering albumu",
    type: "mastering",
    start: parseISO("2024-01-25T10:00"),
    end: parseISO("2024-01-25T16:00"),
    description: "Finalizacja masteringu albumu 'Cztery Pory Roku'",
    participants: ["Piotr Wiśniewski", "Jan Kowalski"],
    color: "#8338ec",
    icon: HeadphonesIcon,
  },
  {
    id: 6,
    title: "Próba akustyczna",
    type: "rehearsal",
    start: parseISO("2024-01-26T15:00"),
    end: parseISO("2024-01-26T18:00"),
    description: "Próba akustyczna przed koncertem promocyjnym",
    participants: ["Cały zespół"],
    color: "#06d6a0",
    icon: Music2,
  },
  {
    id: 17,
    title: "Spotkanie zespołu produkcyjnego",
    type: "meeting",
    start: parseISO("2024-01-15T10:00"),
    end: parseISO("2024-01-15T11:30"),
    description: "Omówienie postępów w produkcji albumu 'Cztery Pory Roku'",
    participants: ["Jan Kowalski", "Anna Nowak", "Piotr Wiśniewski"],
    color: "#4CAF50",
    icon: Users,
  },
  {
    id: 18,
    title: "Sesja miksowania 'Letnia Przygoda'",
    type: "mixing",
    start: parseISO("2024-01-16T13:00"),
    end: parseISO("2024-01-16T17:00"),
    description: "Finalizacja miksu utworu 'Letnia Przygoda'",
    participants: ["Piotr Wiśniewski", "Anna Nowak"],
    color: "#2196F3",
    icon: Settings2,
  },
  {
    id: 19,
    title: "Mastering 'Zimowy Sen'",
    type: "mastering",
    start: parseISO("2024-01-18T09:00"),
    end: parseISO("2024-01-18T14:00"),
    description: "Sesja masteringu dla utworu 'Zimowy Sen'",
    participants: ["Jan Kowalski"],
    color: "#9C27B0",
    icon: HeadphonesIcon,
  },
  {
    id: 20,
    title: "Wydanie singla 'Wiosenny Powiew'",
    type: "release",
    start: parseISO("2024-01-20T00:00"),
    end: parseISO("2024-01-20T23:59"),
    description: "Oficjalna premiera singla 'Wiosenny Powiew' na platformach streamingowych",
    participants: ["Cały zespół"],
    color: "#FF9800",
    icon: Music2,
  },
  {
    id: 21,
    title: "Nagrywanie wokali 'Jesienny Blues'",
    type: "recording",
    start: parseISO("2024-01-17T14:00"),
    end: parseISO("2024-01-17T18:00"),
    description: "Sesja nagraniowa wokali do utworu 'Jesienny Blues'",
    participants: ["Anna Nowak", "Jan Kowalski"],
    color: "#E91E63",
    icon: Mic,
  },
]

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date(2024, 0, 20))
  const [isAddEventOpen, setIsAddEventOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<(typeof initialEvents)[0] | null>(null)
  const [events, setEvents] = useState(initialEvents)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const handlePrevious = () => setCurrentDate((prev) => subDays(prev, 7))
  const handleNext = () => setCurrentDate((prev) => addDays(prev, 7))

  const weekStart = startOfWeek(currentDate, { locale: pl })
  const weekEnd = endOfWeek(currentDate, { locale: pl })
  const hours = Array.from({ length: 24 }, (_, i) => i)
  //const visibleHours = hours.slice(8, 19) // Godziny od 8:00 do 18:00

  const getDateRange = () => {
    return `${format(weekStart, "d")} - ${format(weekEnd, "d MMMM yyyy", { locale: pl })}`
  }

  // Helper function to get events for a specific hour and day
  const getEventsForTimeSlot = (hour: number, dayDate: Date) => {
    return events.filter((event) => {
      const eventStart = new Date(event.start)
      const eventEnd = new Date(event.end)

      // Check if event occurs on this day
      if (!isSameDay(eventStart, dayDate)) {
        return false
      }

      // Check if event occurs during this hour
      const hourStart = new Date(dayDate.setHours(hour, 0, 0, 0))
      const hourEnd = new Date(dayDate.setHours(hour, 59, 59, 999))

      return (
        isWithinInterval(eventStart, { start: hourStart, end: hourEnd }) ||
        isWithinInterval(eventEnd, { start: hourStart, end: hourEnd }) ||
        (eventStart <= hourStart && eventEnd >= hourEnd)
      )
    })
  }

  useEffect(() => {
    // Set initial scroll position with a slight delay to ensure the content is rendered
    const timer = setTimeout(() => {
      if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollTop = 8 * 80
      }
    }, 0)

    return () => clearTimeout(timer)
  }, [])

  const handleAddEvent = (newEvent) => {
    setEvents((prevEvents) => [...prevEvents, { ...newEvent, id: Date.now() }])
  }

  return (
    <Layout>
      <Header title="Kalendarz" description="Harmonogram projektów muzycznych" />

      <Card className="bg-[#403d39] border-none p-6 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handlePrevious}
                className="bg-[#252422] border-[#403d39] text-[#ccc5b9] hover:bg-[#403d39] hover:text-[#fffcf2]"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleNext}
                className="bg-[#252422] border-[#403d39] text-[#ccc5b9] hover:bg-[#403d39] hover:text-[#fffcf2]"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
            <h2 className="text-lg font-semibold text-[#fffcf2] font-montserrat">{getDateRange()}</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#ccc5b9]" />
              <Input
                placeholder="Szukaj wydarzeń..."
                className="pl-10 bg-[#252422] border-none text-[#ccc5b9] placeholder:text-[#ccc5b9]/50"
              />
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6">
        <Card className="bg-[#403d39] border-none overflow-hidden">
          <ScrollArea className="h-[800px] relative overflow-hidden" ref={scrollAreaRef}>
            <div className="min-w-[800px]">
              <div className="grid grid-cols-[100px_repeat(7,1fr)] sticky top-0 z-20 bg-[#403d39]">
                <div className="p-4 border-b border-r border-[#252422] bg-[#252422]/50" />
                {Array.from({ length: 7 }).map((_, i) => {
                  const date = addDays(weekStart, i)
                  return (
                    <div key={i} className="p-4 text-center border-b border-r border-[#252422] bg-[#252422]/50">
                      <div className="font-medium text-[#fffcf2] font-montserrat">
                        {format(date, "EEEE", { locale: pl })}
                      </div>
                      <div className="text-sm text-[#ccc5b9] font-open-sans">
                        {format(date, "d MMM", { locale: pl })}
                      </div>
                    </div>
                  )
                })}
              </div>

              {hours.map((hour) => (
                <div key={hour} className="grid grid-cols-[100px_repeat(7,1fr)] relative">
                  <div className="p-4 border-r border-b border-[#252422] text-[#ccc5b9] text-sm sticky left-0 bg-[#403d39] z-10">
                    {`${hour.toString().padStart(2, "0")}:00`}
                  </div>
                  {Array.from({ length: 7 }).map((_, dayIndex) => {
                    const currentDay = addDays(weekStart, dayIndex)
                    const eventsInSlot = getEventsForTimeSlot(hour, currentDay)

                    return (
                      <div key={dayIndex} className="border-r border-b border-[#252422] h-20 relative">
                        {eventsInSlot.map((event) => {
                          const startHour = event.start.getHours() + event.start.getMinutes() / 60
                          const endHour = event.end.getHours() + event.end.getMinutes() / 60
                          const duration = Math.min(endHour - startHour, 24 - startHour)
                          const top = (startHour - hour) * 80

                          // Only render if the event starts in this hour slot
                          if (Math.floor(startHour) === hour) {
                            return (
                              <div
                                key={event.id}
                                className="absolute left-1 right-1"
                                style={{
                                  top: `${top}px`,
                                  height: `${duration * 80}px`,
                                }}
                              >
                                <CalendarEvent event={event} onClick={() => setSelectedEvent(event)} />
                              </div>
                            )
                          }
                          return null
                        })}
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>

        {selectedEvent && (
          <Card className="bg-[#403d39] border-none p-6 absolute right-8 top-32 w-80">
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-2 text-[#ccc5b9] hover:text-[#fffcf2]"
              onClick={() => setSelectedEvent(null)}
            >
              ×
            </Button>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${selectedEvent.color}20` }}
                >
                  <selectedEvent.icon className="w-5 h-5" style={{ color: selectedEvent.color }} />
                </div>
                <div>
                  <h3 className="font-semibold text-[#fffcf2] font-montserrat">{selectedEvent.title}</h3>
                  <p className="text-sm text-[#ccc5b9]">
                    {format(selectedEvent.start, "d MMMM, HH:mm", { locale: pl })} -{" "}
                    {format(selectedEvent.end, "HH:mm", { locale: pl })}
                  </p>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-[#fffcf2] mb-2">Opis</h4>
                <p className="text-sm text-[#ccc5b9]">{selectedEvent.description}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-[#fffcf2] mb-2">Uczestnicy</h4>
                <div className="space-y-2">
                  {selectedEvent.participants.map((participant, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-[#252422] flex items-center justify-center">
                        <span className="text-sm text-[#ccc5b9]">
                          {participant
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </span>
                      </div>
                      <span className="text-sm text-[#ccc5b9]">{participant}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>

      <AddEventDialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen} onAddEvent={handleAddEvent} />
    </Layout>
  )
}
;<style jsx>{`
  .scrollbar-hide {
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
  .sticky {
    position: sticky;
    top: 0;
    z-index: 20;
  }
`}</style>


import { useState } from "react"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay } from "date-fns"
import { pl } from "date-fns/locale"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface CalendarMonthViewProps {
  currentDate: Date
  events: Array<{
    id: number
    title: string
    start: Date
    end: Date
    description: string
    attendees: string[]
    color: string
  }>
  onPreviousMonth: () => void
  onNextMonth: () => void
}

export function CalendarMonthView({ currentDate, events, onPreviousMonth, onNextMonth }: CalendarMonthViewProps) {
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const weekDays = ["Pon", "Wt", "Śr", "Czw", "Pt", "Sob", "Niedz"]

  const eventsByDate = events.reduce(
    (acc, event) => {
      const date = format(event.start, "yyyy-MM-dd")
      if (!acc[date]) {
        acc[date] = []
      }
      acc[date].push(event)
      return acc
    },
    {} as Record<string, typeof events>,
  )

  return (
    <div className="bg-[#403d39] text-[#fffcf2] p-4 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold font-montserrat text-[#eb5e28]">
          {format(currentDate, "LLLL yyyy", { locale: pl })}
        </h2>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={onPreviousMonth}
            className="text-[#ccc5b9] hover:text-[#fffcf2] hover:bg-[#252422]"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={onNextMonth}
            className="text-[#ccc5b9] hover:text-[#fffcf2] hover:bg-[#252422]"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {weekDays.map((day) => (
          <div key={day} className="p-2 text-center text-[#ccc5b9] font-medium font-montserrat">
            {day}
          </div>
        ))}

        {days.map((day, dayIdx) => {
          const dateKey = format(day, "yyyy-MM-dd")
          const dayEvents = eventsByDate[dateKey] || []

          return (
            <div
              key={day.toString()}
              className={cn(
                "min-h-[100px] p-2 bg-[#403d39] border border-[#252422] overflow-hidden transition-colors",
                !isSameMonth(day, currentDate) && "opacity-50 bg-[#252422]",
                isToday(day) && "ring-2 ring-[#eb5e28]",
                "hover:bg-[#252422] cursor-pointer",
              )}
            >
              <div className="flex justify-between items-center">
                <span
                  className={cn(
                    "text-sm font-medium w-6 h-6 flex items-center justify-center rounded-full",
                    isToday(day) && "bg-[#eb5e28] text-white",
                  )}
                >
                  {format(day, "d")}
                </span>
                {dayEvents.length > 0 && (
                  <span className="text-xs text-[#eb5e28] font-medium px-1 py-0.5 bg-[#eb5e28]/10 rounded-full">
                    {dayEvents.length}
                  </span>
                )}
              </div>
              <div className="mt-1 space-y-1">
                {dayEvents.slice(0, 2).map((event) => (
                  <div
                    key={event.id}
                    className="text-xs truncate rounded px-1 py-0.5 bg-opacity-80"
                    style={{ backgroundColor: event.color }}
                  >
                    {event.title}
                  </div>
                ))}
                {dayEvents.length > 2 && (
                  <div className="text-xs text-[#ccc5b9] bg-[#252422] px-1 py-0.5 rounded">
                    +{dayEvents.length - 2} more
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}


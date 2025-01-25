import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, addHours, startOfDay } from "date-fns"
import { pl } from "date-fns/locale"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

interface CalendarWeekViewProps {
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
}

export function CalendarWeekView({ currentDate, events }: CalendarWeekViewProps) {
  const hours = Array.from({ length: 24 }, (_, i) => i)
  const weekStart = startOfWeek(currentDate, { locale: pl })
  const weekEnd = endOfWeek(currentDate, { locale: pl })
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd })

  return (
    <ScrollArea className="h-[calc(100vh-300px)]">
      <div className="relative min-w-[800px]">
        {/* Header */}
        <div className="flex">
          <div className="w-20 shrink-0" /> {/* Time column spacer */}
          {days.map((day) => (
            <div key={day.toISOString()} className="flex-1 text-center border-l border-[#252422] py-4 bg-[#403d39]">
              <div className="text-[#fffcf2] font-medium font-montserrat">{format(day, "EEEE", { locale: pl })}</div>
              <div className="text-[#ccc5b9] text-sm font-open-sans">{format(day, "d MMM", { locale: pl })}</div>
            </div>
          ))}
        </div>

        <div className="flex">
          {/* Time Labels */}
          <div className="w-20 shrink-0 border-r border-[#252422] bg-[#403d39]">
            {hours.map((hour) => (
              <div key={hour} className="h-20 border-b border-[#252422] px-2">
                <span className="text-[#ccc5b9] text-sm">
                  {format(addHours(startOfDay(currentDate), hour), "HH:mm", { locale: pl })}
                </span>
              </div>
            ))}
          </div>

          {/* Days Columns */}
          {days.map((day) => (
            <div key={day.toISOString()} className="flex-1 relative border-l border-[#252422]">
              {/* Hour Grid Lines */}
              {hours.map((hour) => (
                <div
                  key={hour}
                  className="absolute w-full h-20 border-b border-[#252422]"
                  style={{ top: `${hour * 5}rem` }}
                />
              ))}

              {/* Events */}
              {events
                .filter(
                  (event) =>
                    format(event.start, "yyyy-MM-dd") === format(day, "yyyy-MM-dd") &&
                    !event.title.startsWith("Mix instrument"),
                )
                .map((event) => {
                  const startHour = event.start.getHours() + event.start.getMinutes() / 60
                  const duration = (event.end.getTime() - event.start.getTime()) / (1000 * 60 * 60)

                  return (
                    <div
                      key={event.id}
                      className={cn(
                        "absolute left-1 right-1 rounded-lg p-2 text-[#fffcf2] overflow-hidden",
                        "hover:ring-2 hover:ring-[#eb5e28] transition-shadow cursor-pointer",
                      )}
                      style={{
                        top: `${startHour * 5}rem`,
                        height: `${duration * 5}rem`,
                        backgroundColor: event.color,
                      }}
                    >
                      <div className="font-medium text-sm font-montserrat">{event.title}</div>
                      <div className="text-xs opacity-90 font-open-sans">
                        {format(event.start, "HH:mm", { locale: pl })} - {format(event.end, "HH:mm", { locale: pl })}
                      </div>
                      {duration > 1.5 && (
                        <div className="flex gap-1 mt-1">
                          {event.attendees.map((attendee) => (
                            <div
                              key={attendee}
                              className="w-5 h-5 rounded-full bg-[#252422]/20 flex items-center justify-center"
                            >
                              <span className="text-xs">{attendee}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
            </div>
          ))}
        </div>
      </div>
    </ScrollArea>
  )
}


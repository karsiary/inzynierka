import { format, addHours, startOfDay } from "date-fns"
import { pl } from "date-fns/locale"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

interface CalendarDayViewProps {
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

export function CalendarDayView({ currentDate, events }: CalendarDayViewProps) {
  const hours = Array.from({ length: 24 }, (_, i) => i)
  const dayStart = startOfDay(currentDate)

  return (
    <ScrollArea className="h-[calc(100vh-300px)]">
      <div className="relative min-w-[800px]">
        {/* Time Labels */}
        <div className="absolute left-0 top-0 w-20 border-r border-[#252422] bg-[#403d39]">
          {hours.map((hour) => (
            <div key={hour} className="h-20 border-b border-[#252422] px-2">
              <span className="text-[#ccc5b9] text-sm">
                {format(addHours(dayStart, hour), "HH:mm", { locale: pl })}
              </span>
            </div>
          ))}
        </div>

        {/* Events Grid */}
        <div className="ml-20">
          <div className="relative" style={{ height: `${hours.length * 5}rem` }}>
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
                  format(event.start, "yyyy-MM-dd") === format(currentDate, "yyyy-MM-dd") &&
                  !event.title.includes("Mix instrument"),
              )
              .map((event) => {
                const startHour = event.start.getHours() + event.start.getMinutes() / 60
                const duration = (event.end.getTime() - event.start.getTime()) / (1000 * 60 * 60)

                return (
                  <div
                    key={event.id}
                    className={cn(
                      "absolute left-4 right-4 rounded-lg p-2 text-[#fffcf2] overflow-hidden",
                      "hover:ring-2 hover:ring-[#eb5e28] transition-shadow cursor-pointer",
                    )}
                    style={{
                      top: `${startHour * 5}rem`,
                      height: `${duration * 5}rem`,
                      backgroundColor: event.color,
                    }}
                  >
                    <div className="font-medium font-montserrat">{event.title}</div>
                    <div className="text-sm opacity-90 font-open-sans">
                      {format(event.start, "HH:mm", { locale: pl })} - {format(event.end, "HH:mm", { locale: pl })}
                    </div>
                    {duration > 1 && (
                      <>
                        <div className="text-sm mt-1 font-open-sans">{event.description}</div>
                        <div className="flex gap-1 mt-2">
                          {event.attendees.map((attendee) => (
                            <div
                              key={attendee}
                              className="w-6 h-6 rounded-full bg-[#252422]/20 flex items-center justify-center"
                            >
                              <span className="text-xs">{attendee}</span>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )
              })}
          </div>
        </div>
      </div>
    </ScrollArea>
  )
}


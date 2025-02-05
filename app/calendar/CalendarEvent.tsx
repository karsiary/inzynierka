import { format } from "date-fns"
import { pl } from "date-fns/locale"
import type { LucideIcon } from "lucide-react"

interface CalendarEventProps {
  event: {
    id: number
    title: string
    type: string
    start: Date
    end: Date
    description: string
    participants: string[]
    color: string
    icon: LucideIcon
    songTitle?: string
    projectTitle?: string
  }
  isVisible?: boolean
  onClick?: () => void
}

export function CalendarEvent({ event, isVisible = true, onClick }: CalendarEventProps) {
  const Icon = event.icon

  return (
    <div
      className={`p-2 rounded-lg cursor-pointer transition-all hover:shadow-lg ${
        isVisible ? "" : "opacity-0 pointer-events-none"
      }`}
      style={{
        backgroundColor: `${event.color}40`,
        borderLeft: `3px solid ${event.color}`,
      }}
      onClick={onClick}
    >
      <div className="flex items-start gap-2">
        <Icon className="w-4 h-4 shrink-0" style={{ color: event.color }} />
        <div className="min-w-0">
          <div className="font-medium text-[#fffcf2] font-montserrat text-sm truncate">{event.title}</div>
          {event.songTitle && (
            <div className="text-xs text-[#ccc5b9] truncate">
              Piosenka: {event.songTitle}
            </div>
          )}
          {event.projectTitle && (
            <div className="text-xs text-[#ccc5b9] truncate">
              Projekt: {event.projectTitle}
            </div>
          )}
          <div className="flex items-center gap-2 mt-1">
            <div className="text-xs text-[#ccc5b9] whitespace-nowrap">
              {format(event.start, "HH:mm", { locale: pl })} - {format(event.end, "HH:mm", { locale: pl })}
            </div>
            <div className="flex -space-x-2 overflow-hidden">
              {event.participants.slice(0, 3).map((participant, i) => (
                <div
                  key={i}
                  className="w-5 h-5 rounded-full bg-[#252422] border-2 border-[#403d39] flex items-center justify-center"
                >
                  <span className="text-[10px] text-[#ccc5b9]">
                    {participant
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


import { NotificationsPopover } from "@/components/NotificationsPopover"

interface HeaderProps {
  title: string
  description: string
}

export function Header({ title, description }: HeaderProps) {
  return (
    <div className="flex justify-between items-center mb-8">
      <div>
        <h1 className="text-2xl font-bold text-[#fffcf2] mb-2 font-montserrat">{title}</h1>
        <p className="text-[#ccc5b9] font-open-sans">{description}</p>
      </div>
      <div className="flex items-center gap-4">
        <NotificationsPopover />
        <div className="w-10 h-10 rounded-full bg-[#403d39] flex items-center justify-center">
          <span className="text-[#fffcf2] font-semibold font-montserrat">JK</span>
        </div>
      </div>
    </div>
  )
}


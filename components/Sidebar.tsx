import Link from "next/link"
import { usePathname } from "next/navigation"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { BarChart3, Users, FolderKanban, Calendar, Settings, LogOut } from "lucide-react"

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  return (
    <aside className="w-64 min-h-screen bg-[#403d39]/50 backdrop-blur-sm border-r border-[#403d39] p-6">
      <div className="flex items-center mb-8">
        <span className="text-[#eb5e28] text-2xl font-bold font-montserrat">Audio</span>
        <span className="text-[#fffcf2] text-2xl font-bold font-montserrat">Plan</span>
      </div>

      <nav className="space-y-2">
        <Link
          href="/dashboard"
          className={`flex items-center gap-3 text-[#ccc5b9] px-4 py-2 rounded-lg ${
            pathname === "/dashboard" ? "text-[#fffcf2] bg-[#eb5e28]/10" : "hover:bg-[#403d39]"
          }`}
        >
          <BarChart3 className="w-5 h-5" />
          <span className="font-roboto">Dashboard</span>
        </Link>
        <Link
          href="/projects"
          className={`flex items-center gap-3 text-[#ccc5b9] px-4 py-2 rounded-lg ${
            pathname === "/projects" ? "text-[#fffcf2] bg-[#eb5e28]/10" : "hover:bg-[#403d39]"
          }`}
        >
          <FolderKanban className="w-5 h-5" />
          <span className="font-roboto">Projekty</span>
        </Link>
        <Link
          href="/team"
          className={`flex items-center gap-3 text-[#ccc5b9] px-4 py-2 rounded-lg ${
            pathname === "/team" ? "text-[#fffcf2] bg-[#eb5e28]/10" : "hover:bg-[#403d39]"
          }`}
        >
          <Users className="w-5 h-5" />
          <span className="font-roboto">Zespół</span>
        </Link>
        <Link
          href="/calendar"
          className={`flex items-center gap-3 px-4 py-2 rounded-lg ${
            pathname === "/calendar" ? "text-[#fffcf2] bg-[#eb5e28]/10" : "text-[#ccc5b9] hover:bg-[#403d39]"
          }`}
        >
          <Calendar className="w-5 h-5" />
          <span className="font-roboto">Kalendarz</span>
        </Link>
      </nav>

      <div className="absolute bottom-8 left-6 space-y-2">
        <Link
          href="/settings"
          className="flex items-center gap-3 text-[#ccc5b9] px-4 py-2 rounded-lg hover:bg-[#403d39]"
        >
          <Settings className="w-5 h-5" />
          <span className="font-roboto">Ustawienia</span>
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 text-[#ccc5b9] px-4 py-2 rounded-lg hover:bg-[#403d39] w-full text-left"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-roboto">Wyloguj</span>
        </button>
      </div>
    </aside>
  )
}


"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { signOut } from "next-auth/react"

export function Sidebar() {
  const pathname = usePathname()

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: "/login" })
  }

  return (
    <div className="pb-12 w-full">
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight text-[#fffcf2]">
            Nawigacja
          </h2>
          <div className="space-y-1">
            <Link href="/dashboard">
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start text-[#fffcf2] hover:text-[#fffcf2] hover:bg-[#252422]",
                  pathname === "/dashboard" && "bg-[#252422]"
                )}
              >
                Dashboard
              </Button>
            </Link>
            <Link href="/projects">
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start text-[#fffcf2] hover:text-[#fffcf2] hover:bg-[#252422]",
                  pathname === "/projects" && "bg-[#252422]"
                )}
              >
                Projekty
              </Button>
            </Link>
            <Link href="/calendar">
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start text-[#fffcf2] hover:text-[#fffcf2] hover:bg-[#252422]",
                  pathname === "/calendar" && "bg-[#252422]"
                )}
              >
                Kalendarz
              </Button>
            </Link>
            <Link href="/settings">
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start text-[#fffcf2] hover:text-[#fffcf2] hover:bg-[#252422]",
                  pathname === "/settings" && "bg-[#252422]"
                )}
              >
                Ustawienia
              </Button>
            </Link>
          </div>
        </div>
        <div className="px-3 py-2">
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="w-full justify-start text-[#fffcf2] hover:text-[#fffcf2] hover:bg-[#252422]"
          >
            Wyloguj się
          </Button>
        </div>
      </div>
    </div>
  )
}


"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { X, Plus, Search } from "lucide-react"
import { useSession } from "next-auth/react"

interface User {
  id: string
  name: string | null
  email: string | null
  image: string | null
}

interface TeamMember {
  id: string
  userId: string
  role: "admin" | "member"
  user: User
}

interface Team {
  id: number
  name: string
  members: TeamMember[]
  created_at: string
  updated_at: string
}

interface TeamDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  team: Team | null
  onSave: (updatedTeam: Team) => void
}

export function TeamDetailsDialog({ open, onOpenChange, team, onSave }: TeamDetailsDialogProps) {
  const { data: session } = useSession()
  const [editedTeam, setEditedTeam] = useState<Team | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<User[]>([])

  // Sprawdź, czy zalogowany użytkownik jest administratorem zespołu
  const isAdmin = editedTeam?.members.some(
    member => member.userId === session?.user?.id && member.role === "admin"
  ) ?? false

  useEffect(() => {
    setEditedTeam(team)
  }, [team])

  useEffect(() => {
    if (searchQuery.length >= 2) {
      searchUsers()
    } else {
      setSearchResults([])
    }
  }, [searchQuery])

  const searchUsers = async () => {
    try {
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(searchQuery)}`)
      if (!response.ok) {
        throw new Error("Błąd podczas wyszukiwania użytkowników")
      }
      const data = await response.json()
      // Filtrujemy użytkowników, którzy są już w zespole
      const filteredUsers = data.filter(
        (user: User) => !editedTeam?.members.some(member => member.user.id === user.id)
      )
      setSearchResults(filteredUsers)
    } catch (error) {
      console.error("Error searching users:", error)
    }
  }

  if (!editedTeam || !session?.user?.id) return null

  const handleSave = () => {
    if (editedTeam) {
      onSave(editedTeam)
    }
  }

  const handleRemoveMember = (memberId: string) => {
    // Nie pozwalamy na usunięcie administratora
    const member = editedTeam.members.find(m => m.id === memberId)
    if (member?.role === "admin" && member.user.id === session.user.id) {
      return
    }

    setEditedTeam(prev => ({
      ...prev!,
      members: prev!.members.filter(member => member.id !== memberId)
    }))
  }

  const handleAddMember = (user: User) => {
    // Generujemy tymczasowe ID dla nowego członka
    const tempId = `temp-${Date.now()}`
    
    const newMember: TeamMember = {
      id: tempId,
      userId: user.id,
      role: "member",
      user: user
    }

    setEditedTeam(prev => ({
      ...prev!,
      members: [...prev!.members, newMember]
    }))
    setSearchQuery("")
  }

  const getUserInitials = (name: string | null) => {
    if (!name) return "U"
    return name.split(" ").map(n => n[0]).join("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#252422] border-[#403d39] text-[#fffcf2] max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-montserrat">Szczegóły zespołu</DialogTitle>
          <DialogDescription className="text-[#ccc5b9] font-open-sans">
            {isAdmin 
              ? "Edytuj informacje o zespole i zarządzaj jego członkami" 
              : "Przeglądaj informacje o zespole"}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="teamName" className="text-lg text-[#fffcf2] font-roboto">
              Nazwa zespołu
            </Label>
            <Input
              id="teamName"
              value={editedTeam.name}
              onChange={(e) => setEditedTeam({ ...editedTeam, name: e.target.value })}
              className="bg-[#403d39] border-2 border-[#403d39] text-[#fffcf2] placeholder:text-[#ccc5b9]/50 focus:border-[#eb5e28] transition-colors"
              disabled={!isAdmin}
            />
          </div>

          <div className="space-y-4">
            <Label className="text-lg text-[#fffcf2] font-roboto">Członkowie zespołu</Label>
            {editedTeam.members.map((member) => (
              <div key={member.id} className="flex items-center justify-between bg-[#403d39] p-3 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-[#eb5e28] flex items-center justify-center">
                    <span className="text-sm font-semibold text-[#fffcf2]">
                      {getUserInitials(member.user.name)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#fffcf2]">{member.user.name}</p>
                    <p className="text-xs text-[#ccc5b9]">{member.user.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Select
                    value={member.role}
                    onValueChange={(newRole: "admin" | "member") => {
                      // Nie pozwalamy na zmianę roli jeśli nie jesteśmy adminem
                      if (!isAdmin) return
                      
                      // Nie pozwalamy na zmianę roli administratora
                      if (member.role === "admin" && member.user.id === session.user.id) {
                        return
                      }
                      
                      setEditedTeam(prev => ({
                        ...prev!,
                        members: prev!.members.map(m => 
                          m.id === member.id ? { ...m, role: newRole } : m
                        )
                      }))
                    }}
                    disabled={!isAdmin || (member.role === "admin" && member.user.id === session.user.id)}
                  >
                    <SelectTrigger className="w-[140px] h-8 text-xs bg-[#252422] border-none text-[#ccc5b9]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#252422] border-[#403d39]">
                      <SelectItem value="admin" className="text-[#fffcf2]">
                        Administrator
                      </SelectItem>
                      <SelectItem value="member" className="text-[#fffcf2]">
                        Członek
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {member.role !== "admin" && isAdmin && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveMember(member.id)}
                      className="text-[#ccc5b9] hover:text-[#eb5e28]"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}

            {/* Wyszukiwanie i dodawanie nowych członków - tylko dla administratorów */}
            {isAdmin && (
              <div className="space-y-4">
                <Label className="text-lg text-[#fffcf2] font-roboto">Dodaj nowego członka</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#ccc5b9]" />
                  <Input
                    placeholder="Wyszukaj użytkowników..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-[#403d39] border-2 border-[#403d39] text-[#fffcf2] placeholder:text-[#ccc5b9]/50 focus:border-[#eb5e28] transition-colors"
                  />
                </div>

                {searchQuery.length >= 2 && searchResults.length > 0 && (
                  <ScrollArea className="h-[200px] rounded-md border border-[#403d39] bg-[#252422] p-4">
                    <div className="space-y-2">
                      {searchResults.map((user) => (
                        <div
                          key={user.id}
                          className="flex items-center justify-between p-2 rounded-lg hover:bg-[#403d39] cursor-pointer"
                          onClick={() => handleAddMember(user)}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full bg-[#eb5e28] flex items-center justify-center">
                              <span className="text-sm font-semibold text-[#fffcf2]">
                                {getUserInitials(user.name)}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-[#fffcf2]">{user.name}</p>
                              <p className="text-xs text-[#ccc5b9]">{user.email}</p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" className="hover:bg-[#eb5e28]/20 hover:text-[#fffcf2]">
                            Dodaj
                          </Button>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-2 hover:bg-[#403d39] hover:text-[#fffcf2] text-[#8a8580]"
          >
            Anuluj
          </Button>
          <Button onClick={handleSave} className="bg-[#eb5e28] text-white hover:bg-[#eb5e28]/90">
            Zapisz zmiany
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


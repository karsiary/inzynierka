"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X } from "lucide-react"
import type { User } from "@/types"

interface AddTeamDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onTeamAdded: () => void
}

export function AddTeamDialog({ open, onOpenChange, onTeamAdded }: AddTeamDialogProps) {
  const [name, setName] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedUsers, setSelectedUsers] = useState<User[]>([])
  const [searchResults, setSearchResults] = useState<User[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isSearching, setIsSearching] = useState(false)

  const handleSearch = async (query: string) => {
    setSearchQuery(query)
    if (query.length < 2) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    try {
      const response = await fetch(`/api/users/search?query=${encodeURIComponent(query)}`)
      if (!response.ok) {
        throw new Error("Błąd podczas wyszukiwania użytkowników")
      }
      const users = await response.json()
      setSearchResults(users)
    } catch (error) {
      console.error("Error searching users:", error)
      setError("Wystąpił błąd podczas wyszukiwania użytkowników")
    } finally {
      setIsSearching(false)
    }
  }

  const handleAddUser = (user: User) => {
    if (!selectedUsers.find((u) => u.id === user.id)) {
      setSelectedUsers([...selectedUsers, user])
    }
    setSearchQuery("")
    setSearchResults([])
  }

  const handleRemoveUser = (userId: string) => {
    setSelectedUsers(selectedUsers.filter((user) => user.id !== userId))
  }

  const handleSubmit = async () => {
    setError(null)

    if (!name.trim()) {
      setError("Nazwa zespołu jest wymagana")
      return
    }

    try {
      const response = await fetch("/api/teams", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          members: selectedUsers.map((user) => user.id),
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Wystąpił błąd podczas tworzenia zespołu")
      }

      onTeamAdded()
      onOpenChange(false)
      setName("")
      setSelectedUsers([])
      setSearchQuery("")
      setSearchResults([])
    } catch (error) {
      console.error("Error creating team:", error)
      setError(
        error instanceof Error
          ? error.message
          : "Wystąpił nieznany błąd podczas tworzenia zespołu"
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#252422] border-[#403d39] text-[#fffcf2] max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-montserrat">Nowy zespół</DialogTitle>
          <DialogDescription className="text-[#ccc5b9] font-open-sans">
            Utwórz nowy zespół i dodaj jego członków
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-[#fffcf2] font-roboto">
              Nazwa zespołu
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-[#403d39] border-[#403d39] text-[#fffcf2]"
              placeholder="Wprowadź nazwę zespołu"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="search" className="text-[#fffcf2] font-roboto">
              Dodaj członków
            </Label>
            <Input
              id="search"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="bg-[#403d39] border-[#403d39] text-[#fffcf2]"
              placeholder="Wyszukaj po adresie email..."
            />

            {/* Wyniki wyszukiwania */}
            {isSearching ? (
              <div className="text-sm text-[#ccc5b9]">Wyszukiwanie...</div>
            ) : searchResults.length > 0 ? (
              <div className="mt-2 space-y-1">
                {searchResults.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-2 rounded bg-[#403d39] hover:bg-[#403d39]/80 cursor-pointer"
                    onClick={() => handleAddUser(user)}
                  >
                    <div>
                      <p className="text-[#fffcf2]">{user.name}</p>
                      <p className="text-sm text-[#ccc5b9]">{user.email}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-[#eb5e28] hover:text-[#eb5e28]/80"
                    >
                      Dodaj
                    </Button>
                  </div>
                ))}
              </div>
            ) : searchQuery.length > 0 && (
              <div className="text-sm text-[#ccc5b9]">Brak wyników</div>
            )}

            {/* Wybrani użytkownicy */}
            {selectedUsers.length > 0 && (
              <div className="mt-4">
                <Label className="text-[#fffcf2] font-roboto mb-2 block">
                  Wybrani członkowie
                </Label>
                <div className="space-y-2">
                  {selectedUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-2 rounded bg-[#403d39]"
                    >
                      <div>
                        <p className="text-[#fffcf2]">{user.name}</p>
                        <p className="text-sm text-[#ccc5b9]">{user.email}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveUser(user.id)}
                        className="text-[#eb5e28] hover:text-[#eb5e28]/80"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="flex justify-end gap-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="bg-transparent border-[#403d39] text-[#ccc5b9] hover:bg-[#403d39]"
            >
              Anuluj
            </Button>
            <Button
              onClick={handleSubmit}
              className="bg-[#eb5e28] text-white hover:bg-[#eb5e28]/90"
            >
              Utwórz zespół
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 
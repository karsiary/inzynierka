"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, X } from "lucide-react"

interface AddTeamDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddTeamDialog({ open, onOpenChange }: AddTeamDialogProps) {
  const [teamName, setTeamName] = useState("")
  const [searchMember, setSearchMember] = useState("")
  const [selectedMembers, setSelectedMembers] = useState<Array<{ id: number; name: string; email: string }>>([])

  // Przykładowi użytkownicy do wyszukiwania
  const availableUsers = [
    { id: 1, name: "Jan Kowalski", email: "jan@example.com" },
    { id: 2, name: "Anna Nowak", email: "anna@example.com" },
    { id: 3, name: "Piotr Wiśniewski", email: "piotr@example.com" },
    { id: 4, name: "Maria Kowalczyk", email: "maria@example.com" },
  ]

  const filteredUsers = availableUsers.filter(
    (user) =>
      !selectedMembers.find((member) => member.id === user.id) &&
      (user.name.toLowerCase().includes(searchMember.toLowerCase()) ||
        user.email.toLowerCase().includes(searchMember.toLowerCase())),
  )

  const handleAddMember = (user: { id: number; name: string; email: string }) => {
    setSelectedMembers([...selectedMembers, user])
    setSearchMember("")
  }

  const handleRemoveMember = (userId: number) => {
    setSelectedMembers(selectedMembers.filter((member) => member.id !== userId))
  }

  const handleSubmit = () => {
    // Handle form submission
    console.log({
      teamName,
      members: selectedMembers,
    })
    onOpenChange(false)
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

        <div className="grid gap-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-lg text-[#fffcf2] font-roboto">
              Nazwa zespołu
            </Label>
            <Input
              id="name"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="Wprowadź nazwę zespołu"
              className="bg-[#403d39] border-2 border-[#403d39] text-[#fffcf2] placeholder:text-[#ccc5b9]/50 focus:border-[#eb5e28] transition-colors"
            />
          </div>

          <div className="space-y-4">
            <Label className="text-lg text-[#fffcf2] font-roboto">Członkowie zespołu</Label>

            {/* Search Members */}
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#ccc5b9]" />
              <Input
                placeholder="Wyszukaj użytkowników..."
                value={searchMember}
                onChange={(e) => setSearchMember(e.target.value)}
                className="pl-10 bg-[#403d39] border-2 border-[#403d39] text-[#fffcf2] placeholder:text-[#ccc5b9]/50 focus:border-[#eb5e28] transition-colors"
              />
            </div>

            {/* Selected Members */}
            <div className="flex flex-wrap gap-2 mt-4">
              {selectedMembers.map((member) => (
                <div
                  key={member.id}
                  className="bg-[#403d39] text-[#fffcf2] px-3 py-1.5 rounded-full flex items-center gap-2"
                >
                  <span className="text-sm">{member.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveMember(member.id)}
                    className="h-5 w-5 p-0 hover:bg-[#eb5e28]/20"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Search Results */}
            {searchMember && (
              <ScrollArea className="h-[200px] rounded-md border border-[#403d39] bg-[#252422] p-4">
                <div className="space-y-2">
                  {filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-[#403d39] cursor-pointer"
                      onClick={() => handleAddMember(user)}
                    >
                      <div>
                        <p className="text-[#fffcf2] font-medium">{user.name}</p>
                        <p className="text-sm text-[#ccc5b9]">{user.email}</p>
                      </div>
                      <Button variant="ghost" size="sm" className="hover:bg-[#eb5e28]/20 hover:text-[#fffcf2]">
                        Dodaj
                      </Button>
                    </div>
                  ))}
                  {filteredUsers.length === 0 && <p className="text-[#ccc5b9] text-center py-4">Brak wyników</p>}
                </div>
              </ScrollArea>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-2 hover:bg-[#403d39] hover:text-[#fffcf2]"
          >
            Anuluj
          </Button>
          <Button onClick={handleSubmit} className="bg-[#eb5e28] text-white hover:bg-[#eb5e28]/90">
            Utwórz zespół
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


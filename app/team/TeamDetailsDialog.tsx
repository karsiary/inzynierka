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
import { X, Plus, Mail } from "lucide-react"

interface TeamMember {
  id: number
  name: string
  avatar: string
  role: string
  confirmed: boolean
  updateRole: (newRole: string) => void
}

interface Team {
  id: number
  name: string
  members: TeamMember[]
  createdAt: string
  lastActive: string
}

interface TeamDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  team: Team | null
  onSave: (updatedTeam: Team) => void
}

export function TeamDetailsDialog({ open, onOpenChange, team, onSave }: TeamDetailsDialogProps) {
  const [editedTeam, setEditedTeam] = useState<Team | null>(null)
  const [newMemberEmail, setNewMemberEmail] = useState("")
  const [newMemberRole, setNewMemberRole] = useState("")

  useEffect(() => {
    setEditedTeam(team)
  }, [team])

  if (!editedTeam) return null

  const handleSave = () => {
    if (editedTeam) {
      onSave(editedTeam)
      onOpenChange(false)
    }
  }

  const handleRemoveMember = (memberId: number) => {
    setEditedTeam((prev) => ({
      ...prev!,
      members: prev!.members.filter((member) => member.id !== memberId),
    }))
  }

  const handleAddMember = () => {
    if (newMemberEmail && newMemberRole) {
      const newMember: TeamMember = {
        id: Date.now(),
        name: newMemberEmail.split("@")[0],
        avatar: newMemberEmail.substring(0, 2).toUpperCase(),
        role: newMemberRole,
        confirmed: false,
        updateRole: (newRole: string) => {
          setEditedTeam((prev) => ({
            ...prev!,
            members: prev!.members.map((m) => (m.id === newMember.id ? { ...m, role: newRole } : m)),
          }))
        },
      }
      setEditedTeam((prev) => ({
        ...prev!,
        members: [...prev!.members, newMember],
      }))
      setNewMemberEmail("")
      setNewMemberRole("")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#252422] border-[#403d39] text-[#fffcf2] max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-montserrat">Szczegóły zespołu</DialogTitle>
          <DialogDescription className="text-[#ccc5b9] font-open-sans">
            Edytuj informacje o zespole i zarządzaj jego członkami
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
            />
          </div>

          <div className="space-y-4">
            <Label className="text-lg text-[#fffcf2] font-roboto">Członkowie zespołu</Label>
            {editedTeam.members.map((member) => (
              <div key={member.id} className="flex items-center justify-between bg-[#403d39] p-3 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-[#eb5e28] flex items-center justify-center">
                    <span className="text-sm font-semibold text-[#fffcf2]">{member.avatar}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#fffcf2]">{member.name}</p>
                    <Select
                      value={member.role}
                      onValueChange={(newRole) => {
                        const updatedMembers = editedTeam.members.map((m) =>
                          m.id === member.id ? { ...m, role: newRole } : m,
                        )
                        setEditedTeam({ ...editedTeam, members: updatedMembers })
                      }}
                    >
                      <SelectTrigger className="w-[140px] h-8 text-xs bg-[#252422] border-none text-[#ccc5b9]">
                        <SelectValue placeholder="Wybierz rolę" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#252422] border-[#403d39]">
                        <SelectItem value="Producent" className="text-[#fffcf2]">
                          Producent
                        </SelectItem>
                        <SelectItem value="Inżynier dźwięku" className="text-[#fffcf2]">
                          Inżynier dźwięku
                        </SelectItem>
                        <SelectItem value="Artysta" className="text-[#fffcf2]">
                          Artysta
                        </SelectItem>
                        <SelectItem value="Menadżer" className="text-[#fffcf2]">
                          Menadżer
                        </SelectItem>
                        <SelectItem value="Edytor" className="text-[#fffcf2]">
                          Edytor
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {!member.confirmed && (
                    <span className="text-xs text-[#eb5e28] bg-[#eb5e28]/10 px-2 py-1 rounded-full">
                      niepotwierdzony
                    </span>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveMember(member.id)}
                    className="text-[#ccc5b9] hover:text-[#eb5e28]"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <Label className="text-lg text-[#fffcf2] font-roboto">Dodaj nowego członka</Label>
            <div className="flex space-x-2">
              <Input
                placeholder="Email"
                value={newMemberEmail}
                onChange={(e) => setNewMemberEmail(e.target.value)}
                className="bg-[#403d39] border-2 border-[#403d39] text-[#fffcf2] placeholder:text-[#ccc5b9]/50 focus:border-[#eb5e28] transition-colors"
              />
              <Select value={newMemberRole} onValueChange={setNewMemberRole}>
                <SelectTrigger className="w-[180px] bg-[#403d39] border-2 border-[#403d39] text-[#fffcf2]">
                  <SelectValue placeholder="Rola" />
                </SelectTrigger>
                <SelectContent className="bg-[#252422] border-[#403d39]">
                  <SelectItem value="Producent" className="text-[#fffcf2]">
                    Producent
                  </SelectItem>
                  <SelectItem value="Inżynier dźwięku" className="text-[#fffcf2]">
                    Inżynier dźwięku
                  </SelectItem>
                  <SelectItem value="Artysta" className="text-[#fffcf2]">
                    Artysta
                  </SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleAddMember} className="bg-[#eb5e28] text-white hover:bg-[#eb5e28]/90">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
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


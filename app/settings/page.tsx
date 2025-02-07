"use client"

import { useState, useEffect, useRef } from "react"
import { Layout } from "@/components/Layout"
import { Header } from "@/components/Header"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { Users2, Lock } from "lucide-react"
import { useSession, signOut } from "next-auth/react"

export default function SettingsPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [user, setUser] = useState<any>(null)
  const [blobLeft, setBlobLeft] = useState(0)
  const [blobWidth, setBlobWidth] = useState(0)
  const [blobHeight, setBlobHeight] = useState(0)
  const tabRefs = useRef({})

  useEffect(() => {
    if (session?.user?.name) {
      const names = session.user.name.split(" ")
      setFirstName(names[0] || "")
      setLastName(names.slice(1).join(" ") || "")
    }
  }, [session])

  const handleSaveChanges = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          firstName, 
          lastName,
          email: session?.user?.email
        })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Błąd aktualizacji danych")
      }
      
      router.refresh()
    } catch (error) {
      console.error("Błąd podczas aktualizacji danych:", error)
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async () => {
    setPasswordError("");

    if (newPassword !== confirmPassword) {
      setPasswordError("Hasła się nie zgadzają");
      return;
    }

    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await response.json();
      if (!response.ok) {
        setPasswordError(data.error || "Wystąpił błąd podczas zmiany hasła");
        return;
      }
      signOut();
    } catch (error: any) {
      console.error("Błąd zmiany hasła:", error);
      setPasswordError("Wystąpił błąd podczas zmiany hasła");
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm("Czy na pewno chcesz usunąć swoje konto? Ta operacja jest nieodwracalna.")) {
      return;
    }

    try {
      const response = await fetch("/api/auth/delete-account", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Błąd podczas usuwania konta:", data.error);
        return;
      }

      signOut();
    } catch (error) {
      console.error("Błąd podczas usuwania konta:", error);
    }
  };

  const updateBlobPosition = (element) => {
    setBlobLeft(element.offsetLeft)
    setBlobWidth(element.offsetWidth)
    setBlobHeight(element.offsetHeight)
  }

  useEffect(() => {
    const defaultTab = tabRefs.current["konto"]
    if (defaultTab) {
      updateBlobPosition(defaultTab)
    }
  }, [])

  return (
    <Layout>
      <Header title="Ustawienia" description="Zarządzaj swoimi preferencjami i ustawieniami konta" />

      <Tabs defaultValue="konto" className="space-y-6">
        <div className="relative">
          <TabsList className="bg-[#403d39] border-none w-full justify-start p-1 rounded-xl relative z-10">
            <div
              className="absolute bg-[#eb5e28] transition-all duration-300 ease-in-out rounded-lg"
              style={{
                width: blobWidth,
                height: blobHeight,
                transform: `translateX(${blobLeft}px)`,
              }}
            />
            {["konto", "bezpieczeństwo"].map((tab) => (
              <TabsTrigger
                key={tab}
                value={tab}
                className="flex items-center gap-2 px-4 py-2 relative z-20 transition-colors duration-300 data-[state=active]:bg-transparent data-[state=active]:text-white focus:outline-none text-[#ccc5b9] hover:text-white"
                onClick={(e) => updateBlobPosition(e.currentTarget)}
                ref={(el) => (tabRefs.current[tab] = el)}
              >
                {tab === "konto" && <Users2 className="w-4 h-4" />}
                {tab === "bezpieczeństwo" && <Lock className="w-4 h-4" />}
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value="konto" className="space-y-6">
          <Card className="bg-[#403d39] border-none p-6">
            <div>
              <h3 className="text-lg font-semibold text-[#fffcf2] mb-6 flex items-center gap-2">
                <Users2 className="w-5 h-5" />
                Informacje o profilu
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-[#fffcf2]">
                    Imię
                  </Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="bg-[#252422] border-[#403d39] text-[#fffcf2]"
                    placeholder="Twoje imię"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-[#fffcf2]">
                    Nazwisko
                  </Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="bg-[#252422] border-[#403d39] text-[#fffcf2]"
                    placeholder="Twoje nazwisko"
                  />
                </div>
              </div>
              <div className="flex justify-end mt-6">
                <Button 
                  onClick={handleSaveChanges}
                  disabled={loading}
                  className="bg-[#eb5e28] text-white hover:bg-[#eb5e28]/90"
                >
                  {loading ? "Zapisywanie..." : "Zapisz zmiany"}
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="bezpieczeństwo" className="space-y-6">
          <Card className="bg-[#403d39] border-none p-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-[#fffcf2] mb-4 flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  Zmiana hasła
                </h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword" className="text-[#fffcf2]">
                      Obecne hasło
                    </Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className={`bg-[#252422] border-[#403d39] text-[#fffcf2] ${passwordError ? "border-red-500" : ""}`}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword" className="text-[#fffcf2]">
                      Nowe hasło
                    </Label>
                    <Input 
                      id="newPassword" 
                      type="password" 
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className={`bg-[#252422] border-[#403d39] text-[#fffcf2] ${passwordError ? "border-red-500" : ""}`} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-[#fffcf2]">
                      Potwierdź nowe hasło
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`bg-[#252422] border-[#403d39] text-[#fffcf2] ${passwordError ? "border-red-500" : ""}`}
                    />
                  </div>
                  {passwordError && <p className="text-red-500 text-sm">{passwordError}</p>}
                  <Button 
                    onClick={handlePasswordChange}
                    className="bg-[#eb5e28] text-white hover:bg-[#eb5e28]/90"
                  >
                    Aktualizuj hasło
                  </Button>
                </div>
              </div>

              <Separator className="bg-[#252422]" />

              <div>
                <h3 className="text-lg font-semibold text-[#fffcf2] mb-4 text-red-500">Niebezpieczna strefa</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-[#fffcf2]">Usuń konto</Label>
                      <p className="text-sm text-[#ccc5b9]">Trwale usuń swoje konto i wszystkie powiązane dane</p>
                    </div>
                    <Button variant="destructive" onClick={handleDeleteAccount}>
                      Usuń konto
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </Layout>
  )
}


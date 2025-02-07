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

export default function SettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [blobLeft, setBlobLeft] = useState(0)
  const [blobWidth, setBlobWidth] = useState(0)
  const [blobHeight, setBlobHeight] = useState(0)
  const tabRefs = useRef({})

  const handlePasswordChange = async () => {
    // Implementation for password change
  }

  const handleDeleteAccount = async () => {
    // Implementation for account deletion
  }

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
                    className="bg-[#252422] border-[#403d39] text-[#fffcf2]"
                    placeholder="Twoje nazwisko"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-[#fffcf2]">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    className="bg-[#252422] border-[#403d39] text-[#fffcf2]"
                    placeholder="twoj@email.com"
                  />
                </div>
              </div>
              <div className="flex justify-end mt-6">
                <Button className="bg-[#eb5e28] text-white hover:bg-[#eb5e28]/90">
                  Zapisz zmiany
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
                      className="bg-[#252422] border-[#403d39] text-[#fffcf2]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword" className="text-[#fffcf2]">
                      Nowe hasło
                    </Label>
                    <Input id="newPassword" type="password" className="bg-[#252422] border-[#403d39] text-[#fffcf2]" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-[#fffcf2]">
                      Potwierdź nowe hasło
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      className="bg-[#252422] border-[#403d39] text-[#fffcf2]"
                    />
                  </div>
                  <Button className="bg-[#eb5e28] text-white hover:bg-[#eb5e28]/90">Aktualizuj hasło</Button>
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


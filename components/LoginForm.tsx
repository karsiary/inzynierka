"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { supabase } from "@/lib/supabase"
import { Loader2 } from "lucide-react"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      if (data.user) {
        console.log("Zalogowano pomyślnie:", data.user)
      } else {
        throw new Error("Brak danych użytkownika po zalogowaniu")
      }

      router.push("/dashboard")
    } catch (error) {
      console.error("Błąd logowania:", error)
      setError(`Błąd logowania: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleLogin} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="email" className="text-[#fffcf2] font-roboto text-sm">
          Email
        </Label>
        <Input
          id="email"
          placeholder="nazwa@example.com"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="bg-[#403d39] border-[#403d39] text-[#fffcf2] placeholder:text-[#ccc5b9]/50 py-2"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password" className="text-[#fffcf2] font-roboto text-sm">
          Hasło
        </Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="bg-[#403d39] border-[#403d39] text-[#fffcf2] py-2"
          required
        />
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox
          id="remember"
          className="border-[#ccc5b9] data-[state=checked]:bg-[#eb5e28] data-[state=checked]:border-[#eb5e28]"
        />
        <Label
          htmlFor="remember"
          className="text-sm font-medium text-[#ccc5b9] font-roboto leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Zapamiętaj mnie
        </Label>
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <Button
        type="submit"
        className="w-full bg-gradient-to-r from-[#eb5e28] to-[#eb5e28]/80 text-white hover:from-[#eb5e28]/90 hover:to-[#eb5e28]/70 font-roboto shadow-lg shadow-[#eb5e28]/20 py-2"
        disabled={isLoading}
      >
        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        {isLoading ? "Logowanie..." : "Zaloguj się"}
      </Button>
    </form>
  )
}


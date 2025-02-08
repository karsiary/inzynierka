"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { signIn } from "next-auth/react"

export function RegisterForm() {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      if (password !== confirmPassword) {
        throw new Error("Hasła nie są identyczne")
      }

      if (password.length < 6) {
        throw new Error("Hasło musi mieć co najmniej 6 znaków")
      }

      
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          name: `${firstName} ${lastName}`,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Wystąpił błąd podczas rejestracji")
      }

      
      
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })
      

      if (result?.error) {
        throw new Error(result.error)
      }

      router.push("/dashboard")
      router.refresh()
    } catch (error) {
      console.error("Szczegóły błędu rejestracji:", error)
      setError(error instanceof Error ? error.message : "Wystąpił błąd podczas rejestracji")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleRegister} className="space-y-6">
      <div className="grid gap-4 grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="firstName" className="text-[#fffcf2] font-roboto">
            Imię
          </Label>
          <Input
            id="firstName"
            placeholder="Jan"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="bg-[#403d39] border-[#403d39] text-[#fffcf2] placeholder:text-[#ccc5b9]/50"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName" className="text-[#fffcf2] font-roboto">
            Nazwisko
          </Label>
          <Input
            id="lastName"
            placeholder="Kowalski"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="bg-[#403d39] border-[#403d39] text-[#fffcf2] placeholder:text-[#ccc5b9]/50"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email" className="text-[#fffcf2] font-roboto">
          Email
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="nazwa@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="bg-[#403d39] border-[#403d39] text-[#fffcf2] placeholder:text-[#ccc5b9]/50"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-[#fffcf2] font-roboto">
          Hasło
        </Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="bg-[#403d39] border-[#403d39] text-[#fffcf2]"
          required
          minLength={6}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword" className="text-[#fffcf2] font-roboto">
          Potwierdź hasło
        </Label>
        <Input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="bg-[#403d39] border-[#403d39] text-[#fffcf2]"
          required
          minLength={6}
        />
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}
      <Button
        type="submit"
        className="w-full bg-gradient-to-r from-[#eb5e28] to-[#eb5e28]/80 text-white hover:from-[#eb5e28]/90 hover:to-[#eb5e28]/70 font-roboto shadow-lg shadow-[#eb5e28]/20"
        disabled={isLoading}
      >
        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        {isLoading ? "Rejestracja..." : "Zarejestruj się"}
      </Button>
    </form>
  )
}


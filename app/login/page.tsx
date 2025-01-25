"use client"

import Link from "next/link"
import { LoginForm } from "@/components/LoginForm"

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#252422] flex">
      {/* Gradient Background */}
      <div className="absolute top-0 left-0 w-full h-full z-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(235,94,40,0.15),rgba(37,36,34,0))]" />

      {/* Content */}
      <div className="relative z-10 flex w-full">
        {/* Left Side - Form */}
        <div className="w-full lg:w-1/2 p-8 sm:p-12 xl:p-24 flex items-center justify-center">
          <div className="w-full max-w-lg space-y-6 bg-[#252422] p-8 rounded-3xl border border-[#403d39] shadow-lg">
            {/* Header */}
            <div className="space-y-3 mb-6">
              <h1 className="text-3xl font-bold text-[#fffcf2] font-montserrat">Zaloguj się</h1>
              <p className="text-[#ccc5b9] font-open-sans text-sm">Wprowadź swój email i hasło, aby się zalogować</p>
            </div>

            {/* Form */}
            <LoginForm />

            {/* Footer */}
            <p className="text-sm text-center text-[#ccc5b9] font-open-sans mt-6">
              Nie masz jeszcze konta?{" "}
              <Link href="/register" className="text-[#eb5e28] hover:text-[#eb5e28]/80 font-semibold font-roboto">
                Zarejestruj się
              </Link>
            </p>
          </div>
        </div>

        {/* Right Side - Feature Showcase */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#403d39] to-[#252422] p-12 items-center justify-center">
          <div className="max-w-md space-y-4 text-center">
            <div className="inline-flex items-center justify-center rounded-full bg-[#eb5e28]/10 px-3 py-1 text-sm text-[#eb5e28] font-roboto">
              Co nowego?
            </div>
            <h2 className="text-3xl font-bold text-[#fffcf2] font-montserrat">Nowe funkcje zarządzania projektem</h2>
            <p className="text-[#ccc5b9] font-open-sans">
              Wsłuchaliśmy się w Wasze potrzeby! Dodaliśmy nowe narzędzia do zarządzania projektami audio, aby usprawnić
              Wasz proces produkcyjny.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}


"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Shield, AudioWaveformIcon as Waveform, Users, Plus, ChevronRight } from "lucide-react"
import { useEffect } from "react"
import { motion } from "framer-motion"

export default function LandingPage() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <div className="min-h-screen bg-[#252422] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full z-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(235,94,40,0.15),rgba(37,36,34,0))]"></div>
        <div className="relative z-10">
          {/* Nawigacja */}
          <nav className="border-b border-[#403d39] bg-[#252422]/80 backdrop-blur-sm sticky top-0 z-50">
            <div className="container mx-auto px-4 py-4 flex items-center">
              <Link href="/" className="text-[#fffcf2] text-3xl font-bold flex items-center font-montserrat py-2">
                <span className="text-[#eb5e28]">Audio</span>
                <span>Plan</span>
              </Link>
              <div className="hidden md:flex items-center justify-center flex-grow space-x-8 text-[#ccc5b9] ml-8">
                <Link href="/features" className="hover:text-[#eb5e28] font-roboto">
                  Funkcje
                </Link>
                <Link href="/pricing" className="hover:text-[#eb5e28] font-roboto">
                  Cennik
                </Link>
                <Link href="/about" className="hover:text-[#eb5e28] font-roboto">
                  O nas
                </Link>
              </div>
              <div className="flex items-center space-x-4 ml-auto">
                <Link href="/login">
                  <Button
                    variant="ghost"
                    className="text-[#ccc5b9] hover:text-[#eb5e28] hover:bg-[#403d39] rounded-full px-6 py-2 transition-all duration-300 font-roboto"
                  >
                    Zaloguj się
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="bg-gradient-to-r from-[#eb5e28] to-[#eb5e28]/80 text-white hover:from-[#eb5e28]/90 hover:to-[#eb5e28]/70 rounded-full px-6 py-2 shadow-lg shadow-[#eb5e28]/20 transition-all duration-300 font-roboto">
                    Zarejestruj się
                  </Button>
                </Link>
              </div>
            </div>
          </nav>

          {/* Sekcja Hero */}
          <section className="container mx-auto px-4 py-24 text-center flex flex-col items-center">
            <div className="inline-flex items-center bg-[#403d39]/50 rounded-full px-4 py-1.5 mb-8">
              <span className="text-[#ccc5b9] text-sm font-open-sans">
                Zaufany przez Profesjonalistów Audio na Całym Świecie
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-[#fffcf2] mb-6 font-montserrat">
              Zrewolucjonizuj Swój
              <span className="block text-[#eb5e28]">Proces Produkcji Muzycznej</span>
            </h1>
            <motion.p
              className="text-xl text-[#ccc5b9] max-w-2xl mx-auto mb-12 font-open-sans"
              initial={{ opacity: 0, filter: "blur(10px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              transition={{ duration: 1, delay: 0.5 }}
            >
              {[
                "Usprawnij",
                "swoje",
                "projekty",
                "audio",
                "dzięki",
                "kompleksowym",
                "narzędziom",
                "do",
                "zarządzania",
                "projektami,",
                "stworzonym",
                "specjalnie",
                "dla",
                "producentów",
                "muzycznych,",
                "inżynierów",
                "i",
                "artystów.",
              ].map((word, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, filter: "blur(10px)" }}
                  animate={{ opacity: 1, filter: "blur(0px)" }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  {word}{" "}
                </motion.span>
              ))}
            </motion.p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 w-full max-w-lg">
              <Link href="/register">
                <Button className="bg-gradient-to-r from-[#eb5e28] to-[#eb5e28]/80 text-white hover:from-[#eb5e28]/90 hover:to-[#eb5e28]/70 rounded-full px-8 py-6 text-lg shadow-lg shadow-[#eb5e28]/20 transition-all duration-300 flex items-center gap-2 font-roboto">
                  <Plus className="w-5 h-5" />
                  Rozpocznij Teraz
                </Button>
              </Link>
              <Link href="/features">
                <Button
                  variant="outline"
                  className="border-2 border-[#fffcf2] bg-[#fffcf2] text-[#252422] hover:bg-[#403d39] hover:border-[#403d39] hover:text-[#fffcf2] rounded-full px-8 py-6 text-lg transition-all duration-300 flex items-center gap-2 font-roboto"
                >
                  <ChevronRight className="w-5 h-5" />
                  Zobacz Funkcje
                </Button>
              </Link>
            </div>
          </section>

          {/* Sekcja Funkcji */}
          <section className="container mx-auto px-4 py-24">
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: Shield,
                  title: "Bezpieczeństwo Projektów",
                  description:
                    "Zabezpiecz swoje projekty audio i pliki dzięki ochronie klasy korporacyjnej i systemom kopii zapasowych.",
                },
                {
                  icon: Waveform,
                  title: "Płynna Integracja",
                  description:
                    "Integruj się z ulubionymi programami DAW i narzędziami audio, aby usprawnić proces produkcji.",
                },
                {
                  icon: Users,
                  title: "Współpraca Zespołowa",
                  description:
                    "Współpracuj z członkami zespołu, artystami i klientami w czasie rzeczywistym dzięki zaawansowanym narzędziom do udostępniania.",
                },
              ].map((card, index) => (
                <motion.div
                  key={index}
                  className="bg-[#403d39] rounded-lg p-6 text-center cursor-pointer"
                  whileHover={{ scale: 1.05, boxShadow: "0 10px 20px rgba(235,94,40,0.2)" }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <motion.div
                    className="w-12 h-12 bg-[#eb5e28]/10 rounded-lg flex items-center justify-center mx-auto mb-4 shadow-[0_0_15px_rgba(235,94,40,0.3)]"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    <card.icon className="w-6 h-6 text-[#eb5e28]" />
                  </motion.div>
                  <h3 className="text-[#fffcf2] text-xl font-semibold mb-3 font-montserrat">{card.title}</h3>
                  <p className="text-[#ccc5b9] font-open-sans">{card.description}</p>
                </motion.div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </motion.div>
  )
}


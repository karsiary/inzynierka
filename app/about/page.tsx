"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronLeft, Music2, Users2, Wand2, Trophy } from "lucide-react"
import { motion } from "framer-motion"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#252422] relative overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute top-0 left-0 w-full h-full z-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(235,94,40,0.15),rgba(37,36,34,0))]" />

      <div className="relative z-10">
        {/* Navigation */}
        <nav className="border-b border-[#403d39] bg-[#252422]/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link href="/" className="text-[#fffcf2] text-3xl font-bold flex items-center font-montserrat">
              <span className="text-[#eb5e28]">Audio</span>
              <span>Plan</span>
            </Link>
            <Link href="/">
              <Button
                variant="ghost"
                className="text-[#ccc5b9] hover:text-[#eb5e28] hover:bg-[#403d39] rounded-full px-6 py-2 transition-all duration-300 font-roboto"
              >
                <ChevronLeft className="w-5 h-5 mr-2" />
                Powrót
              </Button>
            </Link>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="container mx-auto px-4 py-24 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-[#fffcf2] mb-6 font-montserrat">
              Pasja do Muzyki, <span className="text-[#eb5e28]">Innowacja w Zarządzaniu</span>
            </h1>
            <p className="text-xl text-[#ccc5b9] mb-12 font-open-sans">
              Jesteśmy zespołem pasjonatów muzyki i technologii, którzy połączyli siły, aby stworzyć narzędzie
              usprawniające proces produkcji muzycznej.
            </p>
          </motion.div>
        </section>

        {/* Stats Section */}
        <section className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { number: "150+", label: "Aktywnych Projektów", icon: Music2 },
              { number: "1000+", label: "Zadowolonych Użytkowników", icon: Users2 },
              { number: "50+", label: "Funkcji Produktu", icon: Wand2 },
              { number: "25+", label: "Nagród Branżowych", icon: Trophy },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-[#403d39] rounded-lg p-6 text-center"
              >
                <div className="w-12 h-12 bg-[#eb5e28]/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="w-6 h-6 text-[#eb5e28]" />
                </div>
                <h3 className="text-3xl font-bold text-[#fffcf2] mb-2 font-montserrat">{stat.number}</h3>
                <p className="text-[#ccc5b9] font-open-sans">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Values Section */}
        <section className="container mx-auto px-4 py-24">
          <h2 className="text-3xl font-bold text-[#fffcf2] mb-12 text-center font-montserrat">
            Nasze <span className="text-[#eb5e28]">Wartości</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Innowacja",
                description:
                  "Nieustannie poszukujemy nowych rozwiązań, aby uczynić proces produkcji muzycznej bardziej efektywnym i przyjemnym.",
              },
              {
                title: "Jakość",
                description:
                  "Dbamy o najwyższą jakość naszych rozwiązań, aby spełnić wymagania najbardziej wymagających profesjonalistów audio.",
              },
              {
                title: "Współpraca",
                description:
                  "Wierzymy w siłę współpracy i budujemy narzędzia, które ułatwiają komunikację i pracę zespołową.",
              },
            ].map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-[#403d39] rounded-lg p-8"
              >
                <h3 className="text-xl font-bold text-[#fffcf2] mb-4 font-montserrat">{value.title}</h3>
                <p className="text-[#ccc5b9] font-open-sans">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Contact Section */}
        <section className="container mx-auto px-4 py-24">
          <div className="bg-[#403d39] rounded-lg p-12 text-center">
            <h2 className="text-3xl font-bold text-[#fffcf2] mb-6 font-montserrat">
              Dołącz do Naszej <span className="text-[#eb5e28]">Społeczności</span>
            </h2>
            <p className="text-[#ccc5b9] mb-8 max-w-2xl mx-auto font-open-sans">
              Jesteśmy zawsze otwarci na nowe współprace i pomysły. Skontaktuj się z nami, aby dowiedzieć się więcej o
              tym, jak możemy wspólnie rozwijać branżę audio.
            </p>
            <Button className="bg-[#eb5e28] text-white hover:bg-[#eb5e28]/90 rounded-full px-8 py-6 text-lg">
              Skontaktuj się z nami
            </Button>
          </div>
        </section>
      </div>
    </div>
  )
}


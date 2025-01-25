"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronLeft, Check, Users, HardDrive, Sparkles, Shield, Globe, Share2, Calendar, Music2 } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

export default function PricingPage() {
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

        {/* Main Content */}
        <main className="container mx-auto px-4 py-24">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-[#fffcf2] mb-6 font-montserrat">
              Wybierz Plan <span className="text-[#eb5e28]">Odpowiedni dla Ciebie</span>
            </h1>
            <p className="text-xl text-[#ccc5b9] max-w-2xl mx-auto font-open-sans">
              Elastyczne opcje cenowe dopasowane do potrzeb Twojego zespołu i projektów muzycznych
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Basic Plan */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#2a9d8f]/20 to-[#2a9d8f]/10 rounded-2xl blur-xl transition-all duration-300 group-hover:blur-2xl" />
              <div className="relative bg-[#403d39]/50 backdrop-blur-sm border border-[#2a9d8f]/30 rounded-2xl p-8 transition-transform duration-300 hover:translate-y-[-4px]">
                <h3 className="text-2xl font-bold text-[#fffcf2] mb-2 font-montserrat">Standard</h3>
                <p className="text-[#ccc5b9] mb-6 font-open-sans">Idealne dla małych zespołów muzycznych</p>
                <div className="flex items-baseline mb-8">
                  <span className="text-4xl font-bold text-[#fffcf2] font-montserrat">29</span>
                  <span className="text-xl text-[#ccc5b9] ml-2 font-open-sans">PLN/mies.</span>
                </div>
                <Button className="w-full mb-8 bg-[#2a9d8f] hover:bg-[#2a9d8f]/90 text-white rounded-full font-roboto">
                  Wybierz plan
                </Button>
                <ul className="space-y-4">
                  <PricingFeature icon={Users}>10 członków zespołu</PricingFeature>
                  <PricingFeature icon={HardDrive}>5GB przestrzeni</PricingFeature>
                </ul>
              </div>
            </motion.div>

            {/* Pro Plan */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#eb5e28]/20 to-[#eb5e28]/10 rounded-2xl blur-xl transition-all duration-300 group-hover:blur-2xl" />
              <div className="relative bg-[#403d39]/50 backdrop-blur-sm border border-[#eb5e28]/30 rounded-2xl p-8 transition-transform duration-300 hover:translate-y-[-4px]">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-[#eb5e28] text-white px-4 py-1 rounded-full text-sm font-medium font-roboto">
                    Najpopularniejszy
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-[#fffcf2] mb-2 font-montserrat">Professional</h3>
                <p className="text-[#ccc5b9] mb-6 font-open-sans">Dla profesjonalnych studiów nagrań</p>
                <div className="flex items-baseline mb-8">
                  <span className="text-4xl font-bold text-[#fffcf2] font-montserrat">100</span>
                  <span className="text-xl text-[#ccc5b9] ml-2 font-open-sans">PLN/mies.</span>
                </div>
                <Button className="w-full mb-8 bg-[#eb5e28] hover:bg-[#eb5e28]/90 text-white rounded-full font-roboto">
                  Wybierz plan
                </Button>
                <ul className="space-y-4">
                  <PricingFeature icon={Users}>10 członków zespołu</PricingFeature>
                  <PricingFeature icon={HardDrive}>10GB przestrzeni</PricingFeature>
                  <PricingFeature icon={Calendar}>Kalendarz projektów</PricingFeature>
                  <PricingFeature icon={Music2}>Zwiększony limit piosenek w projekcie</PricingFeature>
                  <PricingFeature icon={Shield}>Zaawansowane zabezpieczenia</PricingFeature>
                  <PricingFeature icon={Share2}>Zaawansowane opcje współpracy</PricingFeature>
                </ul>
              </div>
            </motion.div>

            {/* Enterprise Plan */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#8338ec]/20 to-[#8338ec]/10 rounded-2xl blur-xl transition-all duration-300 group-hover:blur-2xl" />
              <div className="relative bg-[#403d39]/50 backdrop-blur-sm border border-[#8338ec]/30 rounded-2xl p-8 transition-transform duration-300 hover:translate-y-[-4px]">
                <h3 className="text-2xl font-bold text-[#fffcf2] mb-2 font-montserrat">Enterprise</h3>
                <p className="text-[#ccc5b9] mb-6 font-open-sans">Dedykowane rozwiązania dla dużych wytwórni</p>
                <div className="flex items-baseline mb-8">
                  <span className="text-2xl text-[#fffcf2] font-montserrat">Skontaktuj się</span>
                </div>
                <Button
                  variant="outline"
                  className="border-2 border-[#403d39] text-[#ccc5b9] hover:text-[#fffcf2] hover:bg-[#403d39] rounded-full px-8 py-6 text-lg transition-all duration-300 font-roboto"
                >
                  Skontaktuj się z nami
                </Button>
                <ul className="space-y-4">
                  <PricingFeature icon={Users}>Nielimitowana liczba użytkowników</PricingFeature>
                  <PricingFeature icon={HardDrive}>Nielimitowana przestrzeń</PricingFeature>
                  <PricingFeature icon={Music2}>Nielimitowana ilość piosenek w projekcie</PricingFeature>
                  <PricingFeature icon={Calendar}>Kalendarz projektów</PricingFeature>
                  <PricingFeature icon={Shield}>Enterprise-level security</PricingFeature>
                  <PricingFeature icon={Share2}>24/7 wsparcie premium</PricingFeature>
                </ul>
              </div>
            </motion.div>
          </div>

          {/* FAQ Section */}
          <div className="mt-24 text-center">
            <h2 className="text-3xl font-bold text-[#fffcf2] mb-4 font-montserrat">Masz pytania?</h2>
            <p className="text-[#ccc5b9] mb-8 font-open-sans">
              Nasz zespół jest dostępny 24/7, aby pomóc Ci wybrać najlepsze rozwiązanie
            </p>
            <Button
              variant="outline"
              className="border-2 border-[#403d39] text-[#ccc5b9] hover:text-[#fffcf2] hover:bg-[#403d39] rounded-full px-8 py-6 text-lg transition-all duration-300 font-roboto"
            >
              Sprawdź FAQ
            </Button>
          </div>
        </main>
      </div>
    </div>
  )
}

function PricingFeature({ children, icon: Icon }) {
  return (
    <li className="flex items-center gap-3 text-[#ccc5b9] font-open-sans">
      <div className="rounded-full p-1 bg-[#eb5e28]/10">
        <Icon className="w-4 h-4 text-[#eb5e28]" />
      </div>
      {children}
    </li>
  )
}


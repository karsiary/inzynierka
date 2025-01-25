import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronLeft, Shield, AudioWaveform, Users, Calendar, BarChart3 } from "lucide-react"

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-[#252422] relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full z-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(235,94,40,0.15),rgba(37,36,34,0))]"></div>
      <div className="relative z-10">
        {/* Navigation */}
        <nav className="border-b border-[#403d39] bg-[#252422]/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link href="/" className="text-[#fffcf2] text-3xl font-bold flex items-center font-montserrat py-2">
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
        <main className="container mx-auto px-4 py-16">
          <h1 className="text-4xl md:text-5xl font-bold text-[#fffcf2] mb-8 font-montserrat text-center">
            Funkcje <span className="text-[#eb5e28]">Audio</span>
            <span className="text-[#fffcf2]">Plan</span>
          </h1>
          <p className="text-xl text-[#ccc5b9] max-w-3xl mx-auto mb-16 text-center font-open-sans">
            Odkryj, jak AudioPlan rewolucjonizuje proces produkcji muzycznej, oferując kompleksowe narzędzia dla
            profesjonalistów audio.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={Shield}
              title="Bezpieczeństwo Projektów"
              description="Zaawansowane zabezpieczenia i kopie zapasowe chronią Twoje cenne projekty audio."
            />
            <FeatureCard
              icon={AudioWaveform}
              title="Integracja z DAW"
              description="Płynna integracja z popularnymi programami do produkcji muzycznej."
            />
            <FeatureCard
              icon={Users}
              title="Współpraca Zespołowa"
              description="Narzędzia do współpracy w czasie rzeczywistym dla efektywnej pracy zespołowej."
            />
            <FeatureCard
              icon={Calendar}
              title="Zarządzanie Harmonogramem"
              description="Zaawansowany kalendarz do planowania sesji nagraniowych i terminów projektów."
            />
            <FeatureCard
              icon={BarChart3}
              title="Analityka Projektów"
              description="Szczegółowe raporty i statystyki pomagające w optymalizacji procesu produkcji."
            />
            <FeatureCard
              icon={AudioWaveform}
              title="Zarządzanie Plikami Audio"
              description="Centralne repozytorium dla wszystkich Twoich plików audio z łatwym dostępem i organizacją."
            />
          </div>
        </main>
      </div>
    </div>
  )
}

function FeatureCard({ icon: Icon, title, description }) {
  return (
    <div className="bg-[#403d39] rounded-lg p-6 text-center transition-all duration-300 hover:shadow-xl hover:shadow-[#eb5e28]/10">
      <div className="w-16 h-16 bg-[#eb5e28]/10 rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_0_15px_rgba(235,94,40,0.3)]">
        <Icon className="w-8 h-8 text-[#eb5e28]" />
      </div>
      <h3 className="text-[#fffcf2] text-xl font-semibold mb-3 font-montserrat">{title}</h3>
      <p className="text-[#ccc5b9] font-open-sans">{description}</p>
    </div>
  )
}


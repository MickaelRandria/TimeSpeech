import React from 'react'
import AppShell from '../components/AppShell'
import Card from '../components/Card'
import Button from '../components/Button'
import StatCard from '../components/StatCard'

interface LandingProps {
  onStart: () => void
  onDemo: () => void
  onConnexion: () => void
  isLoggedIn?: boolean
}

function DocIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="12" height="16" rx="2"/>
      <path d="M7 7h6M7 10h6M7 13h4"/>
    </svg>
  )
}
function ClockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10" cy="10" r="8"/>
      <path d="M10 6v4l3 2"/>
    </svg>
  )
}
function ListIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 6h12M4 10h12M4 14h8"/>
    </svg>
  )
}
function SlidesIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="16" height="11" rx="2"/>
      <path d="M8 18h4M10 15v3"/>
    </svg>
  )
}

export default function Landing({ onStart, onDemo, onConnexion, isLoggedIn }: LandingProps) {
  return (
    <AppShell activeSidebarItem="accueil" stepLabel="Accueil" showDemoStatus={false} onConnexion={onConnexion} isLoggedIn={isLoggedIn} userInitials="JB" userName="Julien">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 h-full">
        {/* Left hero card */}
        <Card padding="p-10" className="lg:col-span-3 h-full flex flex-col justify-between">
          <div>
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/5 border border-primary/10 rounded-pill px-3 py-1 mb-6">
              ✦ Calibration vocale intégrée
            </span>
            <h1 className="text-4xl font-extrabold text-ink leading-tight tracking-tight mb-4">
              Créez un cours qui{' '}
              <span className="text-primary bg-gradient-to-r from-primary to-violet-500 bg-clip-text text-transparent">tient vraiment dans le temps prévu.</span>
            </h1>
            <p className="text-base text-slate-500 mb-8 max-w-md leading-relaxed font-medium">
              TimeSpeech transforme un brief pédagogique en cours structuré, minuté et prêt à présenter.
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              <Button variant="primary" size="lg" onClick={onStart}>
                Essayer gratuitement
              </Button>
              <Button variant="secondary" size="lg" onClick={onDemo}>
                Voir une démo
              </Button>
            </div>
          </div>
          <p className="text-[10px] font-bold text-slate-400 mt-8 uppercase tracking-widest">
            Utilisé par des intervenants dans des écoles de design, business et ingénierie.
          </p>
        </Card>

        {/* Right column — StatCards */}
        <div className="lg:col-span-2 flex flex-col gap-3">
          <StatCard eyebrow="BRIEF PÉDAGOGIQUE" icon={<DocIcon />} value="Importez votre brief" supporting="PDF, DOCX ou texte libre" />
          <StatCard eyebrow="DURÉE CIBLE" icon={<ClockIcon />} value="2h00 définie" supporting="Par le programme ESD" />
          <StatCard eyebrow="PLAN MINUTÉ" icon={<ListIcon />} value="5 parties" supporting="Chaque section chronométrée" filled={true} />
          <StatCard eyebrow="SLIDES GÉNÉRÉES" icon={<SlidesIcon />} value="18 slides" supporting="Support clé-en-main" badge={{ label: 'Prêtes', variant: 'success' }} />
        </div>
      </div>
    </AppShell>
  )
}

import React from 'react'
import AppShell from '../components/AppShell'
import Card from '../components/Card'
import Button from '../components/Button'
import Badge from '../components/Badge'

interface TutorialProps {
  onStart: () => void
  isLoggedIn?: boolean
}

const tutorialSteps = [
  { num: '01', title: 'Importez un brief',          desc: "TimeSpeech transforme votre brief pédagogique en cours structuré.", icon: '📄' },
  { num: '02', title: 'Calibrez le timing',          desc: "Chaque partie est minutée selon la durée prévue.", icon: '⏱' },
  { num: '03', title: 'Personnalisez votre profil', desc: "Plus TimeSpeech connaît votre rythme, plus ses estimations deviennent précises.", icon: '🎤' },
]

export default function Tutorial({ onStart, isLoggedIn }: TutorialProps) {
  return (
    <AppShell activeSidebarItem="accueil" stepLabel="Bienvenue" showDemoStatus={true} isLoggedIn={isLoggedIn} userInitials="JB" userName="Julien">
      <div className="max-w-2xl mx-auto text-center">
        <div className="mb-10">
          <Badge label="Compte créé ✓" variant="success" className="mb-4" />
          <h1 className="text-3xl font-extrabold text-ink tracking-tight mb-2">
            Bienvenue sur TimeSpeech, Julien 👋
          </h1>
          <p className="text-slate-500 text-sm font-medium">
            Voici comment tirer le meilleur de l'application en 3 étapes simples.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          {tutorialSteps.map((step) => (
            <Card key={step.num} padding="p-6" className="text-left border border-slate-100/90 shadow-card hover:-translate-y-[2px] hover:shadow-md hover:border-primary/10 transition-all duration-300 ease-out">
              <p className="text-4xl font-extrabold text-primary/20 mb-3 font-mono tracking-tight">{step.num}</p>
              <p className="text-2xl mb-3">{step.icon}</p>
              <p className="text-base font-bold text-ink mb-1.5 tracking-tight">{step.title}</p>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">{step.desc}</p>
            </Card>
          ))}
        </div>

        <Button variant="primary" size="lg" onClick={onStart}>
          Commencer →
        </Button>
      </div>
    </AppShell>
  )
}

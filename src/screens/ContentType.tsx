import React from 'react'
import AppShell from '../components/AppShell'
import ChoiceCard from '../components/ChoiceCard'
import Button from '../components/Button'
import SectionHeader from '../components/SectionHeader'

interface ContentTypeProps {
  onSelectCours: () => void
  onBack: () => void
  isLoggedIn?: boolean
}

function CoursIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="14" height="14" rx="2"/>
      <path d="M7 7h6M7 10h6M7 13h4"/>
    </svg>
  )
}
function FormationIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10" cy="10" r="8"/>
      <path d="M10 6v4l3 2"/>
    </svg>
  )
}
function ConferenceIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 14l4-4 3 3 4-6 3 4"/>
    </svg>
  )
}
function SoutenanceIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 3l2 4 5 .5-3.5 3.5 1 5L10 14l-4.5 2 1-5L3 7.5 8 7z"/>
    </svg>
  )
}

export default function ContentType({ onSelectCours, onBack, isLoggedIn }: ContentTypeProps) {
  return (
    <AppShell activeSidebarItem="demo" stepLabel="Choisir le contenu" showDemoStatus={true} stepProgress="Étape 1 sur 6" isLoggedIn={isLoggedIn} userInitials="JB" userName="Julien">
      <SectionHeader
        eyebrow="DÉMO GRATUITE · SANS COMPTE"
        title="Que voulez-vous préparer ?"
        subtitle="Sélectionnez le type de contenu pour commencer. TimeSpeech adapte la structure à votre besoin."
      />
      <div className="grid grid-cols-2 gap-4">
        <ChoiceCard title="Cours" description="Créer un cours structuré à partir d'un brief." icon={<CoursIcon />} iconBg="bg-primary/10" recommended={true} onClick={onSelectCours} />
        <ChoiceCard title="Formation" description="Adapter un contenu à une durée précise." icon={<FormationIcon />} iconBg="bg-slate-100" disabled />
        <ChoiceCard title="Conférence" description="Calibrer un talk pour tenir son timing." icon={<ConferenceIcon />} iconBg="bg-slate-100" disabled />
        <ChoiceCard title="Soutenance" description="Préparer une prise de parole courte et impactante." icon={<SoutenanceIcon />} iconBg="bg-slate-100" disabled />
      </div>
      <Button variant="ghost" onClick={onBack} className="mt-4">← Retour</Button>
    </AppShell>
  )
}

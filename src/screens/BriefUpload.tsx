import React, { useState } from 'react'
import AppShell from '../components/AppShell'
import Card from '../components/Card'
import Button from '../components/Button'
import UploadCard from '../components/UploadCard'
import SectionHeader from '../components/SectionHeader'

interface BriefUploadProps {
  briefText: string
  onBriefChange: (text: string) => void
  onSubmit: () => void
  onBack: () => void
  isLoggedIn?: boolean
}

const CheckIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

const SpinnerIcon = () => (
  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
)

const CloudUploadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z" />
  </svg>
)

export default function BriefUpload({ briefText, onBriefChange, onSubmit, onBack, isLoggedIn }: BriefUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [isUploaded,  setIsUploaded]  = useState(false)

  function handleUploadClick() {
    if (isUploading) return
    if (isUploaded) {
      // Allow re-upload
      setIsUploaded(false)
      return
    }
    setIsUploading(true)
    setTimeout(() => {
      setIsUploading(false)
      setIsUploaded(true)
    }, 700)
  }

  return (
    <AppShell activeSidebarItem="brief" stepLabel="Déposer le brief" showDemoStatus={true} stepProgress="Étape 2 sur 6" isLoggedIn={isLoggedIn} userInitials="JB" userName="Julien">
      <SectionHeader
        eyebrow="ÉTAPE 2 · BRIEF PÉDAGOGIQUE"
        title="Déposez le brief de votre cours"
        subtitle="Importez ou collez le programme reçu de votre école. TimeSpeech analyse le brief pour structurer le cours."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Left: file drop zone */}
        {isUploaded ? (
          <div
            onClick={handleUploadClick}
            className="border-2 border-solid border-emerald-300 rounded-card p-10 text-center hover:border-emerald-400 hover:bg-emerald-50/20 hover:-translate-y-[2px] cursor-pointer transition-all duration-300 ease-out bg-white flex flex-col items-center justify-center gap-3 min-h-[220px]"
          >
            <div className="w-14 h-14 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-500 mb-1">
              <CheckIcon />
            </div>
            <p className="text-sm font-semibold text-ink">brief-ESD-bordeaux.pdf</p>
            <p className="text-xs text-emerald-600 font-semibold">Déposé avec succès</p>
            <span className="text-[10px] font-semibold text-slate-400 mt-1">Cliquer pour changer de fichier</span>
          </div>
        ) : isUploading ? (
          <div className="border-2 border-dashed border-primary/30 rounded-card p-10 text-center bg-white flex flex-col items-center justify-center gap-3 min-h-[220px]">
            <div className="w-14 h-14 bg-primary/5 rounded-xl flex items-center justify-center mb-1">
              <SpinnerIcon />
            </div>
            <p className="text-sm font-semibold text-primary">Chargement en cours…</p>
            <p className="text-xs text-slate-400">Analyse du document</p>
          </div>
        ) : (
          <UploadCard
            title="Glissez-déposez un fichier"
            subtitle="PDF, DOCX ou TXT"
            icon={<CloudUploadIcon />}
            onClick={handleUploadClick}
          />
        )}

        {/* Right: document-style textarea */}
        <Card padding="p-0" className="flex flex-col overflow-hidden border border-slate-100/90 shadow-card">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-slate-300" />
              <span className="w-2 h-2 rounded-full bg-slate-300" />
              <span className="w-2 h-2 rounded-full bg-slate-300" />
            </div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Brief ESD Bordeaux — Julien Bertrand</span>
            <div className="w-12" />
          </div>
          <textarea
            value={briefText}
            onChange={(e) => onBriefChange(e.target.value)}
            className="flex-1 w-full px-6 py-5 text-sm text-slate-700 font-mono leading-relaxed resize-none focus:outline-none bg-white min-h-[220px] transition-colors duration-300"
            placeholder="Collez le brief ici..."
          />
        </Card>
      </div>

      <div className="flex items-center justify-between mt-5">
        <Button variant="ghost" onClick={onBack}>← Retour</Button>
        <Button variant="primary" size="lg" onClick={onSubmit}>Créer le cours →</Button>
      </div>
    </AppShell>
  )
}

import React from 'react'
import AppShell from '../components/AppShell'
import Card from '../components/Card'
import Button from '../components/Button'
import Badge from '../components/Badge'
import InfoRow from '../components/InfoRow'
import SectionHeader from '../components/SectionHeader'

interface ProfilePersonalizationProps {
  onCalibrate: () => void
  onSkip: () => void
  showCalibrationResult: boolean
  onDone: () => void
  isLoggedIn?: boolean
}

export default function ProfilePersonalization({ onCalibrate, onSkip, showCalibrationResult, onDone, isLoggedIn }: ProfilePersonalizationProps) {
  return (
    <AppShell activeSidebarItem="profil" stepLabel="Profil orateur" showDemoStatus={true} stepProgress="Étape 6 sur 6" isLoggedIn={isLoggedIn} userInitials="JB" userName="Julien">
      <SectionHeader
        eyebrow="ÉTAPE 6 · PROFIL ORATEUR"
        title="Personnalisez votre profil orateur"
        subtitle="TimeSpeech utilise votre profil pour affiner les estimations de durée à votre rythme de parole."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left — profile card */}
        <Card padding="p-6" className="border border-slate-100/90 shadow-card">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">Votre profil</p>
          <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-100">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-extrabold text-lg border border-primary/15 shadow-sm">
              JB
            </div>
            <div>
              <p className="text-sm font-extrabold text-ink tracking-tight">Julien Bertrand</p>
              <p className="text-xs text-slate-500 font-semibold">Consultant data · Intervenant ESD</p>
            </div>
          </div>
          <InfoRow label="Métier" value="Consultant data / intervenant ESD" />
          <InfoRow label="Type de contenu" value="Cours IA / marketing digital" />
          <InfoRow label="Style" value="Explicatif" />
          <InfoRow label="Rythme estimé" value="Normal" />
          <InfoRow label="Interaction avec la classe" value="Moyen" last={true} />
        </Card>

        {/* Right — calibration card */}
        <Card padding="p-6" className="flex flex-col border border-slate-100/90 shadow-card">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">CALIBRATION VOCALE</p>

          {showCalibrationResult ? (
            <div className="flex flex-col flex-1">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-xs shadow-sm">✓</span>
                  <Badge label="Calibration terminée" variant="success" />
                </div>
                <p className="text-5xl font-extrabold text-primary mb-1.5 tracking-tighter">132</p>
                <p className="text-sm font-semibold text-slate-500 mb-1">mots par minute</p>
                <p className="text-xs font-semibold text-slate-400 mb-6 uppercase tracking-wider">Débit mesuré · profil enregistré</p>
                <div className="rounded-btn bg-primary/5 border border-primary/10 p-4 mb-4 shadow-sm">
                  <p className="text-xs font-bold text-primary mb-1.5 uppercase tracking-wide">Impact sur votre cours</p>
                  <p className="text-sm text-slate-700 leading-relaxed font-medium">
                    Votre débit (132 mots/min) est légèrement en dessous du standard. La durée estimée passe de{' '}
                    <strong>1h58</strong> à <strong className="text-primary">2h04</strong>.
                  </p>
                </div>
              </div>
              <Button variant="primary" fullWidth size="lg" onClick={onDone}>
                Voir l'impact sur mon cours →
              </Button>
            </div>
          ) : (
            <div className="flex flex-col flex-1">
              <div className="flex-1">
                <p className="text-base font-extrabold text-ink mb-2 tracking-tight">Calibrez votre débit de parole</p>
                <p className="text-sm text-slate-500 leading-relaxed mb-6 font-medium">
                  TimeSpeech mesure votre vitesse de lecture pour affiner l'estimation de durée. Parlez naturellement pendant 60 secondes.
                </p>
                <div className="rounded-card bg-gradient-to-br from-primary/5 to-violet-500/5 border border-primary/10 p-6 text-center mb-6 relative overflow-hidden shadow-sm">
                  <div className="absolute inset-0 flex items-center justify-center opacity-30">
                    <span className="w-24 h-24 rounded-full bg-primary/10 animate-ping absolute" />
                  </div>
                  <p className="text-4xl mb-2 relative z-10 animate-bounce">🎤</p>
                  <p className="text-sm font-bold text-slate-700 relative z-10">Prêt à calibrer</p>
                  <p className="text-xs text-slate-400 mt-1.5 relative z-10 font-bold uppercase tracking-widest">Parlez pendant 60 secondes</p>
                </div>
                <p className="text-xs text-slate-400 font-semibold mb-4 uppercase tracking-wider">Résultat estimé : débit standard (130–160 mots/min)</p>
              </div>
              <Button variant="primary" fullWidth size="lg" onClick={onCalibrate}>
                Oui, calibrer ma voix
              </Button>
              <Button variant="ghost" fullWidth onClick={onSkip} className="mt-2 text-center">
                Plus tard
              </Button>
            </div>
          )}
        </Card>
      </div>
    </AppShell>
  )
}

import React from 'react'
import AppShell from '../components/AppShell'
import Card from '../components/Card'
import Button from '../components/Button'
import Badge from '../components/Badge'

interface GenerationProps {
  progress: number
  onComplete: () => void
  isLoggedIn?: boolean
}

const steps = [
  'Analyse du brief',
  'Structuration pédagogique',
  'Découpage du temps',
  'Génération des slides',
  'Vérification du timing',
]

export default function Generation({ progress, onComplete, isLoggedIn }: GenerationProps) {
  return (
    <AppShell activeSidebarItem="ia" stepLabel="Génération en cours" showDemoStatus={true} stepProgress="Étape 4 sur 6" isLoggedIn={isLoggedIn} userInitials="JB" userName="Julien">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-8">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1.5">
            ÉTAPE 4 · GÉNÉRATION
          </p>
          <h1 className="text-2xl font-bold text-ink">Construction du cours…</h1>
          <p className="text-sm text-gray-500 mt-1.5">
            TimeSpeech structure votre cours et calibre chaque section à la durée prévue.
          </p>
        </div>

        <Card padding="p-8" className="border border-slate-100/90 shadow-card">
          <div className="w-full h-1.5 bg-slate-100 rounded-full mb-8 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-violet-500 rounded-full transition-all duration-700 ease-out"
              style={{ width: `${(progress / 5) * 100}%` }}
            />
          </div>

          <div className="space-y-5">
            {steps.map((stepLabel, i) => {
              const done   = progress > i
              const active = progress === i && progress < 5
              return (
                <div key={stepLabel} className="flex items-center gap-4">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold transition-all duration-300 ${
                      done   ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/10'
                      : active ? 'border-2 border-primary bg-white ring-4 ring-primary/8'
                      : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {done ? '✓' : active
                      ? <span className="w-3 h-3 rounded-full border-2 border-primary border-t-transparent animate-spin block" />
                      : <span className="text-[10px] font-mono">{String(i + 1).padStart(2, '0')}</span>
                    }
                  </div>
                  <span className={`text-sm flex-1 transition-colors duration-300 ${done ? 'text-emerald-600 font-semibold' : active ? 'text-ink font-bold tracking-tight' : 'text-slate-400 font-medium'}`}>
                    {stepLabel}
                  </span>
                  {done && <span className="ml-auto"><Badge label="Terminé" variant="success" /></span>}
                </div>
              )
            })}
          </div>

          {progress >= 5 ? (
            <div className="mt-8 pt-6 border-t border-slate-100 text-center">
              <p className="text-sm font-bold text-ink mb-4">✦ Cours prêt</p>
              <Button variant="primary" size="lg" onClick={onComplete}>Voir le résultat →</Button>
            </div>
          ) : (
            <p className="text-center text-xs text-slate-400 font-semibold tracking-wide uppercase mt-6">Veuillez patienter…</p>
          )}
        </Card>
      </div>
    </AppShell>
  )
}

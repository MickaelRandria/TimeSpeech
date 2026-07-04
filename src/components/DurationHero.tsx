import React from 'react'

interface DurationHeroProps {
  isCalibrated: boolean
  isOverBudget?: boolean
  currentDuration?: string
  standardDuration?: string
  calibratedDuration?: string
  targetDuration?: string
  wpm?: number
  onPersonalize?: () => void
  className?: string
}

function HeroBadge({ children, variant = 'default' }: { children: React.ReactNode; variant?: 'default' | 'warning' | 'success' }) {
  const cls = {
    default: 'bg-white/10 text-white border-white/15',
    warning: 'bg-white/15 text-white border-white/20',
    success: 'bg-emerald-400/20 text-white border-emerald-300/30',
  }[variant]
  return (
    <span className={`inline-flex items-center rounded-pill px-3 py-1 text-[11px] font-semibold border backdrop-blur-sm shadow-sm ${cls}`}>
      {children}
    </span>
  )
}

export default function DurationHero({
  isCalibrated = false,
  isOverBudget = false,
  currentDuration,
  standardDuration = '1h58',
  calibratedDuration = '2h04',
  targetDuration = '2h00',
  wpm = 132,
  onPersonalize,
  className = '',
}: DurationHeroProps) {
  const displayDuration = isCalibrated
    ? calibratedDuration
    : (currentDuration ?? standardDuration)

  const gradient = isOverBudget && !isCalibrated
    ? 'linear-gradient(135deg, #b45309 0%, #d97706 50%, #f59e0b 100%)'
    : 'linear-gradient(135deg, #2563eb 0%, #4f46e5 50%, #7c3aed 100%)'

  return (
    <div
      className={`rounded-card p-8 transition-all duration-700 shadow-md ${className}`}
      style={{ background: gradient }}
    >
      {/* Row 1 — eyebrow + badges */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
        <p className="text-[10px] font-bold uppercase tracking-widest text-white/60">
          {isCalibrated ? 'Durée recalibrée' : isOverBudget ? 'Dépassement détecté' : 'Durée optimisée'}
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          {isCalibrated ? (
            <HeroBadge variant="success">✓ Profil vocal appliqué</HeroBadge>
          ) : isOverBudget ? (
            <>
              <HeroBadge variant="warning">⚠ +12 min</HeroBadge>
              <HeroBadge variant="warning">2 sections à ajuster</HeroBadge>
            </>
          ) : (
            <>
              <HeroBadge>✓ Timing maîtrisé</HeroBadge>
              <HeroBadge>Estimation standard</HeroBadge>
            </>
          )}
        </div>
      </div>

      {/* Row 2 — large number */}
      <p
        className="text-7xl font-extrabold leading-none text-white tracking-tighter animate-duration-change"
        key={displayDuration}
      >
        {displayDuration}
      </p>

      {/* Row 3 — objective */}
      <p className="text-xs font-semibold text-white/70 mt-3 flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
        Objectif : {targetDuration}
      </p>

      {/* Row 4 — context message */}
      <p className="text-xs text-white/60 mt-3 max-w-sm leading-relaxed font-medium">
        {isCalibrated
          ? 'Estimation personnalisée selon votre débit de parole.'
          : isOverBudget
          ? 'Le cours dépasse de 12 minutes l\'objectif fixé. Acceptez les suggestions pour calibrer la durée.'
          : 'Estimation basée sur un débit standard, sera affinée après calibration.'}
      </p>

      {/* Separator */}
      <div className="border-t border-white/10 my-6" />

      {/* Row 5 — CTA or calibration info */}
      {isCalibrated ? (
        <div className="bg-white/5 border border-white/10 rounded-btn p-3.5 backdrop-blur-sm">
          <p className="text-white/90 text-xs font-semibold flex items-center gap-1.5">
            <span className="text-emerald-300">✓</span> Cours recalibré selon votre débit · {wpm} mots/min
          </p>
          <p className="text-white/60 text-[11px] mt-1 font-medium leading-relaxed pl-4">
            Réduisez la partie &quot;IA et création de contenu&quot; de 4 minutes pour revenir exactement à 2h00.
          </p>
        </div>
      ) : isOverBudget ? (
        <div className="bg-white/10 border border-white/15 rounded-btn p-3.5">
          <p className="text-white/80 text-xs font-semibold">
            Acceptez les suggestions ci-dessous pour ramener la durée à l&apos;objectif.
          </p>
        </div>
      ) : (
        <div className="flex items-center justify-between flex-wrap gap-3">
          <p className="text-white/80 text-xs font-medium">
            Affinez l&apos;estimation avec votre profil vocal.
          </p>
          {onPersonalize && (
            <button
              onClick={onPersonalize}
              className="bg-white text-primary rounded-btn px-4 py-2.5 text-xs font-bold hover:bg-slate-50 hover:-translate-y-[1px] hover:shadow-md active:translate-y-0 active:scale-[0.98] transition-all duration-300 ease-out ml-auto flex-shrink-0"
            >
              Personnaliser mon profil
            </button>
          )}
        </div>
      )}
    </div>
  )
}

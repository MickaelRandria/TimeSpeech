import React from 'react'
import { motion, AnimatePresence, type Variants } from 'framer-motion'
import Badge from './Badge'
import Button from './Button'

// ── Props ──────────────────────────────────────────────────────────────────────

export interface CourseDetailsDrawerProps {
  isOpen: boolean
  onClose: () => void
  // ── Contexte
  sessionDate: string
  statutLabel: string
  slideCount: number
  // ── Personalize CTA (shown after at least 1 suggestion accepted, pre-calibration)
  showPersonalizeCTA: boolean
  onPersonalize: () => void
  // ── Post-calibration summary
  showCalibrationCard: boolean
  wpm: number
  finalCutAccepted: boolean
  // ── Exercise
  exercise: string
  // ── Secondary actions
  onExport: () => void
  onViewPlanning?: () => void
  onBack: () => void
}

// ── Icons ──────────────────────────────────────────────────────────────────────

function CloseIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
      <path d="M3 3l10 10M13 3L3 13"/>
    </svg>
  )
}

// ── Animation variants ─────────────────────────────────────────────────────────

const listVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
}

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  show:   { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 24 } },
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function CourseDetailsDrawer({
  isOpen,
  onClose,
  sessionDate,
  statutLabel,
  slideCount,
  showPersonalizeCTA,
  onPersonalize,
  showCalibrationCard,
  wpm,
  finalCutAccepted,
  exercise,
  onExport,
  onViewPlanning,
  onBack,
}: CourseDetailsDrawerProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* ── Glassmorphism backdrop ── */}
          <motion.div
            key="drawer-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-slate-900/10 backdrop-blur-sm"
          />

          {/* ── Slide-over panel ── */}
          <motion.div
            key="drawer-panel"
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0,      opacity: 1 }}
            exit={{   x: '100%',  opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 32 }}
            className="fixed top-0 right-0 z-[51] h-full w-full max-w-[420px] bg-white shadow-2xl border-l border-slate-100/80 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-7 py-6 border-b border-slate-100/70 flex-shrink-0">
              <p className="text-sm font-black uppercase tracking-widest text-slate-400">Détails du cours</p>
              <button
                onClick={onClose}
                aria-label="Fermer"
                className="w-8 h-8 flex items-center justify-center rounded-full text-slate-300 hover:text-slate-500 hover:bg-slate-100/70 transition-all duration-150"
              >
                <CloseIcon />
              </button>
            </div>

            {/* Content */}
            <motion.div
              variants={listVariants}
              initial="hidden"
              animate="show"
              className="flex-1 overflow-y-auto px-7 py-6 flex flex-col gap-6"
            >

              {/* ── Context card ── */}
              <motion.div
                variants={cardVariants}
                className="bg-white rounded-3xl border border-slate-100/60 shadow-[0_4px_30px_rgba(15,23,42,0.04)] overflow-hidden"
              >
                <div className="px-7 pt-6 pb-4 border-b border-slate-100/60 flex items-center justify-between">
                  <span className="text-sm font-black uppercase tracking-widest text-slate-400">Contexte</span>
                  <Badge label="Démo gratuite" variant="success" />
                </div>
                <div className="px-7 py-1">
                  {[
                    { label: 'École',  value: 'ESD Bordeaux' },
                    { label: 'Séance', value: sessionDate     },
                    { label: 'Statut', value: statutLabel     },
                    { label: 'Slides', value: `${slideCount} slides` },
                  ].map(({ label, value }, i, arr) => (
                    <div key={label} className={`flex items-center justify-between py-3.5 ${i < arr.length - 1 ? 'border-b border-slate-50' : ''}`}>
                      <span className="text-sm font-semibold text-slate-400">{label}</span>
                      <span className="text-sm font-bold text-slate-700 text-right max-w-[60%] leading-tight">{value}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* ── Personalize CTA (after at least 1 suggestion accepted) ── */}
              <AnimatePresence>
                {showPersonalizeCTA && (
                  <motion.div
                    key="personalize-cta"
                    variants={cardVariants}
                    initial="hidden"
                    animate="show"
                    exit={{ opacity: 0, y: -8 }}
                    className="bg-gradient-to-br from-primary/5 via-violet-50/60 to-white rounded-3xl border border-primary/15 shadow-[0_4px_20px_rgba(90,87,255,0.06)] p-7"
                  >
                    <p className="text-sm font-black uppercase tracking-widest text-primary/60 mb-3">Prochaine étape</p>
                    <p className="text-base font-extrabold text-slate-800 mb-2 tracking-tight">Calibrez votre débit vocal</p>
                    <p className="text-sm text-slate-400 font-semibold leading-relaxed mb-4">
                      Obtenez une estimation personnalisée basée sur votre vitesse de parole réelle.
                    </p>
                    <Button variant="primary" fullWidth onClick={onPersonalize} className="shadow-glow">
                      Calibrer mon profil →
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── Post-calibration card ── */}
              {showCalibrationCard && (
                <motion.div
                  variants={cardVariants}
                  className="bg-white rounded-3xl border border-primary/12 shadow-[0_4px_20px_rgba(90,87,255,0.05)] p-7"
                >
                  <p className="text-sm font-black uppercase tracking-widest text-primary/50 mb-3">Profil vocal</p>
                  <p className="text-base font-extrabold text-slate-800 flex items-center gap-1.5 mb-2 tracking-tight">
                    <span className="text-emerald-500">✓</span> Cours recalibré
                  </p>
                  <p className="text-sm text-slate-400 font-semibold leading-relaxed">
                    Débit détecté : {wpm} mots/min.{' '}
                    {finalCutAccepted
                      ? 'Durée parfaitement alignée sur votre rythme.'
                      : 'Ouvrez la slide 3 pour appliquer la suggestion finale (+4 min).'}
                  </p>
                  {finalCutAccepted && (
                    <motion.div
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="mt-4 flex items-center gap-2.5 p-4 rounded-2xl bg-emerald-50 border border-emerald-100"
                    >
                      <span className="text-emerald-500 font-black">✓</span>
                      <p className="text-sm font-bold text-emerald-700">Cours calibré sur votre profil — exactement 2h00 !</p>
                    </motion.div>
                  )}
                </motion.div>
              )}

              {/* ── Exercise card ── */}
              <motion.div
                variants={cardVariants}
                className="bg-white rounded-3xl border border-slate-100/60 shadow-[0_4px_30px_rgba(15,23,42,0.04)] p-7"
              >
                <p className="text-sm font-black uppercase tracking-widest text-slate-400 mb-3">Exercice principal</p>
                <p className="text-base font-bold text-slate-800 mb-3 tracking-tight leading-snug">{exercise}</p>
                <Badge label="Cas pratique intégré" variant="primary" />
              </motion.div>

              {/* ── Secondary actions ── */}
              <motion.div variants={cardVariants} className="flex flex-col items-center gap-2 pt-1 pb-2">
                <button onClick={onExport} className="text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors">Exporter</button>
                {onViewPlanning && (
                  <button onClick={onViewPlanning} className="text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors">Voir dans le planning</button>
                )}
                <button onClick={onBack} className="text-sm font-bold text-slate-400 hover:text-slate-500 transition-colors mt-1">← Retour</button>
              </motion.div>

            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

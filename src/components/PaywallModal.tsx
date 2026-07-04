import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ── Props ──────────────────────────────────────────────────────────────────────

export interface PaywallModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectStandard?: () => void
  onSelectPro?: () => void
}

// ── Static data ────────────────────────────────────────────────────────────────

const FREE_FEATURES = [
  'Storyboard & notes de cours',
  'Calibration basique du débit',
  '2 générations IA / mois',
]

const STANDARD_FEATURES = [
  '20 générations IA / mois',
  'Calibration régulière du profil',
  'Analyse post-présentation',
  'Planification centralisée',
]

const PRO_FEATURES = [
  'Génération IA illimitée',
  'Assistant temps réel & Téléprompteur',
  'Apprentissage continu IA',
  'Support prioritaire 24/7',
  'Exports multi-formats (PDF, PPTX…)',
]

// ── Icons ──────────────────────────────────────────────────────────────────────

function CheckFree() {
  return (
    <div className="w-[18px] h-[18px] rounded-full bg-slate-100 flex-shrink-0 mt-[3px] flex items-center justify-center">
      <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
        <path d="M2 5l2.2 2.2 3.8-4" stroke="#94a3b8" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  )
}

function CheckStandard() {
  return (
    <div className="w-[18px] h-[18px] rounded-full bg-primary/10 flex-shrink-0 mt-[3px] flex items-center justify-center">
      <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
        <path d="M2 5l2.2 2.2 3.8-4" stroke="#5A57FF" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  )
}

function CheckPro() {
  return (
    <div className="w-[18px] h-[18px] rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex-shrink-0 mt-[3px] flex items-center justify-center shadow-[0_2px_8px_rgba(99,102,241,0.3)]">
      <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
        <path d="M2 5l2.2 2.2 3.8-4" stroke="white" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  )
}

function CloseIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
      <path d="M3 3l10 10M13 3L3 13"/>
    </svg>
  )
}

function SparkIcon({ size = 11 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" aria-hidden>
      <path d="M8 1l1.5 4.5L14 7l-4.5 1.5L8 13l-1.5-4.5L2 7l4.5-1.5L8 1z"/>
    </svg>
  )
}

function CrownIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
      <defs>
        <linearGradient id="crown-g" x1="3" y1="5" x2="21" y2="21" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6366f1"/>
          <stop offset="1" stopColor="#a855f7"/>
        </linearGradient>
      </defs>
      <path d="M3 17L5.5 9L9 13L12 5L15 13L18.5 9L21 17H3Z"
        fill="url(#crown-g)" opacity="0.14"
        stroke="url(#crown-g)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M3 20.5H21" stroke="url(#crown-g)" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  )
}

// ── Animation variants ─────────────────────────────────────────────────────────

const cardIn = (delay: number) => ({
  initial: { opacity: 0, y: 22, scale: 0.97 },
  animate: {
    opacity: 1, y: 0, scale: 1,
    transition: { type: 'spring' as const, stiffness: 260, damping: 24, delay },
  },
})

// ── Component ──────────────────────────────────────────────────────────────────

export default function PaywallModal({
  isOpen,
  onClose,
  onSelectStandard,
  onSelectPro,
}: PaywallModalProps) {
  function handleStandard() {
    onClose()
    setTimeout(() => onSelectStandard?.(), 180)
  }

  function handlePro() {
    onClose()
    setTimeout(() => onSelectPro?.(), 180)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* ── Glassmorphism overlay ── */}
          <motion.div
            key="pw-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-slate-900/20 backdrop-blur-md"
          />

          {/* ── Modal container (pointer-events-none so overlay click-through works) ── */}
          <div className="fixed inset-0 z-[51] flex items-center justify-center p-6 pointer-events-none">
            <motion.div
              key="pw-card"
              initial={{ opacity: 0, scale: 0.95, y: 24 }}
              animate={{ opacity: 1, scale: 1,    y: 0  }}
              exit={{   opacity: 0, scale: 0.95,  y: 16 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-[900px] bg-white/90 backdrop-blur-xl rounded-[2rem] shadow-2xl shadow-slate-900/10 border border-white/60 pointer-events-auto overflow-hidden"
            >

              {/* Ambient blobs */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
                <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-indigo-100/25 blur-3xl"/>
                <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-violet-100/20 blur-3xl"/>
              </div>

              {/* Close button */}
              <button
                onClick={onClose}
                aria-label="Fermer"
                className="absolute top-5 right-5 z-10 w-8 h-8 flex items-center justify-center rounded-full text-slate-300 hover:text-slate-500 hover:bg-slate-100/70 transition-all duration-150"
              >
                <CloseIcon />
              </button>

              <div className="relative z-10 px-9 pt-10 pb-8">

                {/* ── Header ── */}
                <div className="text-center mb-10">
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 360, damping: 22, delay: 0.08 }}
                    className="w-14 h-14 mx-auto mb-5 rounded-[18px] bg-gradient-to-br from-indigo-50 to-violet-100 border border-indigo-100 flex items-center justify-center shadow-[0_4px_20px_rgba(99,102,241,0.13)]"
                  >
                    <CrownIcon />
                  </motion.div>

                  <motion.h2
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.16 }}
                    className="text-[1.6rem] font-black text-slate-900 tracking-tight leading-tight mb-2.5"
                  >
                    Passez à la vitesse supérieure
                  </motion.h2>

                  <motion.p
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.22 }}
                    className="text-sm font-semibold text-slate-400 leading-relaxed"
                  >
                    Vous avez utilisé vos 2 analyses IA gratuites.{' '}
                    Choisissez le plan qui correspond à votre ambition.
                  </motion.p>
                </div>

                {/* ── Pricing grid — extra top padding for the "Recommandé" badge ── */}
                <div className="flex gap-5 items-stretch pt-6">

                  {/* ─── FREE ──────────────────────────────────────── */}
                  <motion.div
                    {...cardIn(0.28)}
                    className="flex-1 rounded-[1.5rem] border border-slate-100 bg-slate-50/70 p-6 flex flex-col opacity-70"
                  >
                    <div className="mb-6">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1.5">Gratuit</p>
                      <p className="text-[11px] font-semibold text-slate-300 mb-5">Votre plan actuel</p>
                      <div className="flex items-end gap-1.5 leading-none">
                        <span className="text-[2.4rem] font-black text-slate-500 tracking-tight leading-none">0</span>
                        <span className="text-xl font-black text-slate-400 mb-0.5">€</span>
                        <span className="text-sm font-semibold text-slate-300 mb-1.5">/ mois</span>
                      </div>
                    </div>

                    <ul className="flex flex-col gap-3 flex-1">
                      {FREE_FEATURES.map((f) => (
                        <li key={f} className="flex items-start gap-2.5">
                          <CheckFree />
                          <span className="text-[13px] font-semibold text-slate-400 leading-snug">{f}</span>
                        </li>
                      ))}
                    </ul>

                    <button
                      disabled
                      className="mt-7 w-full py-3 rounded-xl border border-slate-200 text-[13px] font-black text-slate-300 cursor-not-allowed bg-white/50 select-none"
                    >
                      Votre offre actuelle
                    </button>
                  </motion.div>

                  {/* ─── STANDARD ──────────────────────────────────── */}
                  <motion.div
                    {...cardIn(0.36)}
                    className="flex-1 rounded-[1.5rem] border border-slate-100/80 bg-white p-6 flex flex-col shadow-[0_4px_28px_rgba(15,23,42,0.06)]"
                  >
                    <div className="mb-6">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-1.5">Standard</p>
                      <p className="text-[11px] font-semibold text-slate-400 mb-5">Pour les formateurs réguliers</p>
                      <div className="flex items-end gap-1.5 leading-none">
                        <span className="text-[2.4rem] font-black text-slate-900 tracking-tight leading-none">15</span>
                        <span className="text-xl font-black text-slate-500 mb-0.5">€</span>
                        <span className="text-sm font-semibold text-slate-400 mb-1.5">/ mois</span>
                      </div>
                    </div>

                    <ul className="flex flex-col gap-3 flex-1">
                      {STANDARD_FEATURES.map((f) => (
                        <li key={f} className="flex items-start gap-2.5">
                          <CheckStandard />
                          <span className="text-[13px] font-semibold text-slate-600 leading-snug">{f}</span>
                        </li>
                      ))}
                    </ul>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={handleStandard}
                      className="mt-7 w-full py-3 rounded-xl bg-primary text-white text-[13px] font-black shadow-[0_3px_16px_rgba(90,87,255,0.28)] hover:-translate-y-[1.5px] hover:shadow-[0_6px_24px_rgba(90,87,255,0.36)] transition-all duration-200"
                    >
                      Passer en Standard
                    </motion.button>
                  </motion.div>

                  {/* ─── PRO PREMIUM ────────────────────────────────── */}
                  <motion.div
                    {...cardIn(0.44)}
                    className="flex-1 relative"
                  >
                    {/* Floating "Recommandé" badge */}
                    <div className="absolute -top-[22px] left-1/2 -translate-x-1/2 z-10 pointer-events-none">
                      <div className="flex items-center gap-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-[10px] font-black uppercase tracking-[0.14em] px-4 py-[7px] rounded-full shadow-[0_4px_20px_rgba(99,102,241,0.46)] whitespace-nowrap">
                        <SparkIcon size={9} />
                        Recommandé
                      </div>
                    </div>

                    {/* Gradient border + pulsing glow wrapper */}
                    <motion.div
                      className="h-full rounded-[1.625rem] p-[1.5px] bg-gradient-to-br from-indigo-400 via-violet-400 to-purple-500"
                      animate={{
                        boxShadow: [
                          '0 12px 40px rgba(99,102,241,0.18)',
                          '0 12px 56px rgba(99,102,241,0.32)',
                          '0 12px 40px rgba(99,102,241,0.18)',
                        ],
                      }}
                      transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                    >
                      <div className="bg-white h-full rounded-[1.5rem] p-6 flex flex-col">

                        <div className="mb-6">
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 mb-1.5">Pro Premium</p>
                          <p className="text-[11px] font-semibold text-slate-400 mb-5">Pour les experts IA</p>
                          <div className="flex items-end gap-1.5 leading-none">
                            <span className="text-[2.4rem] font-black tracking-tight leading-none bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                              59
                            </span>
                            <span className="text-xl font-black text-indigo-500 mb-0.5">€</span>
                            <span className="text-sm font-semibold text-slate-400 mb-1.5">/ mois</span>
                          </div>
                        </div>

                        <ul className="flex flex-col gap-3 flex-1">
                          {PRO_FEATURES.map((f) => (
                            <li key={f} className="flex items-start gap-2.5">
                              <CheckPro />
                              <span className="text-[13px] font-semibold text-slate-700 leading-snug">{f}</span>
                            </li>
                          ))}
                        </ul>

                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={handlePro}
                          className="mt-7 w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-[13px] font-black shadow-[0_4px_24px_rgba(99,102,241,0.42)] hover:shadow-[0_8px_36px_rgba(99,102,241,0.54)] transition-shadow duration-200 flex items-center justify-center gap-2"
                        >
                          <SparkIcon />
                          Débloquer le Pro Premium
                        </motion.button>
                      </div>
                    </motion.div>
                  </motion.div>

                </div>

                {/* ── Ghost dismiss link ── */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.56 }}
                  className="mt-8 text-center"
                >
                  <button
                    onClick={onClose}
                    className="text-[12px] font-semibold text-slate-400 hover:text-slate-600 underline underline-offset-[3px] decoration-slate-200 hover:decoration-slate-400 transition-all duration-150"
                  >
                    Non merci, je continue avec l'éditeur manuel
                  </button>
                </motion.div>

              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ── Props ──────────────────────────────────────────────────────────────────────

export interface PaywallModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectStandard?: () => void
  onSelectPro?: () => void
  freeLimit?: number
}

// ── Static data ────────────────────────────────────────────────────────────────

type Tier = 'free' | 'standard' | 'pro'

type CellValue =
  | { kind: 'check' }
  | { kind: 'dash' }
  | { kind: 'text'; value: string }

interface FeatureRow {
  label: string
  free: CellValue
  standard: CellValue
  pro: CellValue
}

interface PlanMeta {
  tier: Tier
  name: string
  blurb: string
  price: number
  cta: string
}

const PLANS: PlanMeta[] = [
  { tier: 'free',     name: 'Gratuit',     blurb: 'Votre plan actuel',    price: 0,  cta: 'Plan actuel' },
  { tier: 'standard', name: 'Standard',    blurb: 'Formateurs réguliers', price: 15, cta: 'Choisir Standard' },
  { tier: 'pro',      name: 'Pro Premium', blurb: 'Experts IA',           price: 59, cta: 'Débloquer Pro' },
]

const FEATURE_ROWS: FeatureRow[] = [
  {
    label:    'Storyboard & Notes',
    free:     { kind: 'check' },
    standard: { kind: 'check' },
    pro:      { kind: 'check' },
  },
  {
    label:    'Générations IA',
    free:     { kind: 'text', value: '2 / mois' },
    standard: { kind: 'text', value: '20 / mois' },
    pro:      { kind: 'text', value: 'Illimité' },
  },
  {
    label:    'Calibration Vocale',
    free:     { kind: 'text', value: 'Basique' },
    standard: { kind: 'text', value: 'Régulière' },
    pro:      { kind: 'text', value: 'Continue' },
  },
  {
    label:    'Téléprompteur Live',
    free:     { kind: 'dash' },
    standard: { kind: 'dash' },
    pro:      { kind: 'check' },
  },
]

// ── Icons ──────────────────────────────────────────────────────────────────────

function TierCheck({ tier }: { tier: Tier }) {
  if (tier === 'pro') {
    return (
      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-[0_2px_10px_rgba(99,102,241,0.35)]">
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M2 5l2.2 2.2 3.8-4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    )
  }
  if (tier === 'standard') {
    return (
      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M2 5l2.2 2.2 3.8-4" stroke="#5A57FF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    )
  }
  return (
    <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center">
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
        <path d="M2 5l2.2 2.2 3.8-4" stroke="#94a3b8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  )
}

function DashIcon() {
  return <span className="block w-3 h-[2px] rounded-full bg-slate-200" aria-hidden />
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

function RecommendedTag() {
  return (
    <span className="inline-flex items-center gap-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow-[0_2px_10px_rgba(99,102,241,0.4)] whitespace-nowrap">
      <SparkIcon size={8} />
      Recommandé
    </span>
  )
}

// ── Style helpers ──────────────────────────────────────────────────────────────

const PLAN_LABEL_CLASS: Record<Tier, string> = {
  free:     'text-[10px] font-black uppercase tracking-[0.14em] text-slate-400',
  standard: 'text-[10px] font-black uppercase tracking-[0.14em] text-primary',
  pro:      'text-[10px] font-black uppercase tracking-[0.14em] text-indigo-600',
}

const PLAN_PRICE_CLASS: Record<Tier, string> = {
  free:     'text-[2rem] font-black tracking-tight text-slate-500',
  standard: 'text-[2rem] font-black tracking-tight text-slate-900',
  pro:      'text-[2rem] font-black tracking-tight bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent',
}

const CELL_TEXT_CLASS: Record<Tier, string> = {
  free:     'text-[13px] font-bold text-slate-400',
  standard: 'text-[13px] font-black text-slate-700',
  pro:      'text-[13px] font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent',
}

// ── Animation variants ─────────────────────────────────────────────────────────

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 14 },
  animate: {
    opacity: 1, y: 0,
    transition: { type: 'spring' as const, stiffness: 280, damping: 26, delay },
  },
})

// ── Component ──────────────────────────────────────────────────────────────────

export default function PaywallModal({
  isOpen,
  onClose,
  onSelectStandard,
  onSelectPro,
  freeLimit = 2,
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
              className="relative w-full max-w-[1040px] bg-white/90 backdrop-blur-xl rounded-[2rem] shadow-2xl shadow-slate-900/10 border border-white/60 pointer-events-auto overflow-hidden"
            >

              {/* Ambient blobs */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
                <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-indigo-100/25 blur-3xl"/>
                <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-violet-100/20 blur-3xl"/>
              </div>

              {/* Close button — fixed over the scrollable content below */}
              <button
                onClick={onClose}
                aria-label="Fermer"
                className="absolute top-5 right-5 z-20 w-8 h-8 flex items-center justify-center rounded-full text-slate-300 hover:text-slate-500 hover:bg-slate-100/70 transition-all duration-150"
              >
                <CloseIcon />
              </button>

              <div className="relative z-10 px-9 pt-10 pb-8 max-h-[88vh] overflow-y-auto">

                {/* ── Header ── */}
                <div className="text-center mb-9">
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
                    {freeLimit === 1
                      ? 'Vous avez utilisé votre analyse IA gratuite.'
                      : `Vous avez utilisé vos ${freeLimit} analyses IA gratuites.`}{' '}
                    Choisissez le plan qui correspond à votre ambition.
                  </motion.p>
                </div>

                {/* ── Comparison matrix ── */}
                <motion.div
                  {...fadeUp(0.26)}
                  className="relative grid grid-cols-[2fr_1fr_1fr_1fr] rounded-[1.75rem] border border-slate-100/80"
                >
                  {/* Pro column highlight wash — spans the full height of the matrix */}
                  <div
                    aria-hidden
                    className="absolute inset-y-0 right-0 w-1/5 bg-gradient-to-b from-indigo-50/70 via-indigo-50/40 to-violet-50/30"
                  />

                  {/* ── Plan header row ── */}
                  <div className="relative" />
                  {PLANS.map((plan) => (
                    <div key={plan.tier} className="relative flex flex-col items-center text-center px-4 pt-6 pb-5">
                      <div className="h-5 flex items-center justify-center mb-1.5">
                        {plan.tier === 'pro' && <RecommendedTag />}
                      </div>
                      <p className={PLAN_LABEL_CLASS[plan.tier]}>{plan.name}</p>
                      <p className="text-[10px] font-semibold text-slate-400 mt-1">{plan.blurb}</p>
                      <div className="flex items-end gap-1 leading-none mt-3">
                        <span className={PLAN_PRICE_CLASS[plan.tier]}>{plan.price}€</span>
                      </div>
                      <p className="text-[10px] font-semibold text-slate-300 mt-0.5">/ mois</p>
                    </div>
                  ))}

                  {/* ── Feature rows ── */}
                  {FEATURE_ROWS.map((row, i) => {
                    const shaded = i % 2 === 1
                    const firstRow = i === 0
                    return (
                      <React.Fragment key={row.label}>
                        <div
                          className={`relative flex items-center px-6 py-5 text-[13px] font-bold text-slate-600 ${shaded ? 'bg-slate-50/50' : ''} ${firstRow ? 'border-t border-slate-100/70' : ''}`}
                        >
                          {row.label}
                        </div>
                        {(['free', 'standard', 'pro'] as Tier[]).map((tier) => {
                          const cell = row[tier]
                          return (
                            <div
                              key={tier}
                              className={`relative flex items-center justify-center px-4 py-5 ${shaded && tier !== 'pro' ? 'bg-slate-50/50' : ''} ${firstRow ? 'border-t border-slate-100/70' : ''}`}
                            >
                              {cell.kind === 'check' && <TierCheck tier={tier} />}
                              {cell.kind === 'dash' && <DashIcon />}
                              {cell.kind === 'text' && (
                                <span className={CELL_TEXT_CLASS[tier]}>{cell.value}</span>
                              )}
                            </div>
                          )
                        })}
                      </React.Fragment>
                    )
                  })}

                  {/* ── CTA row ── */}
                  <div className="relative border-t border-slate-100/70" />
                  {PLANS.map((plan) => (
                    <div key={plan.tier} className="relative flex items-center justify-center px-4 pt-6 pb-6 border-t border-slate-100/70">
                      {plan.tier === 'free' && (
                        <button
                          disabled
                          className="w-full py-3 px-3 rounded-xl border border-slate-200 text-[12px] font-black leading-tight text-slate-300 cursor-not-allowed bg-white/50 select-none"
                        >
                          {plan.cta}
                        </button>
                      )}
                      {plan.tier === 'standard' && (
                        <motion.button
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={handleStandard}
                          className="w-full py-3 px-3 rounded-xl bg-primary text-white text-[12px] font-black leading-tight shadow-[0_3px_16px_rgba(90,87,255,0.28)] hover:-translate-y-[1.5px] hover:shadow-[0_6px_24px_rgba(90,87,255,0.36)] transition-all duration-200"
                        >
                          {plan.cta}
                        </motion.button>
                      )}
                      {plan.tier === 'pro' && (
                        <motion.button
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={handlePro}
                          animate={{
                            boxShadow: [
                              '0 4px 22px rgba(99,102,241,0.32)',
                              '0 8px 34px rgba(99,102,241,0.50)',
                              '0 4px 22px rgba(99,102,241,0.32)',
                            ],
                          }}
                          transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
                          className="w-full flex items-center justify-center gap-1.5 py-3 px-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-[12px] font-black leading-tight"
                        >
                          <SparkIcon size={10} />
                          {plan.cta}
                        </motion.button>
                      )}
                    </div>
                  ))}
                </motion.div>

                {/* ── Ghost dismiss link ── */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.56 }}
                  className="mt-7 text-center"
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

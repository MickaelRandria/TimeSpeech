import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface SuggestionCardProps {
  title: string
  originalText: string
  cutText: string
  addedText?: string
  gainLabel: string
  accepted: boolean
  onAccept: () => void
}

function ChevronIcon({ rotated }: { rotated: boolean }) {
  return (
    <motion.svg
      animate={{ rotate: rotated ? 180 : 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 24 }}
      viewBox="0 0 12 8" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round"
      className="w-3 h-3 flex-shrink-0"
    >
      <path d="M1 1l5 5 5-5" />
    </motion.svg>
  )
}

export default function SuggestionCard({
  title,
  originalText,
  cutText,
  addedText,
  gainLabel,
  accepted,
  onAccept,
}: SuggestionCardProps) {
  const [expanded,     setExpanded]     = useState(false)
  const [innerAccepted, setInnerAccepted] = useState(accepted)

  useEffect(() => {
    if (accepted && !innerAccepted) setInnerAccepted(true)
  }, [accepted, innerAccepted])

  function handleApprove() {
    setExpanded(false)
    setTimeout(() => {
      setInnerAccepted(true)
      onAccept()
    }, 280)
  }

  function handleReject() {
    setExpanded(false)
  }

  const parts  = originalText.split(cutText)
  const prefix = parts[0] ?? ''
  const suffix = parts[1] ?? ''

  return (
    <motion.div
      layout
      transition={{ type: 'spring', stiffness: 120, damping: 20 }}
      className={[
        'rounded-3xl border overflow-hidden',
        'shadow-[0_4px_20px_rgba(15,23,42,0.04)]',
        innerAccepted
          ? 'bg-emerald-50/40 border-emerald-200/70'
          : expanded
          ? 'bg-white border-primary/25 shadow-[0_4px_24px_rgba(90,87,255,0.09)]'
          : 'bg-white border-slate-100/70',
      ].join(' ')}
    >

      {/* ── HEADER ── always visible ── */}
      <motion.div layout="position" className="flex items-center justify-between px-5 pt-5 pb-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <AnimatePresence>
            {innerAccepted && (
              <motion.span
                key="check"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                className="text-emerald-500 font-black text-sm flex-shrink-0"
              >✓</motion.span>
            )}
          </AnimatePresence>
          <p className={`text-[10px] font-black uppercase tracking-[0.13em] truncate transition-colors duration-300 ${
            innerAccepted ? 'text-emerald-700' : 'text-slate-500'
          }`}>{title}</p>
        </div>

        <motion.span
          layout="position"
          className={`flex-shrink-0 ml-2 inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider transition-all duration-300 ${
            innerAccepted
              ? 'bg-emerald-100 text-emerald-800'
              : 'bg-amber-50 text-amber-700 border border-amber-200/70'
          }`}
        >
          {innerAccepted ? `✓ ${gainLabel}` : gainLabel}
        </motion.span>
      </motion.div>

      {/* ── SUMMARY LINE ── always visible ── */}
      <motion.div layout="position" className="px-5 pb-3.5">
        <AnimatePresence mode="wait">
          {innerAccepted ? (
            <motion.p
              key="done"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[11px] text-emerald-600 font-bold leading-relaxed"
            >
              Durée optimisée de {gainLabel.replace('-', '')} · Modification appliquée.
            </motion.p>
          ) : (
            <motion.p
              key="hint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-[11px] text-slate-400 font-semibold leading-relaxed"
            >
              Suppression proposée de {gainLabel.replace('-', '')} sur cette section.
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── TOGGLE BUTTON ── visible when not yet accepted ── */}
      {!innerAccepted && (
        <motion.div layout="position" className="px-5 pb-4">
          <button
            onClick={() => setExpanded(v => !v)}
            className={[
              'group w-full flex items-center justify-between',
              'px-4 py-2.5 rounded-xl border',
              'text-[10px] font-black uppercase tracking-[0.12em]',
              'transition-all duration-200',
              expanded
                ? 'bg-primary/5 border-primary/25 text-primary'
                : 'bg-slate-50/70 border-slate-100 text-slate-400 hover:bg-primary/5 hover:border-primary/20 hover:text-primary',
            ].join(' ')}
          >
            <span>{expanded ? 'Masquer les modifications' : 'Examiner les modifications'}</span>
            <ChevronIcon rotated={expanded} />
          </button>
        </motion.div>
      )}

      {/* ── DIFF VIEW ── expands into the card via spring ── */}
      <AnimatePresence initial={false}>
        {expanded && !innerAccepted && (
          <motion.div
            key="diff-body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              height: { type: 'spring', stiffness: 140, damping: 20 },
              opacity: { duration: 0.18, ease: 'easeOut' },
            }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 flex flex-col gap-3">

              {/* Divider */}
              <div className="h-px bg-gradient-to-r from-transparent via-slate-100 to-transparent" />

              {/* AVANT block */}
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 flex-shrink-0" />
                  <span className="text-[9px] font-black uppercase tracking-[0.15em] text-rose-500">Avant</span>
                </div>
                <div className={[
                  'rounded-2xl px-4 py-3.5 border',
                  'bg-rose-50/50 border-rose-100/80',
                  'text-[11.5px] leading-[1.8] font-medium text-slate-600',
                ].join(' ')}>
                  {prefix}
                  <span className={[
                    'inline bg-rose-100 text-rose-600',
                    'line-through decoration-rose-400 decoration-1',
                    'rounded-md px-1.5 py-0.5 mx-[2px]',
                    'font-bold',
                  ].join(' ')}>
                    {cutText.trim()}
                  </span>
                  {suffix}
                </div>
              </div>

              {/* Arrow connector */}
              <div className="flex justify-center items-center gap-2">
                <div className="flex-1 h-px bg-slate-100" />
                <span className="text-slate-300 text-sm leading-none">↓</span>
                <div className="flex-1 h-px bg-slate-100" />
              </div>

              {/* APRÈS block */}
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                  <span className="text-[9px] font-black uppercase tracking-[0.15em] text-emerald-600">Après</span>
                </div>
                <div className={[
                  'rounded-2xl px-4 py-3.5 border',
                  'bg-emerald-50/50 border-emerald-100/80',
                  'text-[11.5px] leading-[1.8] font-medium text-slate-700',
                ].join(' ')}>
                  {prefix}
                  {addedText && (
                    <span className={[
                      'inline bg-emerald-100 text-emerald-700',
                      'rounded-md px-1.5 py-0.5 mx-[2px]',
                      'font-bold',
                    ].join(' ')}>
                      {addedText.trim()}
                    </span>
                  )}
                  {suffix}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-stretch gap-2.5 pt-1">
                <button
                  onClick={handleReject}
                  className={[
                    'flex-1 py-2.5 px-4 rounded-xl',
                    'text-[11px] font-black tracking-wide',
                    'text-slate-500 border border-slate-200 bg-white',
                    'hover:bg-slate-50 hover:border-slate-300 hover:text-slate-700',
                    'active:scale-[0.98] transition-all duration-200',
                  ].join(' ')}
                >
                  Rejeter
                </button>
                <button
                  onClick={handleApprove}
                  className={[
                    'flex-1 py-2.5 px-4 rounded-xl',
                    'text-[11px] font-black tracking-wide',
                    'text-white bg-primary border border-primary',
                    'shadow-[0_2px_12px_rgba(90,87,255,0.25)]',
                    'hover:bg-primary-hover hover:-translate-y-[1px]',
                    'hover:shadow-[0_4px_18px_rgba(90,87,255,0.32)]',
                    'active:translate-y-0 active:scale-[0.98]',
                    'transition-all duration-200',
                  ].join(' ')}
                >
                  Valider &amp; appliquer
                </button>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  )
}

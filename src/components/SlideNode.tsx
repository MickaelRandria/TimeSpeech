import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react'
import { motion, AnimatePresence, useDragControls } from 'framer-motion'

export interface AISuggestion {
  text: string
  saveMinutes: number
}

export interface SlideNodeProps {
  index: number
  total: number
  title: string
  imageUrl: string
  initialNotes: string
  condensedNotes?: string
  baseMinutes: number
  aiSuggestion?: AISuggestion
  isMergeTarget?: boolean
  isMerging?: boolean
  // ── Soft paywall
  aiUsageCount: number
  freeLimit: number
  onAiUsed: () => void
  onUpgrade?: () => void
  // ── Events
  onMinutesDelta: (delta: number) => void
  onSuggestionAccepted?: () => void
  onDragStart?: () => void
  onDrag?: (x: number, y: number) => void
  onDragEnd?: () => void
  registerRef?: (el: HTMLDivElement | null) => void
}

// ── Icons ─────────────────────────────────────────────────────────────────────

function wc(t: string) {
  return t.trim().split(/\s+/).filter(Boolean).length
}

function ClockIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <circle cx="6" cy="6" r="5" />
      <path d="M6 3.5V6l1.8 1.8" />
    </svg>
  )
}

function SparkIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
      <path d="M8 1l1.5 4.5L14 7l-4.5 1.5L8 13l-1.5-4.5L2 7l4.5-1.5L8 1z" />
    </svg>
  )
}

function DragHandleIcon() {
  return (
    <svg width="11" height="15" viewBox="0 0 10 14" fill="currentColor">
      <circle cx="2.5" cy="2.5"  r="1.5" />
      <circle cx="7.5" cy="2.5"  r="1.5" />
      <circle cx="2.5" cy="7"    r="1.5" />
      <circle cx="7.5" cy="7"    r="1.5" />
      <circle cx="2.5" cy="11.5" r="1.5" />
      <circle cx="7.5" cy="11.5" r="1.5" />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="11" width="14" height="11" rx="2.5" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
      <circle cx="12" cy="16" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  )
}

// ── Constants ─────────────────────────────────────────────────────────────────

const SKELETON_WIDTHS = [94, 87, 91, 74, 88, 67, 82, 78, 92, 71]
const TRACK_SPRING    = { type: 'spring' as const, stiffness: 140, damping: 20 }

// ── Component ─────────────────────────────────────────────────────────────────

export default function SlideNode({
  index,
  total,
  title,
  imageUrl,
  initialNotes,
  condensedNotes,
  baseMinutes,
  aiSuggestion,
  isMergeTarget = false,
  isMerging     = false,
  aiUsageCount,
  freeLimit,
  onAiUsed,
  onUpgrade,
  onMinutesDelta,
  onSuggestionAccepted,
  onDragStart,
  onDrag,
  onDragEnd,
  registerRef,
}: SlideNodeProps) {
  const dragControls = useDragControls()

  // ── Slider
  const sliderMin = Math.max(3, Math.round(baseMinutes * 0.4))
  const sliderMax = Math.round(baseMinutes * 1.5)
  const [sliderValue, setSliderValue]           = useState(baseMinutes)
  const stableRef                                = useRef(baseMinutes)
  const [isHovering, setIsHovering]             = useState(false)
  const [isDraggingSlider, setIsDraggingSlider] = useState(false)

  // ── Rewrite state
  const [isRewriting, setIsRewriting] = useState(false)

  // ── Soft paywall
  const [showPaywall, setShowPaywall] = useState(false)

  // ── Notes + suggestion state
  const [notes, setNotes]                   = useState(initialNotes)
  const [suggestionDone, setSuggestionDone] = useState(false)
  const [showBar, setShowBar]               = useState(true)
  const [imgError, setImgError]             = useState(false)

  // ── Post-merge reveal
  const [justMerged, setJustMerged] = useState(false)
  const prevInitialNotes             = useRef(initialNotes)
  const prevBaseMinutes              = useRef(baseMinutes)

  // Sync when parent updates slides after a merge
  useEffect(() => {
    const notesChanged   = prevInitialNotes.current !== initialNotes
    const minutesChanged = prevBaseMinutes.current  !== baseMinutes

    if ((notesChanged || minutesChanged) && !isMerging) {
      if (notesChanged) {
        prevInitialNotes.current = initialNotes
        setNotes(initialNotes)
        setSuggestionDone(false)
        setShowBar(true)
        setShowPaywall(false)
      }
      if (minutesChanged) {
        prevBaseMinutes.current = baseMinutes
        setSliderValue(baseMinutes)
        stableRef.current = baseMinutes
      }
      if (notesChanged) {
        setJustMerged(true)
        const t = setTimeout(() => setJustMerged(false), 2800)
        return () => clearTimeout(t)
      }
    }
  }, [initialNotes, baseMinutes, isMerging])

  const shouldShowShimmer = isRewriting || isMerging
  const sliderPct         = ((sliderValue - sliderMin) / (sliderMax - sliderMin)) * 100
  const remaining         = freeLimit - aiUsageCount

  const hasActiveSuggestion = Boolean(
    aiSuggestion && !suggestionDone && notes.includes(aiSuggestion.text)
  )

  const parts = useMemo(() => {
    if (!hasActiveSuggestion || !aiSuggestion) return null
    const idx = notes.indexOf(aiSuggestion.text)
    if (idx < 0) return null
    return {
      before: notes.slice(0, idx),
      hl:     aiSuggestion.text,
      after:  notes.slice(idx + aiSuggestion.text.length),
    }
  }, [notes, hasActiveSuggestion, aiSuggestion])

  const handleSliderChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSliderValue(Number(e.target.value))
  }, [])

  const handlePointerUp = useCallback(() => {
    setIsDraggingSlider(false)
    const delta = sliderValue - stableRef.current
    if (Math.abs(delta) < 2) return

    // Always commit the new time value
    onMinutesDelta(delta)
    stableRef.current = sliderValue

    if (aiUsageCount < freeLimit) {
      // ── Free slot available: run AI rewrite
      const ratio    = sliderValue / baseMinutes
      const newNotes = ratio < 0.82 && condensedNotes ? condensedNotes : initialNotes
      onAiUsed()
      setShowPaywall(false)
      setIsRewriting(true)
      setTimeout(() => {
        setNotes(newNotes)
        setIsRewriting(false)
      }, 1500)
    } else {
      // ── Limit reached: show soft paywall instead of shimmer
      setShowPaywall(true)
    }
  }, [sliderValue, baseMinutes, condensedNotes, initialNotes, onMinutesDelta, aiUsageCount, freeLimit, onAiUsed])

  const handleAccept = useCallback(() => {
    if (!aiSuggestion) return
    const newNotes  = notes
      .replace(aiSuggestion.text, '')
      .replace(/[ \t]{2,}/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim()
    const newSlider = Math.max(sliderMin, sliderValue - aiSuggestion.saveMinutes)
    setSliderValue(newSlider)
    stableRef.current = newSlider
    onMinutesDelta(-aiSuggestion.saveMinutes)
    setNotes(newNotes)
    setSuggestionDone(true)
    setShowBar(false)
    onSuggestionAccepted?.()
  }, [aiSuggestion, notes, sliderValue, sliderMin, onMinutesDelta, onSuggestionAccepted])

  // ── Derived visual state ───────────────────────────────────────────────────

  const timeDelta   = sliderValue - baseMinutes
  const pillVariant = timeDelta < 0 ? 'emerald' : timeDelta > 0 ? 'orange' : 'primary'
  const pillClass   = {
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
    orange:  'bg-orange-50 text-orange-600 border-orange-200/60',
    primary: 'bg-primary/5 text-primary border-primary/15',
  }[pillVariant]

  const thumbScale  = isDraggingSlider ? 0.88 : isHovering ? 1.25 : 1
  const thumbShadow = isDraggingSlider
    ? '0 1px 5px rgba(90,87,255,0.15)'
    : isHovering
    ? '0 4px 18px rgba(90,87,255,0.35), 0 1px 4px rgba(0,0,0,0.06)'
    : '0 2px 10px rgba(90,87,255,0.25), 0 1px 3px rgba(0,0,0,0.05)'

  const cardBoxShadow = isMergeTarget
    ? '0 8px 40px rgba(15,23,42,0.09), 0 0 0 2.5px rgba(90,87,255,0.5), 0 0 28px rgba(90,87,255,0.14)'
    : isMerging
    ? '0 0 0 2px rgba(90,87,255,0.35), 0 8px 40px rgba(90,87,255,0.12)'
    : justMerged
    ? '0 0 0 2px rgba(90,87,255,0.22), 0 8px 32px rgba(15,23,42,0.06)'
    : '0 4px 32px rgba(15,23,42,0.05)'

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <motion.div
      ref={(el) => registerRef?.(el as HTMLDivElement | null)}
      drag
      dragControls={dragControls}
      dragListener={false}
      dragMomentum={false}
      dragElastic={0.04}
      dragSnapToOrigin
      onDrag={(_, info) => onDrag?.(info.point.x, info.point.y)}
      onDragEnd={onDragEnd}
      whileDrag={{
        scale:     1.025,
        boxShadow: '0 32px 72px rgba(15,23,42,0.22), 0 8px 28px rgba(90,87,255,0.16)',
        zIndex:    50,
        cursor:    'grabbing',
      }}
      animate={{
        scale:     isMergeTarget ? 0.975 : 1,
        boxShadow: cardBoxShadow,
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      style={{ position: 'relative', touchAction: 'none' }}
      className="bg-white rounded-3xl overflow-hidden border border-slate-100/60 hover:shadow-[0_8px_40px_rgba(15,23,42,0.09)] transition-shadow duration-500"
    >

      {/* ── MERGE TARGET OVERLAY ── */}
      <AnimatePresence>
        {isMergeTarget && (
          <motion.div
            key="merge-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.14 }}
            className="absolute inset-0 z-30 rounded-3xl pointer-events-none flex items-center justify-center"
            style={{ backgroundColor: 'rgba(90,87,255,0.04)' }}
          >
            <motion.div
              initial={{ scale: 0.78, opacity: 0, y: 8 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 360, damping: 26, delay: 0.06 }}
              className="flex items-center gap-3 bg-primary text-white text-base font-black px-7 py-4 rounded-2xl shadow-[0_6px_24px_rgba(90,87,255,0.45)]"
            >
              <svg width="18" height="18" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="7" cy="7" r="6" />
                <path d="M7 4v6M4 7h6" />
              </svg>
              Fusionner ici
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MERGING PROGRESS SWEEP ── */}
      <AnimatePresence>
        {isMerging && (
          <motion.div
            key="merge-progress"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute top-0 left-0 right-0 h-[3px] z-20 overflow-hidden pointer-events-none rounded-t-3xl"
          >
            <motion.div
              className="h-full w-[45%] bg-gradient-to-r from-transparent via-primary to-transparent"
              animate={{ x: ['-110%', '280%'] }}
              transition={{ duration: 1.35, repeat: Infinity, ease: 'linear' }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── HEADER ── */}
      <div className="flex items-center gap-3 px-7 py-5 border-b border-slate-100/50 bg-white/80">
        <div
          onPointerDown={(e) => {
            e.preventDefault()
            dragControls.start(e)
            onDragStart?.()
          }}
          className="cursor-grab active:cursor-grabbing text-slate-200 hover:text-primary/50 transition-colors duration-150 flex-shrink-0 select-none px-1 py-2 -ml-1 touch-none"
          title="Glisser pour fusionner"
        >
          <DragHandleIcon />
        </div>

        <span className="text-sm font-black text-slate-300 font-mono tabular-nums w-6 flex-shrink-0">
          {String(index).padStart(2, '0')}
        </span>
        <p className="flex-1 text-2xl font-extrabold text-slate-800 tracking-tight truncate">{title}</p>

        <AnimatePresence mode="wait">
          <motion.div
            key={sliderValue}
            initial={{ scale: 1.35, opacity: 0, y: -6 }}
            animate={{ scale: 1,    opacity: 1, y: 0  }}
            exit={{   scale: 0.75,  opacity: 0, y: 4  }}
            transition={{ type: 'spring', stiffness: 320, damping: 24 }}
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-black border ${pillClass}`}
          >
            <ClockIcon />
            {sliderValue} min
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── TIME SQUEEZER ── */}
      <div className="px-8 py-5 border-b border-slate-100/50 bg-gradient-to-r from-primary/[0.025] to-transparent">
        <div className="flex items-center gap-5">

          <span className="text-sm font-black uppercase tracking-widest text-slate-400 w-12 flex-shrink-0">
            Durée
          </span>

          {/* Track + native slider */}
          <div className="flex-1 relative h-7 flex items-center">
            <div className="absolute inset-y-0 flex items-center w-full pointer-events-none">
              <div className="w-full h-[7px] bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: 'linear-gradient(to right, rgba(90,87,255,0.25), rgba(90,87,255,0.5))' }}
                  animate={{ width: `${sliderPct}%` }}
                  transition={TRACK_SPRING}
                />
              </div>
            </div>

            <motion.div
              className="absolute top-1/2 -translate-y-1/2 pointer-events-none z-0"
              animate={{ left: `${sliderPct}%` }}
              transition={TRACK_SPRING}
            >
              <motion.div
                className="w-6 h-6 -translate-x-1/2 bg-white rounded-full border-2 border-primary/20"
                animate={{ scale: thumbScale, boxShadow: thumbShadow }}
                transition={{ type: 'spring', stiffness: 280, damping: 22 }}
              />
            </motion.div>

            <input
              type="range"
              min={sliderMin}
              max={sliderMax}
              value={sliderValue}
              onChange={handleSliderChange}
              onPointerDown={() => setIsDraggingSlider(true)}
              onPointerUp={handlePointerUp}
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => { setIsHovering(false); setIsDraggingSlider(false) }}
              className="absolute inset-0 w-full opacity-0 cursor-pointer z-10"
              style={{ height: '100%' }}
            />
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <AnimatePresence mode="wait">
              <motion.span
                key={sliderValue}
                initial={{ opacity: 0, y: -5, scale: 1.15 }}
                animate={{ opacity: 1, y: 0,  scale: 1    }}
                exit={{   opacity: 0, y: 5,   scale: 0.88 }}
                transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                className="text-2xl font-black text-slate-800 tabular-nums w-[80px] text-right"
              >
                {sliderValue} min
              </motion.span>
            </AnimatePresence>

            <motion.span
              animate={
                isRewriting || isMerging
                  ? { opacity: [0.5, 1, 0.5], scale: [0.92, 1.14, 0.92] }
                  : { opacity: 0.22, scale: 1 }
              }
              transition={
                isRewriting || isMerging
                  ? { repeat: Infinity, duration: 0.75, ease: 'easeInOut' }
                  : { duration: 0.35 }
              }
              className="text-xl select-none"
            >
              ✨
            </motion.span>
          </div>
        </div>

        {/* Min / max labels + usage indicator */}
        <div className="flex items-center justify-between mt-2 pl-[68px]">
          <span className="text-sm font-semibold text-slate-300 tabular-nums">{sliderMin} min</span>

          {/* Usage counter — visible only at 1 remaining or exhausted */}
          <AnimatePresence mode="wait">
            {remaining <= 0 ? (
              <motion.span
                key="limit-reached"
                initial={{ opacity: 0, scale: 0.88 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 280, damping: 22 }}
                className="flex items-center gap-1.5 text-xs font-black text-rose-400"
              >
                <svg width="7" height="7" viewBox="0 0 8 8" fill="currentColor">
                  <circle cx="4" cy="4" r="4" />
                </svg>
                Limite IA atteinte
              </motion.span>
            ) : remaining === 1 ? (
              <motion.span
                key="one-left"
                initial={{ opacity: 0, scale: 0.88 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 280, damping: 22 }}
                className="text-xs font-bold text-orange-400"
              >
                1 analyse IA restante
              </motion.span>
            ) : null}
          </AnimatePresence>

          <span className="text-sm font-semibold text-slate-300 tabular-nums">{sliderMax} min</span>
        </div>
      </div>

      {/* ── BODY: slide preview + notes / paywall ── */}
      <div className="flex min-h-[280px]">

        {/* LEFT — slide preview */}
        <div className="w-[40%] flex-shrink-0 p-6 flex items-center bg-slate-50/50 border-r border-slate-100/40">
          <div
            className="relative w-full rounded-2xl overflow-hidden border border-slate-200/50 shadow-[0_4px_20px_rgba(15,23,42,0.08)]"
            style={{ aspectRatio: '16/9' }}
          >
            <div className="absolute inset-0 flex flex-col items-center justify-center select-none pointer-events-none bg-gradient-to-br from-primary/5 via-violet-50/50 to-slate-100">
              <span className="text-[52px] font-black text-slate-100/90 font-mono leading-none">
                {String(index).padStart(2, '0')}
              </span>
              <p className="text-[9px] font-extrabold text-slate-300 mt-2 uppercase tracking-[0.16em] text-center px-3 max-w-full line-clamp-2">
                {title}
              </p>
            </div>

            {!imgError && (
              <img
                src={imageUrl}
                alt={title}
                className="absolute inset-0 w-full h-full object-cover z-10"
                onError={() => setImgError(true)}
              />
            )}

            <div className="absolute bottom-2 right-2 z-20 bg-black/20 backdrop-blur-md rounded-lg px-2 py-0.5">
              <span className="text-xs font-black text-white/90 font-mono">
                {index} / {total}
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT — speaker notes OR soft paywall */}
        <motion.div
          className="flex-1 flex flex-col min-w-0 relative overflow-hidden"
          animate={{ backgroundColor: showPaywall ? 'rgba(238,242,255,0.45)' : 'rgba(255,255,255,0)' }}
          transition={{ duration: 0.45, ease: 'easeInOut' }}
        >
          <AnimatePresence mode="wait" initial={false}>

            {/* ─── SOFT PAYWALL ─────────────────────────────────────── */}
            {showPaywall ? (
              <motion.div
                key="paywall"
                initial={{ opacity: 0, scale: 0.97, y: 10 }}
                animate={{ opacity: 1, scale: 1,    y: 0  }}
                exit={{   opacity: 0, scale: 0.97, y: -8  }}
                transition={{ type: 'spring', stiffness: 260, damping: 26 }}
                className="absolute inset-0 flex flex-col items-center justify-center gap-7 p-8 text-center"
              >
                {/* Ambient blobs */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
                  <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-primary/6 blur-3xl" />
                  <div className="absolute -bottom-10 -left-10 w-36 h-36 rounded-full bg-violet-300/8 blur-3xl" />
                </div>

                {/* Icon */}
                <motion.div
                  initial={{ scale: 0.55, opacity: 0 }}
                  animate={{ scale: 1,    opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 340, damping: 22, delay: 0.06 }}
                  className="relative flex-shrink-0"
                >
                  <div className="w-[60px] h-[60px] rounded-[18px] bg-gradient-to-br from-primary/10 via-violet-100/70 to-purple-100/50 border border-primary/18 flex items-center justify-center shadow-[0_6px_28px_rgba(90,87,255,0.18)] text-primary">
                    <LockIcon />
                  </div>
                  <motion.span
                    animate={{ rotate: [0, 12, -12, 0], scale: [1, 1.2, 1.2, 1] }}
                    transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
                    className="absolute -top-2 -right-2 text-sm select-none leading-none"
                    aria-hidden
                  >
                    ✦
                  </motion.span>
                </motion.div>

                {/* Text */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="flex flex-col gap-2.5 relative z-10"
                >
                  <p className="text-xl font-black text-slate-800 tracking-tight leading-tight">
                    Limite d'essai atteinte
                  </p>
                  <p className="text-sm font-semibold text-slate-500 leading-relaxed max-w-[230px] mx-auto">
                    Débloquez le calibrage IA illimité avec{' '}
                    <span className="text-primary font-bold">Timespeech Premium</span>.
                  </p>
                </motion.div>

                {/* CTAs */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.17 }}
                  className="flex flex-col gap-3 w-full max-w-[230px] relative z-10"
                >
                  <button
                    onClick={onUpgrade}
                    className="w-full flex items-center justify-center gap-2 py-3.5 px-5 rounded-xl bg-primary text-white text-sm font-black tracking-tight shadow-[0_4px_22px_rgba(90,87,255,0.34)] hover:-translate-y-[1.5px] hover:shadow-[0_8px_32px_rgba(90,87,255,0.44)] active:translate-y-0 active:scale-[0.98] transition-all duration-200"
                  >
                    <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
                      <path d="M8 1l1.5 4.5L14 7l-4.5 1.5L8 13l-1.5-4.5L2 7l4.5-1.5L8 1z" />
                    </svg>
                    Passer en Premium
                  </button>

                  <button
                    onClick={() => setShowPaywall(false)}
                    className="w-full py-2.5 px-5 rounded-xl text-sm font-bold text-slate-400 hover:text-slate-600 hover:bg-white/80 border border-transparent hover:border-slate-100/80 transition-all duration-200"
                  >
                    Retour à l'édition manuelle
                  </button>
                </motion.div>
              </motion.div>

            ) : (

              /* ─── SPEAKER NOTES ─────────────────────────────────── */
              <motion.div
                key="notes-panel"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="flex-1 flex flex-col p-7 gap-4"
              >
                {/* Notes header */}
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-black uppercase tracking-widest text-slate-400">
                    Notes du présentateur
                  </span>
                  {hasActiveSuggestion && showBar && (
                    <motion.span
                      initial={{ opacity: 0, x: 6 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wide text-rose-500 bg-rose-50 border border-rose-100/80 rounded-full px-3 py-1 flex-shrink-0"
                    >
                      <SparkIcon />
                      Suggestion IA
                    </motion.span>
                  )}
                  {isMerging && (
                    <motion.span
                      initial={{ opacity: 0, x: 6 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wide text-primary bg-primary/10 border border-primary/20 rounded-full px-3 py-1 flex-shrink-0"
                    >
                      <span className="w-2 h-2 rounded-full bg-primary animate-pulse flex-shrink-0" />
                      IA réécriture
                    </motion.span>
                  )}
                </div>

                {/* Notes area + shimmer */}
                <motion.div
                  animate={justMerged ? {
                    backgroundColor: ['rgba(90,87,255,0.0)', 'rgba(90,87,255,0.04)', 'rgba(90,87,255,0.0)'],
                  } : { backgroundColor: 'rgba(90,87,255,0.0)' }}
                  transition={{ duration: 2, ease: 'easeOut' }}
                  className="relative flex-1 min-h-[200px] rounded-xl"
                >
                  {/* Content */}
                  <motion.div
                    animate={{ opacity: shouldShowShimmer ? 0 : 1 }}
                    transition={{ duration: 0.2 }}
                    className="absolute inset-0"
                  >
                    {hasActiveSuggestion && parts ? (
                      <div className="w-full h-full text-lg leading-relaxed text-slate-700 font-medium overflow-y-auto pr-2">
                        {parts.before}
                        <motion.span
                          layoutId="hl"
                          className="relative inline bg-rose-100/80 text-rose-700 rounded-md px-1 py-0.5 cursor-default"
                        >
                          {parts.hl}
                        </motion.span>
                        {parts.after}
                      </div>
                    ) : (
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="absolute inset-0 w-full h-full resize-none text-lg leading-relaxed text-slate-700 font-medium bg-transparent border-0 focus:outline-none focus:ring-0 placeholder:text-slate-300 py-1"
                        placeholder="Ajoutez vos notes de présentation…"
                      />
                    )}
                  </motion.div>

                  {/* Shimmer skeleton */}
                  <AnimatePresence>
                    {shouldShowShimmer && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.18 }}
                        className="absolute inset-0 flex flex-col gap-3 py-1 pointer-events-none"
                      >
                        {SKELETON_WIDTHS.map((w, i) => (
                          <div
                            key={i}
                            className="relative h-[15px] overflow-hidden rounded-full bg-slate-100/80 flex-shrink-0"
                            style={{ width: `${w}%` }}
                          >
                            <motion.div
                              className="absolute inset-y-0 w-[65%] bg-gradient-to-r from-transparent via-white/90 to-transparent"
                              animate={{ x: ['-100%', '280%'] }}
                              transition={{ duration: 1.3, repeat: Infinity, ease: 'linear', delay: i * 0.06 }}
                            />
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <span className="text-sm text-slate-400 font-semibold tabular-nums">
                    {wc(notes)} mots
                  </span>
                  <AnimatePresence mode="wait">
                    {justMerged ? (
                      <motion.span
                        key="merged"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0 }}
                        className="text-sm font-black text-primary flex items-center gap-1.5"
                      >
                        ✦ Fusionnées par l'IA
                      </motion.span>
                    ) : suggestionDone ? (
                      <motion.span
                        key="accepted"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0 }}
                        className="text-sm font-black text-emerald-600 flex items-center gap-1.5"
                      >
                        ✓ &minus;{aiSuggestion?.saveMinutes} min appliquées
                      </motion.span>
                    ) : null}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* ── AI ACTION BAR ── */}
      <AnimatePresence initial={false}>
        {hasActiveSuggestion && showBar && !showPaywall && (
          <motion.div
            key="ai-bar"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              height:  { type: 'spring', stiffness: 150, damping: 22 },
              opacity: { duration: 0.16, ease: 'easeOut' },
            }}
            className="overflow-hidden"
          >
            <div className="px-8 py-6 border-t border-rose-100/70 bg-gradient-to-r from-rose-50/50 via-amber-50/20 to-white flex items-center gap-5">
              <span className="text-2xl flex-shrink-0 select-none">✂️</span>

              <p className="flex-1 min-w-0 text-base font-semibold text-slate-700 leading-snug">
                Point redondant détecté.{' '}
                <span className="text-rose-600 font-bold">Supprimer </span>
                <span className="text-slate-500">pour gagner </span>
                <span className="text-emerald-600 font-black">~{aiSuggestion?.saveMinutes} min</span>
                <span className="text-slate-500"> sur cette section.</span>
              </p>

              <div className="flex items-center gap-3 flex-shrink-0">
                <button
                  onClick={() => setShowBar(false)}
                  className="text-sm font-bold text-slate-400 hover:text-slate-600 px-4 py-2 rounded-xl hover:bg-slate-100/70 transition-all duration-150"
                >
                  Ignorer
                </button>
                <button
                  onClick={handleAccept}
                  className="text-sm font-black text-white bg-emerald-500 hover:bg-emerald-400 px-5 py-2.5 rounded-xl shadow-[0_2px_10px_rgba(16,185,129,0.28)] hover:-translate-y-[1px] hover:shadow-[0_4px_18px_rgba(16,185,129,0.36)] active:translate-y-0 active:scale-[0.98] transition-all duration-200"
                >
                  ✓ Accepter &amp; appliquer
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

import React, { useState, useRef, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

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
  onMinutesDelta: (delta: number) => void
  onSuggestionAccepted?: () => void
}

function wc(t: string) {
  return t.trim().split(/\s+/).filter(Boolean).length
}

function ClockIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <circle cx="6" cy="6" r="5" />
      <path d="M6 3.5V6l1.8 1.8" />
    </svg>
  )
}

function SparkIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
      <path d="M8 1l1.5 4.5L14 7l-4.5 1.5L8 13l-1.5-4.5L2 7l4.5-1.5L8 1z" />
    </svg>
  )
}

const SKELETON_WIDTHS = [94, 87, 91, 74, 88, 67, 82, 78]
const TRACK_SPRING = { type: 'spring' as const, stiffness: 140, damping: 20 }

export default function SlideNode({
  index,
  total,
  title,
  imageUrl,
  initialNotes,
  condensedNotes,
  baseMinutes,
  aiSuggestion,
  onMinutesDelta,
  onSuggestionAccepted,
}: SlideNodeProps) {
  // ── Slider
  const sliderMin = Math.max(3, Math.round(baseMinutes * 0.4))
  const sliderMax = Math.round(baseMinutes * 1.5)
  const [sliderValue, setSliderValue] = useState(baseMinutes)
  const stableRef = useRef(baseMinutes)
  const [isHovering, setIsHovering] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  // ── Rewrite state
  const [isRewriting, setIsRewriting] = useState(false)

  // ── Notes + suggestion state
  const [notes, setNotes] = useState(initialNotes)
  const [suggestionDone, setSuggestionDone] = useState(false)
  const [showBar, setShowBar] = useState(true)
  const [imgError, setImgError] = useState(false)

  const sliderPct = ((sliderValue - sliderMin) / (sliderMax - sliderMin)) * 100

  const hasActiveSuggestion = Boolean(
    aiSuggestion && !suggestionDone && notes.includes(aiSuggestion.text)
  )

  const parts = useMemo(() => {
    if (!hasActiveSuggestion || !aiSuggestion) return null
    const idx = notes.indexOf(aiSuggestion.text)
    if (idx < 0) return null
    return {
      before: notes.slice(0, idx),
      hl: aiSuggestion.text,
      after: notes.slice(idx + aiSuggestion.text.length),
    }
  }, [notes, hasActiveSuggestion, aiSuggestion])

  const handleSliderChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSliderValue(Number(e.target.value))
  }, [])

  const handlePointerUp = useCallback(() => {
    setIsDragging(false)
    const delta = sliderValue - stableRef.current
    if (Math.abs(delta) >= 2) {
      const ratio = sliderValue / baseMinutes
      const newNotes = ratio < 0.82 && condensedNotes ? condensedNotes : initialNotes
      onMinutesDelta(delta)
      stableRef.current = sliderValue
      setIsRewriting(true)
      setTimeout(() => {
        setNotes(newNotes)
        setIsRewriting(false)
      }, 1500)
    }
  }, [sliderValue, baseMinutes, condensedNotes, initialNotes, onMinutesDelta])

  const handleAccept = useCallback(() => {
    if (!aiSuggestion) return
    const newNotes = notes
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

  const timeDelta = sliderValue - baseMinutes
  const pillVariant = timeDelta < 0 ? 'emerald' : timeDelta > 0 ? 'orange' : 'primary'
  const pillClass = {
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
    orange:  'bg-orange-50 text-orange-600 border-orange-200/60',
    primary: 'bg-primary/5 text-primary border-primary/15',
  }[pillVariant]

  const thumbScale = isDragging ? 0.88 : isHovering ? 1.28 : 1
  const thumbShadow = isDragging
    ? '0 1px 5px rgba(90,87,255,0.15)'
    : isHovering
    ? '0 4px 18px rgba(90,87,255,0.35), 0 1px 4px rgba(0,0,0,0.06)'
    : '0 2px 10px rgba(90,87,255,0.25), 0 1px 3px rgba(0,0,0,0.05)'

  return (
    <motion.div
      layout
      transition={{ type: 'spring', stiffness: 110, damping: 20 }}
      className="bg-white rounded-3xl overflow-hidden border border-slate-100/60 shadow-[0_4px_32px_rgba(15,23,42,0.05)] hover:shadow-[0_8px_40px_rgba(15,23,42,0.09)] transition-shadow duration-500"
    >
      {/* ── HEADER ── */}
      <div className="flex items-center gap-3 px-7 py-[14px] border-b border-slate-100/50 bg-white/80">
        <span className="text-[11px] font-black text-slate-200 font-mono tabular-nums w-5 flex-shrink-0">
          {String(index).padStart(2, '0')}
        </span>
        <p className="flex-1 text-[13px] font-extrabold text-slate-800 tracking-tight truncate">{title}</p>

        <AnimatePresence mode="wait">
          <motion.div
            key={sliderValue}
            initial={{ scale: 1.35, opacity: 0, y: -6 }}
            animate={{ scale: 1,    opacity: 1, y: 0  }}
            exit={{   scale: 0.75,  opacity: 0, y: 4  }}
            transition={{ type: 'spring', stiffness: 320, damping: 24 }}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-black border ${pillClass}`}
          >
            <ClockIcon />
            {sliderValue} min
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── TIME SQUEEZER ── */}
      <div className="px-7 py-4 border-b border-slate-100/50 bg-gradient-to-r from-primary/[0.025] to-transparent">
        <div className="flex items-center gap-4">

          {/* Label */}
          <span className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-300 w-10 flex-shrink-0">
            Durée
          </span>

          {/* Track + invisible native input */}
          <div className="flex-1 relative h-6 flex items-center">

            {/* Visual track (pointer-events-none) */}
            <div className="absolute inset-y-0 flex items-center w-full pointer-events-none">
              <div className="w-full h-[5px] bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: 'linear-gradient(to right, rgba(90,87,255,0.25), rgba(90,87,255,0.5))' }}
                  animate={{ width: `${sliderPct}%` }}
                  transition={TRACK_SPRING}
                />
              </div>
            </div>

            {/* Visual thumb (pointer-events-none, driven by hover/drag state) */}
            <motion.div
              className="absolute top-1/2 -translate-y-1/2 pointer-events-none z-0"
              animate={{ left: `${sliderPct}%` }}
              transition={TRACK_SPRING}
            >
              <motion.div
                className="w-5 h-5 -translate-x-1/2 bg-white rounded-full border-2 border-primary/20"
                animate={{ scale: thumbScale, boxShadow: thumbShadow }}
                transition={{ type: 'spring', stiffness: 280, damping: 22 }}
              />
            </motion.div>

            {/* Native input — transparent, captures all pointer events */}
            <input
              type="range"
              min={sliderMin}
              max={sliderMax}
              value={sliderValue}
              onChange={handleSliderChange}
              onPointerDown={() => setIsDragging(true)}
              onPointerUp={handlePointerUp}
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => { setIsHovering(false); setIsDragging(false) }}
              className="absolute inset-0 w-full opacity-0 cursor-pointer z-10"
              style={{ height: '100%' }}
            />
          </div>

          {/* Time value + spark icon */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <AnimatePresence mode="wait">
              <motion.span
                key={sliderValue}
                initial={{ opacity: 0, y: -4, scale: 1.15 }}
                animate={{ opacity: 1, y: 0,  scale: 1    }}
                exit={{   opacity: 0, y: 4,   scale: 0.88 }}
                transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                className="text-[14px] font-black text-slate-800 tabular-nums w-[50px] text-right"
              >
                {sliderValue} min
              </motion.span>
            </AnimatePresence>

            <motion.span
              animate={
                isRewriting
                  ? { opacity: [0.5, 1, 0.5], scale: [0.92, 1.14, 0.92] }
                  : { opacity: 0.22, scale: 1 }
              }
              transition={
                isRewriting
                  ? { repeat: Infinity, duration: 0.75, ease: 'easeInOut' }
                  : { duration: 0.35 }
              }
              className="text-[13px] select-none"
            >
              ✨
            </motion.span>
          </div>
        </div>

        {/* Min / max labels */}
        <div className="flex justify-between mt-1.5 pl-14">
          <span className="text-[9px] font-bold text-slate-200 tabular-nums">{sliderMin} min</span>
          <span className="text-[9px] font-bold text-slate-200 tabular-nums">{sliderMax} min</span>
        </div>
      </div>

      {/* ── BODY: slide + notes ── */}
      <div className="flex min-h-[200px]">

        {/* LEFT — slide preview */}
        <div className="w-[44%] flex-shrink-0 p-5 flex items-center bg-slate-50/50 border-r border-slate-100/40">
          <div
            className="relative w-full rounded-2xl overflow-hidden border border-slate-200/50 shadow-[0_4px_20px_rgba(15,23,42,0.08)]"
            style={{ aspectRatio: '16/9' }}
          >
            {/* Gradient placeholder — always underneath */}
            <div className="absolute inset-0 flex flex-col items-center justify-center select-none pointer-events-none bg-gradient-to-br from-primary/5 via-violet-50/50 to-slate-100">
              <span className="text-[52px] font-black text-slate-100/90 font-mono leading-none">
                {String(index).padStart(2, '0')}
              </span>
              <p className="text-[8px] font-extrabold text-slate-300 mt-2 uppercase tracking-[0.16em] text-center px-3 max-w-full line-clamp-2">
                {title}
              </p>
            </div>

            {/* Actual image (overlay) */}
            {!imgError && (
              <img
                src={imageUrl}
                alt={title}
                className="absolute inset-0 w-full h-full object-cover z-10"
                onError={() => setImgError(true)}
              />
            )}

            {/* Slide counter chip */}
            <div className="absolute bottom-2 right-2 z-20 bg-black/20 backdrop-blur-md rounded-lg px-2 py-0.5">
              <span className="text-[9px] font-black text-white/90 font-mono">
                {index} / {total}
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT — speaker notes */}
        <div className="flex-1 flex flex-col p-5 gap-2 min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-300">
              Notes du présentateur
            </span>
            {hasActiveSuggestion && showBar && (
              <motion.span
                initial={{ opacity: 0, x: 6 }}
                animate={{ opacity: 1, x: 0 }}
                className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-rose-500 bg-rose-50 border border-rose-100/80 rounded-full px-2 py-0.5"
              >
                <SparkIcon />
                1 suggestion IA
              </motion.span>
            )}
          </div>

          {/* Notes area with shimmer overlay */}
          <div className="relative flex-1 min-h-[130px]">

            {/* Content layer — fades during rewriting */}
            <motion.div
              animate={{ opacity: isRewriting ? 0 : 1 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0"
            >
              {hasActiveSuggestion && parts ? (
                <div className="w-full h-full text-[12px] leading-[1.95] text-slate-500 font-medium overflow-y-auto pr-1">
                  {parts.before}
                  <motion.span
                    layoutId="hl"
                    className="relative inline bg-rose-100/80 text-rose-700 rounded-md px-[3px] py-[1px] cursor-default"
                  >
                    {parts.hl}
                  </motion.span>
                  {parts.after}
                </div>
              ) : (
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="absolute inset-0 w-full h-full resize-none text-[12px] leading-[1.95] text-slate-500 font-medium bg-transparent border-0 focus:outline-none focus:ring-0 placeholder:text-slate-200"
                  placeholder="Ajoutez vos notes de présentation…"
                />
              )}
            </motion.div>

            {/* Shimmer skeleton overlay */}
            <AnimatePresence>
              {isRewriting && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  className="absolute inset-0 flex flex-col gap-[10px] py-1 pointer-events-none"
                >
                  {SKELETON_WIDTHS.map((w, i) => (
                    <div
                      key={i}
                      className="relative h-[11px] overflow-hidden rounded-full bg-slate-100/80 flex-shrink-0"
                      style={{ width: `${w}%` }}
                    >
                      <motion.div
                        className="absolute inset-y-0 w-[65%] bg-gradient-to-r from-transparent via-white/90 to-transparent"
                        animate={{ x: ['-100%', '280%'] }}
                        transition={{
                          duration: 1.3,
                          repeat: Infinity,
                          ease: 'linear',
                          delay: i * 0.065,
                        }}
                      />
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-50">
            <span className="text-[10px] text-slate-300 font-bold tabular-nums">
              {wc(notes)} mots
            </span>
            <AnimatePresence>
              {suggestionDone && (
                <motion.span
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-[10px] font-black text-emerald-600 flex items-center gap-1"
                >
                  ✓ &minus;{aiSuggestion?.saveMinutes} min appliquées
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ── AI ACTION BAR — spring-expands from bottom ── */}
      <AnimatePresence initial={false}>
        {hasActiveSuggestion && showBar && (
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
            <div className="px-7 py-4 border-t border-rose-100/70 bg-gradient-to-r from-rose-50/50 via-amber-50/20 to-white flex items-center gap-4">
              <span className="text-[18px] flex-shrink-0 select-none">✂️</span>

              <p className="flex-1 min-w-0 text-[11.5px] font-semibold text-slate-700 leading-snug">
                Point redondant détecté.{' '}
                <span className="text-rose-600 font-bold">Supprimer </span>
                <span className="text-slate-500">pour gagner </span>
                <span className="text-emerald-600 font-black">~{aiSuggestion?.saveMinutes} min</span>
                <span className="text-slate-500"> sur cette section.</span>
              </p>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => setShowBar(false)}
                  className="text-[11px] font-bold text-slate-400 hover:text-slate-600 px-3 py-1.5 rounded-xl hover:bg-slate-100/70 transition-all duration-150"
                >
                  Ignorer
                </button>
                <button
                  onClick={handleAccept}
                  className="text-[11px] font-black text-white bg-emerald-500 hover:bg-emerald-400 px-4 py-2 rounded-xl shadow-[0_2px_10px_rgba(16,185,129,0.28)] hover:-translate-y-[1px] hover:shadow-[0_4px_18px_rgba(16,185,129,0.36)] active:translate-y-0 active:scale-[0.98] transition-all duration-200"
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

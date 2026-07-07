import React, { useState, useEffect, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { AISuggestion } from './SlideNode'
import BentoCard from './BentoCard'

// ── Props ──────────────────────────────────────────────────────────────────────

export interface CarouselSlideData {
  id: string
  title: string
  imageUrl: string
  notes: string
  aiSuggestion?: AISuggestion
}

export interface SlideCarouselProps {
  slides: CarouselSlideData[]
  onNotesChange: (slideId: string, notes: string) => void
  onAcceptSuggestion: (slideId: string) => void
}

// ── Icons ──────────────────────────────────────────────────────────────────────

function ChevronIcon({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d={direction === 'left' ? 'M10 3L5 8l5 5' : 'M6 3l5 5-5 5'} />
    </svg>
  )
}

// ── 3D transform math — active is centered/huge, one neighbor peeks per side ───

interface SlideTransform {
  xPct: number
  z: number
  rotateY: number
  scale: number
  opacity: number
  zIndex: number
}

const ACTIVE_TRANSFORM: SlideTransform = { xPct: 0, z: 0, rotateY: 0, scale: 1, opacity: 1, zIndex: 10 }

function transformForOffset(offset: number): SlideTransform {
  if (offset === 0) return ACTIVE_TRANSFORM
  const side = offset < 0 ? -1 : 1
  return { xPct: side * 40, z: -240, rotateY: side * 35, scale: 0.72, opacity: 0.4, zIndex: 5 }
}

const SPRING = { type: 'spring' as const, stiffness: 300, damping: 30 }
const BREATHE = { duration: 4, repeat: Infinity, ease: 'easeInOut' as const }
const SWIPE_DISTANCE_THRESHOLD = 90
const SWIPE_VELOCITY_THRESHOLD = 500
const TAP_ZONE = 0.25 // outer 25% on each side of the stage counts as a "peek and click" zone

// ── Component ──────────────────────────────────────────────────────────────────

export default function SlideCarousel({ slides, onNotesChange, onAcceptSuggestion }: SlideCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [notesDraft, setNotesDraft]   = useState(slides[0]?.notes ?? '')
  const [dismissed, setDismissed]     = useState(false)
  const stageRef = useRef<HTMLDivElement>(null)

  const activeSlide = slides[activeIndex]

  // Reset the local draft + dismiss state whenever the active slide changes
  useEffect(() => {
    setNotesDraft(activeSlide?.notes ?? '')
    setDismissed(false)
  }, [activeSlide?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  function goTo(i: number) {
    setActiveIndex(Math.max(0, Math.min(slides.length - 1, i)))
  }
  const goNext = () => goTo(activeIndex + 1)
  const goPrev = () => goTo(activeIndex - 1)

  const hasActiveSuggestion = Boolean(
    activeSlide?.aiSuggestion && !dismissed && activeSlide.notes.includes(activeSlide.aiSuggestion.text)
  )

  const highlightedParts = useMemo(() => {
    if (!hasActiveSuggestion || !activeSlide?.aiSuggestion) return null
    const idx = activeSlide.notes.indexOf(activeSlide.aiSuggestion.text)
    if (idx < 0) return null
    return {
      before: activeSlide.notes.slice(0, idx),
      hl:     activeSlide.aiSuggestion.text,
      after:  activeSlide.notes.slice(idx + activeSlide.aiSuggestion.text.length),
    }
  }, [hasActiveSuggestion, activeSlide])

  if (!activeSlide) return null

  return (
    <div className="grid grid-cols-[65fr_35fr] gap-8 items-start">

      {/* ══ LEFT — The MASSIVE 3D Carousel ══════════════════════════════ */}
      <div className="flex flex-col gap-5 min-w-0">
        <div ref={stageRef} className="relative h-[540px] [perspective:1400px] overflow-hidden select-none">

          {/* Drag/tap-capture layer — swipe anywhere to navigate, tap the edges to nudge */}
          <motion.div
            className="absolute inset-0 z-20 cursor-grab active:cursor-grabbing"
            drag="x"
            dragElastic={0.2}
            dragMomentum={false}
            dragSnapToOrigin
            onDragEnd={(_, info) => {
              if (info.offset.x < -SWIPE_DISTANCE_THRESHOLD || info.velocity.x < -SWIPE_VELOCITY_THRESHOLD) goNext()
              else if (info.offset.x > SWIPE_DISTANCE_THRESHOLD || info.velocity.x > SWIPE_VELOCITY_THRESHOLD) goPrev()
            }}
            onTap={(_, info) => {
              const rect = stageRef.current?.getBoundingClientRect()
              if (!rect) return
              const relX = (info.point.x - rect.left) / rect.width
              if (relX < TAP_ZONE) goPrev()
              else if (relX > 1 - TAP_ZONE) goNext()
            }}
          />

          {slides.map((slide, i) => {
            const offset = i - activeIndex
            if (Math.abs(offset) > 1) return null
            const isActive = offset === 0
            const t = transformForOffset(offset)
            return (
              <motion.div
                key={slide.id}
                className="absolute inset-0 flex items-center justify-center"
                style={{ zIndex: t.zIndex }}
                animate={{ x: `${t.xPct}%`, z: t.z, rotateY: t.rotateY, scale: t.scale, opacity: t.opacity }}
                transition={SPRING}
              >
                {isActive ? (
                  <motion.img
                    src={slide.imageUrl}
                    alt={slide.title}
                    animate={{ y: [0, -8, 0] }}
                    transition={BREATHE}
                    className="w-[88%] aspect-video object-cover rounded-[1.75rem] border border-white/80 shadow-[0_20px_50px_rgba(0,0,0,0.15)]"
                  />
                ) : (
                  <img
                    src={slide.imageUrl}
                    alt={slide.title}
                    className="w-[88%] aspect-video object-cover rounded-[1.75rem] border border-white/60 shadow-lg"
                  />
                )}
              </motion.div>
            )
          })}

          {/* Nav arrows */}
          <button
            onClick={goPrev}
            disabled={activeIndex === 0}
            aria-label="Slide précédente"
            className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-11 h-11 flex items-center justify-center rounded-full bg-white/90 backdrop-blur-sm border border-slate-100 shadow-[0_4px_20px_rgba(15,23,42,0.1)] text-slate-500 hover:text-primary hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-0 disabled:pointer-events-none"
          >
            <ChevronIcon direction="left" />
          </button>
          <button
            onClick={goNext}
            disabled={activeIndex === slides.length - 1}
            aria-label="Slide suivante"
            className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-11 h-11 flex items-center justify-center rounded-full bg-white/90 backdrop-blur-sm border border-slate-100 shadow-[0_4px_20px_rgba(15,23,42,0.1)] text-slate-500 hover:text-primary hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-0 disabled:pointer-events-none"
          >
            <ChevronIcon direction="right" />
          </button>
        </div>

        {/* Dot indicators */}
        <div className="flex items-center justify-center gap-2">
          {slides.map((slide, i) => (
            <button
              key={slide.id}
              onClick={() => goTo(i)}
              aria-label={`Aller à la slide ${i + 1}`}
              className={`h-2 rounded-full transition-all duration-300 ${i === activeIndex ? 'w-6 bg-primary' : 'w-2 bg-slate-200 hover:bg-slate-300'}`}
            />
          ))}
        </div>
      </div>

      {/* ══ RIGHT — Notes & AI Bento panel ═══════════════════════════════ */}
      <BentoCard padding="lg" className="max-h-[540px] overflow-y-auto flex flex-col min-w-0">
        <div className="flex items-center gap-3 mb-5 flex-shrink-0">
          <span className="text-sm font-black text-slate-300 font-mono tabular-nums">
            {String(activeIndex + 1).padStart(2, '0')}
          </span>
          <h2 className="text-lg font-extrabold text-slate-800 tracking-tight">{activeSlide.title}</h2>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeSlide.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            {/* AI Suggestion bar */}
            <AnimatePresence>
              {hasActiveSuggestion && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={SPRING}
                  className="overflow-hidden"
                >
                  <div className="mb-5 px-5 py-5 rounded-2xl border border-rose-100/70 bg-gradient-to-br from-rose-50/70 via-amber-50/20 to-white">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xl flex-shrink-0 select-none">✂️</span>
                      <span className="text-xs font-black uppercase tracking-wide text-rose-500">Suggestion IA</span>
                    </div>
                    <p className="text-sm font-semibold text-slate-600 leading-snug mb-4">
                      Point redondant détecté.{' '}
                      <span className="text-rose-600 font-bold">Supprimer</span>{' '}
                      pour gagner{' '}
                      <span className="text-emerald-600 font-black">~{activeSlide.aiSuggestion?.saveMinutes} min</span>
                      {' '}sur cette section.
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setDismissed(true)}
                        className="flex-1 text-sm font-bold text-slate-400 hover:text-slate-600 px-4 py-2.5 rounded-xl hover:bg-white/70 transition-all duration-150"
                      >
                        Ignorer
                      </button>
                      <button
                        onClick={() => onAcceptSuggestion(activeSlide.id)}
                        className="flex-1 text-sm font-black text-white bg-emerald-500 hover:bg-emerald-400 px-4 py-2.5 rounded-xl shadow-[0_2px_10px_rgba(16,185,129,0.28)] hover:-translate-y-[1px] hover:shadow-[0_4px_18px_rgba(16,185,129,0.36)] active:translate-y-0 active:scale-[0.98] transition-all duration-200"
                      >
                        ✓ Accepter
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Speaker notes */}
            {hasActiveSuggestion && highlightedParts ? (
              <div className="text-lg leading-relaxed text-slate-700 font-medium">
                {highlightedParts.before}
                <span className="bg-rose-100/80 text-rose-700 rounded-md px-1 py-0.5">{highlightedParts.hl}</span>
                {highlightedParts.after}
              </div>
            ) : (
              <textarea
                value={notesDraft}
                onChange={(e) => {
                  setNotesDraft(e.target.value)
                  onNotesChange(activeSlide.id, e.target.value)
                }}
                className="w-full min-h-[240px] resize-none text-lg leading-relaxed text-slate-700 font-medium bg-transparent border-0 focus:outline-none focus:ring-0 placeholder:text-slate-300"
                placeholder="Ajoutez vos notes de présentation…"
              />
            )}
          </motion.div>
        </AnimatePresence>
      </BentoCard>
    </div>
  )
}

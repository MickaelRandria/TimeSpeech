import React, { useState, useEffect } from 'react'
import { Reorder, useDragControls } from 'framer-motion'

// ── Props ──────────────────────────────────────────────────────────────────────

export interface GridSlideData {
  id: string
  title: string
  imageUrl: string
  notes: string
  baseMinutes: number
}

export interface SlideGridEditorProps {
  slides: GridSlideData[]
  onNotesChange: (slideId: string, notes: string) => void
  onReorder: (newSlides: GridSlideData[]) => void
}

// ── Icons ──────────────────────────────────────────────────────────────────────

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

function ClockIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <circle cx="6" cy="6" r="5" />
      <path d="M6 3.5V6l1.8 1.8" />
    </svg>
  )
}

// Matches Tailwind's `shadow-xl` token — whileDrag needs a concrete animatable value, not a class
const DRAG_SHADOW = '0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)'

// ── Grid card ──────────────────────────────────────────────────────────────────

function GridSlideCard({
  slide,
  index,
  onNotesChange,
}: {
  slide: GridSlideData
  index: number
  onNotesChange: (id: string, notes: string) => void
}) {
  const dragControls = useDragControls()

  // Local, uncontrolled-ish draft — typing must never push a fresh `slides` array
  // (and thus a new `value` reference) up into Reorder.Group on every keystroke,
  // which disrupts drag/focus tracking. Flush to the parent on blur instead.
  const [draft, setDraft] = useState(slide.notes)
  useEffect(() => setDraft(slide.notes), [slide.id])

  return (
    <Reorder.Item
      value={slide}
      as="div"
      dragListener={false}
      dragControls={dragControls}
      whileDrag={{ scale: 1.05, boxShadow: DRAG_SHADOW, zIndex: 50 }}
      className="group relative bg-white rounded-3xl shadow-sm border border-slate-100/60 overflow-hidden"
    >
      {/* Top — thumbnail */}
      <div className="relative">
        <img src={slide.imageUrl} alt={slide.title} className="w-full aspect-video object-cover" />

        {/* Drag handle — appears on hover */}
        <button
          onPointerDown={(e) => dragControls.start(e)}
          aria-label="Réorganiser cette slide"
          className="absolute top-3 left-3 w-8 h-8 rounded-full flex items-center justify-center text-white/0 group-hover:text-white bg-black/0 group-hover:bg-black/30 backdrop-blur-sm cursor-grab active:cursor-grabbing touch-none transition-all duration-200"
        >
          <DragHandleIcon />
        </button>

        {/* Duration metric — always visible */}
        <span className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/30 backdrop-blur-sm text-white text-xs font-bold">
          <ClockIcon />
          {slide.baseMinutes} min
        </span>

        {/* Order badge */}
        <span className="absolute bottom-3 left-3 text-[11px] font-black text-white/90 bg-black/30 backdrop-blur-sm rounded-full px-2.5 py-1 font-mono">
          {String(index + 1).padStart(2, '0')}
        </span>
      </div>

      {/* Bottom — inline notes editor */}
      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => onNotesChange(slide.id, draft)}
        placeholder="Ajoutez vos notes de présentation…"
        className="w-full min-h-[130px] resize-none p-5 text-sm leading-relaxed text-slate-600 font-medium bg-transparent border-0 outline-none focus:ring-2 focus:ring-indigo-100 focus:bg-indigo-50/20 rounded-b-3xl transition-all duration-200 placeholder:text-slate-300"
      />
    </Reorder.Item>
  )
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function SlideGridEditor({ slides, onNotesChange, onReorder }: SlideGridEditorProps) {
  return (
    <Reorder.Group
      as="div"
      values={slides}
      onReorder={onReorder}
      className="grid grid-cols-2 xl:grid-cols-3 gap-6"
    >
      {slides.map((slide, i) => (
        <GridSlideCard key={slide.id} slide={slide} index={i} onNotesChange={onNotesChange} />
      ))}
    </Reorder.Group>
  )
}

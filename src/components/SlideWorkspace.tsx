import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { AISuggestion } from './SlideNode'
import SlideCarousel from './SlideCarousel'
import SlideGridEditor from './SlideGridEditor'

// ── Props ──────────────────────────────────────────────────────────────────────

export interface WorkspaceSlideData {
  id: string
  title: string
  imageUrl: string
  notes: string
  baseMinutes: number
  aiSuggestion?: AISuggestion
}

export interface SlideWorkspaceProps {
  slides: WorkspaceSlideData[]
  onNotesChange: (slideId: string, notes: string) => void
  onAcceptSuggestion: (slideId: string) => void
  onReorder: (newSlides: WorkspaceSlideData[]) => void
}

type ViewMode = 'presentation' | 'edition'

const TOGGLE_SPRING = { type: 'spring' as const, stiffness: 380, damping: 34 }

// ── View toggle ──────────────────────────────────────────────────────────────

function ViewToggle({ mode, onChange }: { mode: ViewMode; onChange: (m: ViewMode) => void }) {
  return (
    <div className="relative inline-grid grid-cols-2 bg-slate-100/80 rounded-full p-1">
      <motion.div
        className="absolute inset-y-1 left-1 w-[calc(50%-4px)] bg-white rounded-full shadow-[0_2px_10px_rgba(15,23,42,0.1)]"
        animate={{ x: mode === 'edition' ? '100%' : '0%' }}
        transition={TOGGLE_SPRING}
      />
      <button
        onClick={() => onChange('presentation')}
        className={`relative z-10 px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors duration-200 ${
          mode === 'presentation' ? 'text-primary' : 'text-slate-400 hover:text-slate-600'
        }`}
      >
        Mode Présentation
      </button>
      <button
        onClick={() => onChange('edition')}
        className={`relative z-10 px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors duration-200 ${
          mode === 'edition' ? 'text-primary' : 'text-slate-400 hover:text-slate-600'
        }`}
      >
        Mode Édition
      </button>
    </div>
  )
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function SlideWorkspace({ slides, onNotesChange, onAcceptSuggestion, onReorder }: SlideWorkspaceProps) {
  const [mode, setMode] = useState<ViewMode>('presentation')

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-center">
        <ViewToggle mode={mode} onChange={setMode} />
      </div>

      <AnimatePresence mode="wait">
        {mode === 'presentation' ? (
          <motion.div
            key="presentation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <SlideCarousel slides={slides} onNotesChange={onNotesChange} onAcceptSuggestion={onAcceptSuggestion} />
          </motion.div>
        ) : (
          <motion.div
            key="edition"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <SlideGridEditor slides={slides} onNotesChange={onNotesChange} onReorder={onReorder} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

import React from 'react'
import { motion } from 'framer-motion'
import Badge from './Badge'
import Button from './Button'

type CourseStatus = 'generated' | 'missing-brief' | 'to-prepare'

interface PlanningCourseCardProps {
  title: string
  school: string
  dateLabel: string          // e.g. "Jeu 14 mars · 10h00 - 12h00"
  status: CourseStatus
  estimatedDuration?: string // e.g. "1h58"
  targetDuration?: string    // e.g. "2h00"
  isSelected?: boolean
  onClick?: () => void
  onPrimaryAction?: () => void
  primaryActionLabel?: string
}

const STATUS_CONFIG: Record<CourseStatus, { label: string; variant: 'success' | 'warning' | 'neutral' }> = {
  generated: { label: 'Cours généré', variant: 'success' },
  'missing-brief': { label: 'Brief manquant', variant: 'warning' },
  'to-prepare': { label: 'À préparer', variant: 'neutral' },
}

function CalendarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 shrink-0">
      <rect x="3" y="4" width="14" height="13" rx="2"/>
      <path d="M3 8h14M7 2v4M13 2v4"/>
    </svg>
  )
}

export default function PlanningCourseCard({
  title, school, dateLabel, status, estimatedDuration, targetDuration,
  isSelected = false, onClick, onPrimaryAction, primaryActionLabel,
}: PlanningCourseCardProps) {
  const config = STATUS_CONFIG[status]
  return (
    <motion.div
      onClick={onClick}
      whileHover={onClick ? { scale: 1.01 } : undefined}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      className={[
        'bg-white rounded-3xl p-6 cursor-pointer transition-all duration-300 ease-out border',
        isSelected
          ? 'bg-indigo-50/60 border-primary/10 shadow-[0_15px_40px_rgba(79,70,229,0.08)]'
          : 'bg-white border-transparent shadow-[0_8px_30px_rgba(15,23,42,0.03)] hover:shadow-[0_15px_40px_rgba(15,23,42,0.06)]',
      ].join(' ')}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-extrabold text-ink truncate tracking-tight">{title}</h3>
          <p className="text-xs text-slate-500 mt-0.5 font-semibold">{school}</p>
        </div>
        <Badge label={config.label} variant={config.variant} className="ml-3 flex-shrink-0" />
      </div>
      <div className="flex items-center gap-2 text-xs text-slate-400 mb-3 font-semibold">
        <CalendarIcon />
        <span>{dateLabel}</span>
      </div>
      {estimatedDuration && targetDuration && (
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-400 font-semibold">Objectif :</span>
            <span className="text-xs font-extrabold text-ink">{targetDuration}</span>
          </div>
          <span className="text-slate-200">·</span>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-400 font-semibold">Estimation :</span>
            <span className="text-xs font-extrabold text-primary">{estimatedDuration}</span>
          </div>
        </div>
      )}
      {primaryActionLabel && onPrimaryAction && (
        <div onClick={e => e.stopPropagation()}>
          <Button
            variant={isSelected ? 'primary' : 'secondary'}
            size="sm"
            onClick={onPrimaryAction}
          >
            {primaryActionLabel}
          </Button>
        </div>
      )}
    </motion.div>
  )
}

import React from 'react'
import { motion } from 'framer-motion'

interface WeekDay {
  dayLabel: string    // e.g. "Lun", "Mar"
  dayNumber: number   // e.g. 11, 12
  date: string        // ISO or comparable string, e.g. "2026-03-11"
  isToday?: boolean
}

interface WeekSelectorProps {
  days: WeekDay[]
  selectedDate: string
  onSelectDate: (date: string) => void
  className?: string
}

export default function WeekSelector({ days, selectedDate, onSelectDate, className = '' }: WeekSelectorProps) {
  return (
    <div className={`flex items-center gap-2 overflow-x-auto py-1 ${className}`}>
      {days.map(day => {
        const isSelected = day.date === selectedDate
        return (
          <motion.button
            key={day.date}
            onClick={() => onSelectDate(day.date)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={[
              'flex flex-col items-center justify-center w-12 h-16 rounded-full transition-all duration-300 ease-out',
              isSelected
                ? 'bg-primary text-white shadow-lg shadow-primary/25'
                : 'bg-white text-slate-600 border border-slate-100/80 shadow-[0_4px_12px_rgba(15,23,42,0.02)] hover:bg-slate-50',
            ].join(' ')}
          >
            <span className={`text-[9px] font-bold uppercase tracking-wider ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
              {day.dayLabel}
            </span>
            <span className={`text-sm font-extrabold leading-tight mt-0.5 ${isSelected ? 'text-white' : 'text-ink'}`}>
              {day.dayNumber}
            </span>
            {day.isToday && !isSelected && (
              <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1 shadow-sm" />
            )}
          </motion.button>
        )
      })}
    </div>
  )
}

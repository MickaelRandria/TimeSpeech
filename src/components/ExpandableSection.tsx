import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface ExpandableSectionProps {
  label: string
  children: React.ReactNode
  defaultExpanded?: boolean
  className?: string
}

function ChevronRightIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={`w-3 h-3 transition-transform duration-300 ease-out ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  )
}

export default function ExpandableSection({ label, children, defaultExpanded = false, className = '' }: ExpandableSectionProps) {
  const [expanded, setExpanded] = useState(defaultExpanded)
  return (
    <div className={className}>
      <button
        onClick={() => setExpanded(e => !e)}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors duration-300 font-semibold py-2"
      >
        <ChevronRightIcon className={expanded ? 'rotate-90' : ''} />
        {label}
      </button>
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 150, damping: 20 }}
            className="overflow-hidden mt-4"
          >
            <div className="space-y-4 pb-2">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

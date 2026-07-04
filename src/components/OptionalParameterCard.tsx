import React from 'react'

interface OptionalParameterCardProps {
  label: string              // e.g. "Objectif pédagogique"
  detectedLabel?: string     // e.g. "Détecté automatiquement"
  options: string[]
  selected: string
  onSelect: (value: string) => void
  className?: string
}

export default function OptionalParameterCard({
  label, detectedLabel, options, selected, onSelect, className = '',
}: OptionalParameterCardProps) {
  return (
    <div className={`bg-white rounded-card border border-slate-100/90 shadow-card p-5 ${className}`}>
      <div className="flex items-center justify-between mb-1.5">
        <p className="text-sm font-bold text-ink tracking-tight">{label}</p>
        {detectedLabel && (
          <span className="text-[10px] text-slate-400 font-semibold">{detectedLabel}</span>
        )}
      </div>
      <div className="flex flex-wrap gap-2 mt-3.5">
        {options.map(option => (
          <button
            key={option}
            onClick={() => onSelect(option)}
            className={[
              'rounded-pill px-4 py-1.5 text-xs font-semibold tracking-wide transition-all duration-300 ease-out hover:-translate-y-[0.5px]',
              selected === option
                ? 'bg-primary text-white shadow-sm'
                : 'bg-slate-100/70 text-slate-600 hover:bg-slate-200/70',
            ].join(' ')}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  )
}

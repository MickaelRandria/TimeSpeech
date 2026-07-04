import React from 'react'

interface SectionHeaderProps {
  eyebrow?: string
  title: string
  subtitle?: string
  className?: string
  action?: React.ReactNode
}

export default function SectionHeader({ eyebrow, title, subtitle, className = '', action }: SectionHeaderProps) {
  return (
    <div className={`flex items-start justify-between mb-8 ${className}`}>
      <div>
        {eyebrow && (
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
            {eyebrow}
          </p>
        )}
        <h1 className="text-2xl font-extrabold text-ink leading-tight tracking-tight">{title}</h1>
        {subtitle && (
          <p className="text-sm text-slate-500 mt-2 max-w-xl leading-relaxed font-medium">{subtitle}</p>
        )}
      </div>
      {action && <div className="flex-shrink-0 ml-6">{action}</div>}
    </div>
  )
}

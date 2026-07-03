import React from 'react'
import Badge from './Badge'

type BadgeVariant = 'neutral' | 'primary' | 'success' | 'warning'

interface StatCardProps {
  eyebrow?: string
  icon?: React.ReactNode
  iconBg?: string
  badge?: { label: string; variant?: BadgeVariant }
  value: string
  supporting?: string
  action?: { label: string; onClick?: () => void }
  filled?: boolean
  className?: string
  onClick?: () => void
}

export default function StatCard({
  eyebrow,
  icon,
  iconBg = 'bg-primary/10',
  badge,
  value,
  supporting,
  action,
  filled = false,
  className = '',
  onClick,
}: StatCardProps) {
  const base = filled
    ? 'bg-gradient-to-br from-primary via-blue-600 to-indigo-600 text-white rounded-card p-6 flex flex-col gap-2 shadow-md shadow-primary/10 border border-primary/20'
    : 'bg-white text-ink rounded-card p-6 flex flex-col gap-2 shadow-card border border-slate-100/90'

  const eyebrowClass = filled
    ? 'text-blue-100 text-[10px] font-bold uppercase tracking-widest'
    : 'text-slate-400 text-[10px] font-bold uppercase tracking-widest'
  const valueClass = filled ? 'text-3xl font-extrabold text-white tracking-tight' : 'text-3xl font-extrabold text-ink tracking-tight'
  const supportingClass = filled ? 'text-blue-100/80 text-xs font-medium' : 'text-slate-400 text-xs font-medium'
  const actionClass = filled
    ? 'text-blue-100 hover:text-white text-xs font-semibold mt-auto pt-2 text-left transition-colors duration-300'
    : 'text-primary hover:text-primary-hover text-xs font-semibold mt-auto pt-2 text-left transition-colors duration-300'
  const iconBgFilled = filled ? 'bg-white/15' : iconBg

  return (
    <div
      className={`${base} ${onClick ? 'cursor-pointer hover:shadow-md hover:-translate-y-[2px] transition-all duration-300 ease-out' : 'transition-all duration-300 ease-out'} ${className}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {icon && (
            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${iconBgFilled}`}>
              <span className={filled ? 'text-white' : 'text-primary'}>{icon}</span>
            </div>
          )}
          {eyebrow && <p className={eyebrowClass}>{eyebrow}</p>}
        </div>
        {badge && <Badge label={badge.label} variant={filled ? 'neutral' : badge.variant} />}
      </div>
      <p className={valueClass}>{value}</p>
      {supporting && <p className={supportingClass}>{supporting}</p>}
      {action && (
        <button
          onClick={e => { e.stopPropagation(); action.onClick?.() }}
          className={actionClass}
        >
          {action.label} →
        </button>
      )}
    </div>
  )
}

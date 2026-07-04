import React from 'react'
import Badge from './Badge'

interface ChoiceCardProps {
  title: string
  description: string
  icon?: React.ReactNode
  iconBg?: string
  onClick?: () => void
  active?: boolean
  disabled?: boolean
  recommended?: boolean
}

export default function ChoiceCard({
  title,
  description,
  icon,
  iconBg = 'bg-primary/10',
  onClick,
  active = false,
  disabled = false,
  recommended = false,
}: ChoiceCardProps) {
  return (
    <div
      onClick={disabled ? undefined : onClick}
      className={[
        'bg-white rounded-card border p-6 transition-all duration-300 ease-out relative',
        disabled ? 'opacity-40 cursor-not-allowed border-slate-100' : 'cursor-pointer hover:shadow-md hover:border-primary/30 hover:-translate-y-[2px]',
        active ? 'border-primary shadow-md ring-4 ring-primary/5' : 'border-slate-100/90 shadow-card',
      ].join(' ')}
    >
      {recommended && (
        <div className="absolute top-4 right-4">
          <Badge label="Recommandé" variant="success" />
        </div>
      )}
      {icon && (
        <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-4 transition-transform duration-300 ${active ? 'bg-primary/15 scale-105' : iconBg}`}>
          <span className={active ? 'text-primary' : 'text-slate-500'}>{icon}</span>
        </div>
      )}
      <p className={`text-base font-semibold mb-1.5 transition-colors duration-300 ${active ? 'text-primary' : 'text-ink'}`}>{title}</p>
      <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
    </div>
  )
}

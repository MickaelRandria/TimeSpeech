import React from 'react'

type BadgeVariant = 'neutral' | 'primary' | 'success' | 'warning'

interface BadgeProps {
  label: string
  variant?: BadgeVariant
  className?: string
}

const variantClasses: Record<BadgeVariant, string> = {
  neutral: 'bg-slate-100 text-slate-600 border border-slate-200/60',
  primary: 'bg-blue-50/60 text-primary border border-primary/10',
  success: 'bg-emerald-50/60 text-emerald-700 border border-emerald-100/60',
  warning: 'bg-orange-50 text-orange-600 border border-orange-100',
}

export default function Badge({ label, variant = 'neutral', className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wide uppercase ${variantClasses[variant]} ${className}`}>
      {label}
    </span>
  )
}

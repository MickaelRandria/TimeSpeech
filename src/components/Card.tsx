import React from 'react'

interface CardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  hoverable?: boolean
  active?: boolean
  padding?: string
  accent?: boolean
  variant?: 'default' | 'ghost'
}

export default function Card({
  children,
  className = '',
  onClick,
  hoverable = false,
  active = false,
  padding = 'p-6',
  accent = false,
  variant = 'default',
}: CardProps) {
  const base = variant === 'ghost'
    ? `bg-white rounded-card border border-slate-100/90 ${padding}`
    : `bg-white rounded-card shadow-card border border-slate-100/90 ${padding}`
  const hover = hoverable ? 'hover:shadow-md hover:border-primary/30 hover:-translate-y-[2px] cursor-pointer transition-all duration-300 ease-out' : 'transition-all duration-300 ease-out'
  const activeStyle = active ? 'border-primary/40 ring-4 ring-primary/5' : ''
  const accentStyle = accent ? 'border-l-4 border-l-primary' : ''

  return (
    <div className={`${base} ${hover} ${activeStyle} ${accentStyle} ${className}`} onClick={onClick}>
      {children}
    </div>
  )
}

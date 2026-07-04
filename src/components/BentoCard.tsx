import React from 'react'

interface BentoCardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  padding?: 'sm' | 'md' | 'lg'
  onClick?: () => void
}

const PADDING = { sm: 'p-4', md: 'p-6', lg: 'p-8' }

export default function BentoCard({ children, className = '', hover = false, padding = 'md', onClick }: BentoCardProps) {
  return (
    <div
      onClick={onClick}
      className={[
        'bg-white rounded-bento shadow-bento border border-slate-100/60',
        hover ? 'cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(0,0,0,0.07)]' : '',
        onClick ? 'cursor-pointer' : '',
        PADDING[padding],
        className,
      ].filter(Boolean).join(' ')}
    >
      {children}
    </div>
  )
}

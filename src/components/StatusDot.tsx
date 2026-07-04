import React from 'react'

type DotStatus = 'fits' | 'over' | 'neutral'

interface StatusDotProps {
  status: DotStatus
  className?: string
}

const STATUS_CLASSES: Record<DotStatus, string> = {
  fits:    'bg-emerald-400',
  over:    'bg-amber-400',
  neutral: 'bg-gray-300',
}

export default function StatusDot({ status, className = '' }: StatusDotProps) {
  return (
    <span
      className={`inline-block w-2 h-2 rounded-full flex-shrink-0 transition-colors duration-500 ${STATUS_CLASSES[status]} ${className}`}
    />
  )
}

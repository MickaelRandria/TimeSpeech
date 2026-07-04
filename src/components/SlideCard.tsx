import React from 'react'

type SlideStatus = 'fits' | 'over' | 'neutral'

interface SlideCardProps {
  title: string
  subtitle?: string
  status?: SlideStatus
  index?: number
}

const BORDER_COLORS: Record<SlideStatus, string> = {
  fits:    'border-l-emerald-400',
  over:    'border-l-amber-400',
  neutral: 'border-l-gray-200',
}

export default function SlideCard({ title, subtitle, status = 'neutral', index }: SlideCardProps) {
  return (
    <div
      className={`bg-white border border-gray-100 border-l-4 ${BORDER_COLORS[status]} rounded-lg overflow-hidden shadow-sm transition-all duration-500`}
      style={{ aspectRatio: '16/9' }}
    >
      <div className="flex flex-col justify-between h-full p-2.5">
        {/* Header area */}
        <div>
          {index !== undefined && (
            <span className="text-[8px] font-bold text-gray-300 font-mono block mb-1">
              {String(index).padStart(2, '0')}
            </span>
          )}
          <p className="text-[9px] font-bold text-gray-700 leading-tight line-clamp-2">{title}</p>
          {subtitle && (
            <p className="text-[8px] text-gray-400 mt-0.5 leading-tight">{subtitle}</p>
          )}
        </div>
        {/* Placeholder lines */}
        <div className="space-y-1 mt-auto">
          <div className="h-1 bg-gray-100 rounded-full w-full" />
          <div className="h-1 bg-gray-100 rounded-full w-3/4" />
          <div className="h-1 bg-gray-100 rounded-full w-1/2" />
        </div>
      </div>
    </div>
  )
}

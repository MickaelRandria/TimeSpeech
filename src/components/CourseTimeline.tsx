import React from 'react'

interface TimelineSection {
  title: string
  minutes: number
  shortTitle?: string
}

interface CourseTimelineProps {
  sections: TimelineSection[]
  totalMinutes?: number
  isCalibrated?: boolean
  className?: string
}

const SEGMENT_COLORS = [
  'bg-indigo-600',
  'bg-blue-500',
  'bg-indigo-400',
  'bg-blue-400',
  'bg-indigo-300',
]

export default function CourseTimeline({
  sections,
  totalMinutes,
  isCalibrated = false,
  className = '',
}: CourseTimelineProps) {
  const total = totalMinutes ?? sections.reduce((sum, s) => sum + s.minutes, 0)

  return (
    <div className={`bg-white rounded-card shadow-card border border-slate-100/90 p-6 ${className}`}>
      {/* Eyebrow */}
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">
        {isCalibrated ? 'Plan recalibré selon votre débit' : 'Plan minuté généré'}
      </p>

      {/* Timeline bar */}
      <div className="flex h-8 gap-0.5 rounded-full overflow-hidden mb-4 bg-slate-50 p-0.5 border border-slate-100">
        {sections.map((section, i) => {
          const widthPct = (section.minutes / total) * 100
          return (
            <div
              key={section.title}
              className={`${SEGMENT_COLORS[i % SEGMENT_COLORS.length]} rounded-full flex items-center justify-center transition-all duration-500`}
              style={{ width: `${widthPct}%` }}
              title={`${section.title} · ${section.minutes} min`}
            />
          )
        })}
      </div>

      {/* Labels */}
      <div className="flex gap-px">
        {sections.map((section, i) => {
          const widthPct = (section.minutes / total) * 100
          return (
            <div
              key={section.title}
              className="text-center flex-shrink-0"
              style={{ width: `${widthPct}%` }}
            >
              <p className="text-[10px] text-slate-500 truncate px-1 leading-tight font-medium">
                {section.shortTitle ?? section.title.split(' ').slice(0, 2).join(' ')}
              </p>
              <p className="text-[10px] font-bold text-primary mt-0.5">{section.minutes} min</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

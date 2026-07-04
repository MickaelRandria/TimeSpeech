import React from 'react'

interface InfoRowProps {
  label: string
  value: React.ReactNode
  last?: boolean
  className?: string
}

export default function InfoRow({ label, value, last = false, className = '' }: InfoRowProps) {
  return (
    <div className={`flex items-center justify-between py-3.5 ${last ? '' : 'border-b border-slate-100/70'} ${className}`}>
      <span className="text-sm text-slate-400 font-semibold">{label}</span>
      <span className="text-sm font-semibold text-ink text-right max-w-[60%]">{value}</span>
    </div>
  )
}

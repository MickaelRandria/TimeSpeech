import React from 'react'

interface AnswerPillProps {
  label: string
  selected?: boolean
  disabled?: boolean
  onClick?: () => void
}

export default function AnswerPill({ label, selected = false, disabled = false, onClick }: AnswerPillProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={[
        'px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border',
        selected
          ? 'bg-primary text-white border-primary shadow-glow scale-[1.02]'
          : disabled
          ? 'bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed'
          : 'bg-white border-slate-200 text-slate-600 hover:border-primary/40 hover:text-primary hover:bg-primary/5 cursor-pointer',
      ].join(' ')}
    >
      {label}
    </button>
  )
}

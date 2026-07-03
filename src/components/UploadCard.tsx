import React from 'react'

interface UploadCardProps {
  title: string
  subtitle: string
  icon?: React.ReactNode
  onClick?: () => void
}

export default function UploadCard({ title, subtitle, icon, onClick }: UploadCardProps) {
  return (
    <div
      onClick={onClick}
      className="border-2 border-dashed border-slate-200 rounded-card p-10 text-center hover:border-primary/50 hover:bg-primary/[0.02] hover:shadow-md hover:-translate-y-[2px] cursor-pointer transition-all duration-300 ease-out bg-white flex flex-col items-center justify-center gap-3 min-h-[220px]"
    >
      {icon && (
        <div className="w-14 h-14 bg-slate-50 rounded-xl flex items-center justify-center text-primary/40 mb-1 transition-colors duration-300">
          {icon}
        </div>
      )}
      <p className="text-sm font-semibold text-ink">{title}</p>
      <p className="text-xs text-slate-400">{subtitle}</p>
      <div className="flex items-center gap-1.5 mt-2">
        {['PDF', 'DOCX', 'TXT'].map(fmt => (
          <span key={fmt} className="text-[10px] font-semibold text-slate-500 bg-slate-100/80 rounded-pill px-2.5 py-0.5">
            {fmt}
          </span>
        ))}
      </div>
    </div>
  )
}

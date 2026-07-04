import React from 'react'

interface ChatMessageProps {
  text: string
  children?: React.ReactNode
}

export default function ChatMessage({ text, children }: ChatMessageProps) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-9 h-9 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
        <span className="text-primary font-black text-sm">T</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold text-primary/60 mb-1.5 uppercase tracking-widest">
          TimeSpeech · IA
        </p>
        <div className="bg-slate-50/80 border border-slate-100 rounded-2xl rounded-tl-sm px-4 py-3.5">
          <p className="text-sm text-ink leading-relaxed">{text}</p>
          {children}
        </div>
      </div>
    </div>
  )
}

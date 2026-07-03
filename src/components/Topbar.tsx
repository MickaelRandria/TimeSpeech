import React from 'react'
import Button from './Button'

interface TopbarProps {
  stepLabel?: string
  onConnexion?: () => void
  showDemoStatus?: boolean
  stepProgress?: string
  isLoggedIn?: boolean
  userInitials?: string
  userName?: string
}

export default function Topbar({ stepLabel, onConnexion, showDemoStatus, stepProgress, isLoggedIn, userInitials, userName }: TopbarProps) {
  return (
    <header className="h-14 px-6 flex items-center justify-between border-b border-slate-100/80 bg-white/90 backdrop-blur-md sticky top-0 z-40 flex-shrink-0">
      <div className="flex items-center gap-3">
        <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary to-violet-500 text-lg tracking-tight">
          TimeSpeech
        </span>
        {stepLabel && (
          <span className="text-[11px] text-slate-600 font-semibold border border-slate-200/60 rounded-pill px-2.5 py-0.5 bg-slate-50/80">
            {stepLabel}
          </span>
        )}
        {showDemoStatus && (
          <span className="text-[11px] text-emerald-700 font-semibold border border-emerald-100/60 rounded-pill px-2.5 py-0.5 bg-emerald-50/80">
            Démo gratuite
          </span>
        )}
      </div>
      <div className="flex items-center gap-4">
        {stepProgress && (
          <span className="text-xs text-slate-400 font-semibold tracking-wide">{stepProgress}</span>
        )}
        {isLoggedIn ? (
          <div className="flex items-center gap-2 border border-slate-200/60 rounded-full pl-1 pr-3 py-1 bg-white/60">
            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-black flex-shrink-0">
              {userInitials ?? 'JB'}
            </div>
            <span className="text-xs font-semibold text-slate-700">{userName ?? 'Julien'}</span>
          </div>
        ) : (
          <Button variant="secondary" size="sm" onClick={onConnexion}>Connexion</Button>
        )}
      </div>
    </header>
  )
}

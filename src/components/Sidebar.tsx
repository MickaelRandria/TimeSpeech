import React from 'react'

interface SidebarItem {
  id: string
  label: string
  icon: React.ReactNode
  completed?: boolean
}

interface SidebarProps {
  items: SidebarItem[]
  activeId: string
  onNavigate?: (id: string) => void
}

function HouseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 10.5L10 3l7 7.5M5 9v8h4v-5h2v5h4V9"/>
    </svg>
  )
}
function CalendarIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="14" height="13" rx="2"/>
      <path d="M3 8h14M7 2v4M13 2v4"/>
    </svg>
  )
}
function DocIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="12" height="16" rx="2"/>
      <path d="M7 7h6M7 10h6M7 13h4"/>
    </svg>
  )
}
function SparkleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
      <path d="M10 2l1.5 4.5L16 8l-4.5 1.5L10 14l-1.5-4.5L4 8l4.5-1.5L10 2z"/>
    </svg>
  )
}
function BookIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h5a2 2 0 012 2v10a2 2 0 00-2-2H4V4z"/>
      <path d="M16 4h-5a2 2 0 00-2 2v10a2 2 0 012-2h5V4z"/>
    </svg>
  )
}
function PersonIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10" cy="7" r="3"/>
      <path d="M4 18c0-3.3 2.7-6 6-6s6 2.7 6 6"/>
    </svg>
  )
}

export const DEFAULT_SIDEBAR_ITEMS: SidebarItem[] = [
  { id: 'accueil',  label: 'Accueil',  icon: <HouseIcon /> },
  { id: 'planning', label: 'Planning', icon: <CalendarIcon /> },
  { id: 'brief',    label: 'Brief',    icon: <DocIcon /> },
  { id: 'ia',       label: 'IA',       icon: <SparkleIcon /> },
  { id: 'cours',    label: 'Cours',    icon: <BookIcon /> },
  { id: 'profil',   label: 'Profil',   icon: <PersonIcon /> },
]

export default function Sidebar({ items, activeId, onNavigate }: SidebarProps) {
  return (
    <nav className="w-20 flex flex-col items-center py-6 gap-2 bg-white rounded-3xl flex-shrink-0 shadow-md shadow-slate-100/60 border border-slate-100/80">
      {/* Logomark */}
      <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center mb-6 flex-shrink-0 shadow-sm shadow-primary/10">
        <span className="text-white font-extrabold text-sm tracking-tighter">T</span>
      </div>
      {items.map(item => (
        <div key={item.id} className="relative w-full flex justify-center px-2">
          {item.id === activeId && (
            <div className="absolute left-0 top-3 bottom-3 w-[3px] bg-primary rounded-r-full" />
          )}
          <button
            onClick={() => onNavigate?.(item.id)}
            className={[
              'relative w-14 h-14 flex flex-col items-center justify-center gap-1 rounded-2xl transition-all duration-300 ease-out',
              item.id === activeId
                ? 'text-primary bg-primary/5 shadow-sm shadow-primary/5 font-semibold scale-105'
                : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50',
            ].join(' ')}
            title={item.label}
          >
            <div className={`transition-transform duration-300 ${item.id === activeId ? 'scale-110' : ''}`}>
              {item.icon}
            </div>
            <span className={`text-[8px] font-bold leading-none mt-0.5 tracking-wide ${item.id === activeId ? 'text-primary' : 'text-slate-400'}`}>
              {item.label}
            </span>
            {item.completed && (
              <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-emerald-500 ring-2 ring-white shadow-sm" />
            )}
          </button>
        </div>
      ))}
    </nav>
  )
}

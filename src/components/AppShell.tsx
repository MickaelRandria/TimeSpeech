import React from 'react'
import Sidebar, { DEFAULT_SIDEBAR_ITEMS } from './Sidebar'
import Topbar from './Topbar'
import { useCompletedSidebarItems } from '../contexts/SidebarContext'

interface AppShellProps {
  children: React.ReactNode
  stepLabel?: string
  activeSidebarItem?: string
  onConnexion?: () => void
  onSidebarNavigate?: (id: string) => void
  completedSidebarItems?: string[]
  showDemoStatus?: boolean
  stepProgress?: string
  isLoggedIn?: boolean
  userInitials?: string
  userName?: string
}

export default function AppShell({
  children,
  stepLabel,
  activeSidebarItem = 'accueil',
  onConnexion,
  onSidebarNavigate,
  completedSidebarItems,
  showDemoStatus,
  stepProgress,
  isLoggedIn,
  userInitials,
  userName,
}: AppShellProps) {
  const contextCompleted = useCompletedSidebarItems()
  const resolved = completedSidebarItems ?? contextCompleted

  const mergedItems = DEFAULT_SIDEBAR_ITEMS.map(item => ({
    ...item,
    completed: resolved.includes(item.id),
  }))

  return (
    <div className="h-screen bg-slate-50 flex overflow-hidden p-4 gap-4">
      <Sidebar
        items={mergedItems}
        activeId={activeSidebarItem}
        onNavigate={onSidebarNavigate}
      />
      <div className="flex flex-col flex-1 bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-slate-100/50 overflow-hidden">
        <Topbar
          stepLabel={stepLabel}
          onConnexion={onConnexion}
          showDemoStatus={showDemoStatus}
          stepProgress={stepProgress}
          isLoggedIn={isLoggedIn}
          userInitials={userInitials}
          userName={userName}
        />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 bg-slate-50/40">
          {children}
        </main>
      </div>
    </div>
  )
}

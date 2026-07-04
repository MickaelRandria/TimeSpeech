import React, { createContext, useContext } from 'react'

interface SidebarContextValue {
  completedSidebarItems: string[]
  onNavigate?: (id: string) => void
}

const SidebarContext = createContext<SidebarContextValue>({ completedSidebarItems: [] })

export function SidebarProvider({
  completedSidebarItems,
  onNavigate,
  children,
}: {
  completedSidebarItems: string[]
  onNavigate?: (id: string) => void
  children: React.ReactNode
}) {
  return (
    <SidebarContext.Provider value={{ completedSidebarItems, onNavigate }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function useCompletedSidebarItems() {
  return useContext(SidebarContext).completedSidebarItems
}

export function useSidebarNavigate() {
  return useContext(SidebarContext).onNavigate
}

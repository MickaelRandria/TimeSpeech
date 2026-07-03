import React, { createContext, useContext } from 'react'

interface SidebarContextValue {
  completedSidebarItems: string[]
}

const SidebarContext = createContext<SidebarContextValue>({ completedSidebarItems: [] })

export function SidebarProvider({ completedSidebarItems, children }: { completedSidebarItems: string[]; children: React.ReactNode }) {
  return (
    <SidebarContext.Provider value={{ completedSidebarItems }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function useCompletedSidebarItems() {
  return useContext(SidebarContext).completedSidebarItems
}

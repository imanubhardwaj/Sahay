"use client";

import { createContext, useContext, ReactNode } from "react";

interface LayoutContextType {
  sidebarCollapsed: boolean;
  isSidebarExpanded: boolean;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export function LayoutProvider({
  children,
  value,
}: {
  children: ReactNode;
  value: LayoutContextType;
}) {
  return (
    <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>
  );
}

export function useLayout() {
  const context = useContext(LayoutContext);
  return context;
}

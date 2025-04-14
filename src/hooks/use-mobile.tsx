
import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}

// Create the MobileContext
interface MobileContextType {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

const MobileContext = React.createContext<MobileContextType>({
  isSidebarOpen: true,
  toggleSidebar: () => {},
});

export function MobileProvider({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
  
  const toggleSidebar = React.useCallback(() => {
    setIsSidebarOpen(prev => !prev);
  }, []);
  
  return (
    <MobileContext.Provider value={{ isSidebarOpen, toggleSidebar }}>
      {children}
    </MobileContext.Provider>
  );
}

export function useMobileContext() {
  const context = React.useContext(MobileContext);
  if (context === undefined) {
    throw new Error('useMobileContext must be used within a MobileProvider');
  }
  return context;
}

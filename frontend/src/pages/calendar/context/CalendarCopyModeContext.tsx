import {
  useMemo,
  useContext,
  createContext,
  useState,
  useCallback,
} from 'react';

interface CalendarCopyModeContextType {
  /**
   * Context type describing all values and actions for calendar copy mode
   * @property {boolean} copyModeActive - Whether copy mode is active
   * @property {() => void} toggleCopyMode - Toggle copy mode on/off
   * @property {() => void} activateCopyMode - Activate copy mode
   * @property {() => void} deactivateCopyMode - Deactivate copy mode
   * @property {(active: boolean) => void} setCopyModeActive - Set copy mode to a specific value
   */
  copyModeActive: boolean;
  toggleCopyMode: () => void;
  activateCopyMode: () => void;
  deactivateCopyMode: () => void;
  setCopyModeActive: (active: boolean) => void;
}

export const CalendarCopyModeContext =
  /**
   * Main context for managing calendar copy mode state and actions
   */
  createContext<CalendarCopyModeContextType | null>(null);

/**
 * Set display name for better debugging experience
 */
CalendarCopyModeContext.displayName = 'CalendarCopyModeContext';
/**
 * Custom hook to access the CalendarCopyModeContext
 * @returns {CalendarCopyModeContextType} The context value
 * @throws Error if used outside of provider
 */

export const useCalendarCopyModeContext = () => {
  const context = useContext(CalendarCopyModeContext);

  if (!context) {
    throw new Error(
      'useCalendarCopyModeContext must be used within a CalendarCopyModeContextProvider',
    );
  }

  return context;
};

/**
 * Props for the CalendarCopyModeContextProvider component
 */
interface CalendarCopyModeContextProviderProps {
  /**
   * Props for the context provider, expects React children
   * @property {React.ReactNode} children - Child components to receive context
   */
  children: React.ReactNode;
}

export const CalendarCopyModeContextProvider = ({
  /**
   * Provider component to supply calendar copy mode state and actions to descendants
   * @param {CalendarCopyModeContextProviderProps} props
   * @returns {JSX.Element}
   */
  children,
}: CalendarCopyModeContextProviderProps) => {
  const [copyModeActive, setCopyModeActive] = useState<boolean>(false);

  const toggleCopyMode = useCallback(() => {
    setCopyModeActive((prev) => !prev);
  }, []);

  const activateCopyMode = useCallback(() => {
    setCopyModeActive(true);
  }, []);

  const deactivateCopyMode = useCallback(() => {
    setCopyModeActive(false);
  }, []);

  const setCopyModeActiveCallback = useCallback((active: boolean) => {
    setCopyModeActive(active);
  }, []);

  const contextValue = useMemo(
    () => ({
      copyModeActive,
      toggleCopyMode,
      activateCopyMode,
      deactivateCopyMode,
      setCopyModeActive: setCopyModeActiveCallback,
    }),
    [
      copyModeActive,
      toggleCopyMode,
      activateCopyMode,
      deactivateCopyMode,
      setCopyModeActiveCallback,
    ],
  );

  return (
    <CalendarCopyModeContext.Provider value={contextValue}>
      {children}
    </CalendarCopyModeContext.Provider>
  );
};

import {
  useState,
  useMemo,
  useCallback,
  useContext,
  createContext,
  type ReactNode,
  type MouseEvent,
} from 'react';

// Define types for better type safety and reusability
interface PopoverContextValue {
  anchorEl: HTMLButtonElement | null;
  setAnchorEl: (el: HTMLButtonElement | null) => void;
  handleClose: () => void;
  toggleOpen: (event: MouseEvent<HTMLButtonElement>) => void;
  isOpen: boolean;
}

interface PopoverContextProviderProps {
  children: ReactNode;
}

// Create context with better error handling
export const OnboardingChecklistProgressPopoverContext = createContext<
  PopoverContextValue | undefined
>(undefined);

// Custom hook with better error handling
export const useOnboardingChecklistProgressPopoverContext =
  (): PopoverContextValue => {
    const context = useContext(OnboardingChecklistProgressPopoverContext);

    if (!context) {
      throw new Error(
        'useOnboardingChecklistProgressPopoverContext must be used within OnboardingChecklistProgressPopoverContextProvider',
      );
    }

    return context;
  };

export const OnboardingChecklistProgressPopoverContextProvider = ({
  children,
}: PopoverContextProviderProps) => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  // Memoize the close handler to prevent unnecessary re-renders
  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  // Memoize the toggle handler to prevent unnecessary re-renders
  const toggleOpen = useCallback((event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl((prevAnchorEl) => (prevAnchorEl ? null : event.currentTarget));
  }, []);

  // Derive isOpen from anchorEl to avoid state duplication
  const isOpen = Boolean(anchorEl);

  // Memoize context value with all dependencies
  const contextValue = useMemo(
    () => ({
      anchorEl,
      setAnchorEl,
      handleClose,
      toggleOpen,
      isOpen,
    }),
    [anchorEl, handleClose, toggleOpen, isOpen],
  );

  return (
    <OnboardingChecklistProgressPopoverContext.Provider value={contextValue}>
      {children}
    </OnboardingChecklistProgressPopoverContext.Provider>
  );
};

// Set display name for better debugging
OnboardingChecklistProgressPopoverContextProvider.displayName =
  'OnboardingChecklistProgressPopoverContextProvider';

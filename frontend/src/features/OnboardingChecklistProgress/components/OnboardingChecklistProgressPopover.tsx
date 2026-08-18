import { useState, useEffect, useCallback } from 'react';
import { Box, Popover } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';
import { useOnboardingChecklistProgressPopoverContext } from '../context/OnboardingChecklistProgressPopoverContext';

// Constants for better maintainability
const POPOVER_ID = 'onboarding-checklist-popover';
const DEFAULT_KEEP_ALIVE_TIMEOUT = 10000; // 10 seconds

// Define props interface for better type safety
interface OnboardingChecklistProgressPopoverProps {
  children?: React.ReactNode;
  activatorButton?: React.ReactNode;
  keepAliveTimeout?: number;
}

// Memoized styles to prevent recreation on every render
const popoverPaperStyles: SxProps<Theme> = {
  pl: 0.5,
  minHeight: '300px',
  display: 'flex',
  flexDirection: 'column',
  zIndex: 1000,
  overflow: 'unset',
  backgroundColor: 'transparent',
};

const contentBoxStyles: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  backgroundColor: 'white',
  width: '900px',
  flexGrow: 1,
  boxShadow:
    '0px 3px 5px -1px rgba(32,32,32,0.2),0px 6px 10px 0px rgba(32,32,32,0.14),0px 1px 18px 0px rgba(32,32,32,0.12) !important',
  border: '1px solid rgb(190, 190, 190)',
  borderRadius: '10px',
  overflowY: 'auto',
};

const OnboardingChecklistProgressPopover = ({
  children,
  activatorButton,
  keepAliveTimeout = DEFAULT_KEEP_ALIVE_TIMEOUT,
}: OnboardingChecklistProgressPopoverProps) => {
  const { anchorEl, handleClose } =
    useOnboardingChecklistProgressPopoverContext();
  const open = Boolean(anchorEl);
  const id = open ? POPOVER_ID : undefined;

  const [keepMounted, setKeepMounted] = useState(false);

  // Memoize the cleanup function to prevent unnecessary re-renders
  const handleKeepMountedCleanup = useCallback(() => {
    setKeepMounted(false);
  }, []);

  useEffect(() => {
    if (open) {
      setKeepMounted(true);
    } else {
      const timer = window.setTimeout(
        handleKeepMountedCleanup,
        keepAliveTimeout,
      );
      return () => window.clearTimeout(timer);
    }
  }, [open, keepAliveTimeout, handleKeepMountedCleanup]);

  return (
    <>
      <Popover
        id={id}
        open={open}
        keepMounted={keepMounted}
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'center',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'center',
          horizontal: 'left',
        }}
        slotProps={{
          paper: {
            sx: popoverPaperStyles,
          },
        }}
        elevation={0}
        onClose={handleClose}
      >
        <Box sx={contentBoxStyles}>{children}</Box>
      </Popover>
      {activatorButton}
    </>
  );
};

// Add display name for better debugging
OnboardingChecklistProgressPopover.displayName =
  'OnboardingChecklistProgressPopover';

export default OnboardingChecklistProgressPopover;

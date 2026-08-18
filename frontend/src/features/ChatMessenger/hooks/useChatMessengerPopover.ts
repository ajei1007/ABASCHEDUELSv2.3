import { useState, useCallback } from 'react';

export function useChatMessengerPopover() {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const toggleOpen = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      setAnchorEl((anchorEl) => (anchorEl ? null : event.currentTarget));
    },
    [],
  );

  return {
    anchorEl,
    handleClose,
    toggleOpen,
  };
}

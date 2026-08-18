import React, { useState, type MouseEvent, type ReactNode } from 'react';
import IconButton from '@mui/material/IconButton';
import Popover from '@mui/material/Popover';
import Stack from '@mui/material/Stack';
import { Tooltip } from '@mui/material';

interface ActionProps {
  closePopover: () => void;
}

interface Action {
  render: (props: ActionProps) => ReactNode;
}

interface NestedButtonPopoverProps {
  renderRoot?: (node: ReactNode) => ReactNode; // Optional prop for rendering a root element
  triggerIcon: ReactNode;
  actions: Action[];
  direction?: 'column' | 'row';
  spacing?: number;
  tooltip?: string;
}

const NestedButtonPopover: React.FC<NestedButtonPopoverProps> = ({
  renderRoot = (node) => node,
  triggerIcon,
  actions,
  direction = 'column',
  spacing = 1,
  tooltip = '',
  ...rest
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleOpen = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const popoverId = open ? 'nested-button-popover' : undefined;

  if (actions.length === 0) {
    return null; // Return null if there are no actions to display
  }

  return (
    <>
      {renderRoot(
        <Tooltip title={tooltip} placement='top' arrow>
          <IconButton onClick={handleOpen} {...rest}>
            {triggerIcon}
          </IconButton>
        </Tooltip>,
      )}

      <Popover
        id={popoverId}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Stack
          direction={direction}
          spacing={spacing}
          className='control-button-group'
        >
          {actions.map((action, index) => (
            <div key={index}>
              {action.render({ closePopover: handleClose })}
            </div>
          ))}
        </Stack>
      </Popover>
    </>
  );
};

export default NestedButtonPopover;

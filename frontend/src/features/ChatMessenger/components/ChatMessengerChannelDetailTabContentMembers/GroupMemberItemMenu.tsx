import { useState } from 'react';
import { IconButton, Menu, MenuItem } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';

const GroupMemberItemMenu = ({
  hasAccessRemoveFromGroup = false,
  hasAccessMakeAdmin = false,
  isDisabled = false,
  isAdmin = false,
  onToggleAdmin = () => {},
  onRemoveFromGroup = () => {},
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  if (!hasAccessRemoveFromGroup && !hasAccessMakeAdmin) {
    return null; // No actions available
  }

  return (
    <>
      <IconButton
        id='long-button'
        disabled={isDisabled}
        sx={{
          p: '1px',
        }}
        onClick={handleClick}
      >
        <MoreVertIcon />
      </IconButton>
      <Menu
        id='long-menu'
        open={open}
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        onClose={handleClose}
      >
        {hasAccessMakeAdmin && (
          <MenuItem
            onClick={() => {
              onToggleAdmin();
              handleClose();
            }}
            disabled={isDisabled}
          >
            {isAdmin ? 'Dissmiss as admin' : 'Make group admin'}
          </MenuItem>
        )}
        {hasAccessRemoveFromGroup && (
          <MenuItem
            onClick={() => {
              onRemoveFromGroup();
              handleClose();
            }}
            disabled={isDisabled}
          >
            Remove from group
          </MenuItem>
        )}
      </Menu>
    </>
  );
};

export default GroupMemberItemMenu;

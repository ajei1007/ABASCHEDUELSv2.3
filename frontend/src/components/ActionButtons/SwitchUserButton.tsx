import { Tooltip, IconButton } from '@mui/material';
import SwitchAccountIcon from '@mui/icons-material/SwitchAccount';

interface ActionSwitchUserButtonProps {
  handleClick: (e: any) => void;
}

const ActionSwitchUserButton = ({
  handleClick,
}: ActionSwitchUserButtonProps) => {
  return (
    <Tooltip title='Switch User' arrow placement='top'>
      <IconButton
        size='small'
        aria-label='switch'
        className='btn-icon primary'
        onClick={handleClick}
      >
        <SwitchAccountIcon fontSize='small' />
      </IconButton>
    </Tooltip>
  );
};

export default ActionSwitchUserButton;

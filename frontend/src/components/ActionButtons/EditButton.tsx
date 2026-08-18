import { Tooltip, IconButton } from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';

interface ActionEditButtonProps {
  disabled?: boolean,
  handleClick: (e: any) => void;
}

const ActionEditButton = ({ disabled = false, handleClick }: ActionEditButtonProps) => {
  return (
    <Tooltip title='Edit' arrow placement='top'>
      <IconButton
        size='small'
        aria-label='edit'
        className='btn-icon primary'
        disabled={disabled}
        onClick={handleClick}
      >
        <EditOutlinedIcon fontSize='small' />
      </IconButton>
    </Tooltip>
  );
};

export default ActionEditButton;
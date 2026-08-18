import { Tooltip, IconButton } from '@mui/material';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';

interface ActionDeleteButtonProps {
  handleClick: (e: any) => void;
}

const ActionDeleteButton = ({ handleClick }: ActionDeleteButtonProps) => {
  return (
    <Tooltip title='Delete' arrow placement='top'>
      <IconButton
        size='small'
        aria-label='delete'
        className='btn-icon error'
        onClick={handleClick}
      >
        <DeleteOutlineOutlinedIcon fontSize='small' />
      </IconButton>
    </Tooltip>
  );
};

export default ActionDeleteButton;

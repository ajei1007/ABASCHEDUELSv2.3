import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { IconButton } from '@mui/material';

interface IAnimatedUpButton {
  handleOpen: () => void;
  open: boolean;
}

const AnimatedUpButton = ({ handleOpen, open }: IAnimatedUpButton) => {
  return (
    <>
      {!open ? (
        <IconButton
          onClick={handleOpen}
          sx={{ p: 1, m: 1, background: '#fff' }}
        >
          <KeyboardArrowUpIcon />
        </IconButton>
      ) : (
        <IconButton
          onClick={handleOpen}
          sx={{ p: 1, m: 1, background: '#fff' }}
        >
          <KeyboardArrowDownIcon sx={{ color: '#4d53e0' }} />
        </IconButton>
      )}
    </>
  );
};

export default AnimatedUpButton;

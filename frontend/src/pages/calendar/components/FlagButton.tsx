import { Tooltip, IconButton, Badge } from '@mui/material';
import type { ReactNode, MouseEventHandler } from 'react';

interface IFlagButtonProps {
  color?: string;
  handleClick?: MouseEventHandler<HTMLButtonElement>;
  title: ReactNode;
  icons: Array<ReactNode>;
  lengthOfIcons?: ReactNode;
}

const FlagButton = ({
  color,
  handleClick,
  title,
  icons,
  lengthOfIcons,
}: IFlagButtonProps) => {
  return (
    <Tooltip title={ <div
      style={{
        maxHeight: '300px',
        overflowY: 'auto',  
      }}
    >
      {title} 
    </div>} arrow placement='top'>
      <IconButton
        size='small'
        aria-label={typeof title === 'string' ? title : ''}
        onClick={handleClick}
        sx={{ color: color ?? 'black', mr: lengthOfIcons ? 1.5 : 0 }}
      >
        {icons.map((icon, index) => (
          <Badge
            key={index}
            badgeContent={lengthOfIcons}
            color='error'
            sx={{
              '.MuiBadge-badge': {
                backgroundColor: '#ff5668 !important',
                height: '15px !important',
                minWidth: '15px !important',
                padding: '0 !important',
                top: '3px !important',
              },
            }}
          >
            {icon}
          </Badge>
        ))}
      </IconButton>
    </Tooltip>
  );
};
export type { IFlagButtonProps };
export default FlagButton;

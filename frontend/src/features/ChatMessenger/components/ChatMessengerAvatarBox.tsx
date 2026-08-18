import { Box, type BoxProps } from '@mui/material';

const ChatMessengerAvatarBox = ({
  element,
  size = 'md',
  sx,
  backgroundColor,
  foregroundColor,
}: {
  element?: React.ReactNode;
  size?: 'md' | 'sm' | 'xs';
  sx?: BoxProps['sx'];
  backgroundColor?: string;
  foregroundColor?: string;
}) => {
  const sizes = {
    sm: '30px',
    md: '50px',
    xs: '22px',
  };

  return (
    <Box
      sx={{
        height: sizes[size] || sizes.md,
        width: sizes[size] || sizes.md,
        backgroundColor: backgroundColor ?? '#ddd',
        borderRadius: '100%',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: foregroundColor ?? '#666',
        boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.1)',
        border: '1px solid #bbb',
        borderColor: backgroundColor ?? '#bbb',

        ...sx,
      }}
    >
      {element}
    </Box>
  );
};

export default ChatMessengerAvatarBox;

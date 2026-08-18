import { Stack, Typography, type StackProps } from '@mui/material';

const ChatMessengerChannelTitle = ({
  title,
  subtitle,
  alignItems,
}: {
  title: string;
  subtitle?: string;
  alignItems?: StackProps['alignItems'];
}) => {
  return (
    <Stack
      flexGrow={1}
      alignItems={alignItems}
      flexDirection='column'
      rowGap={0.25}
      overflow='hidden'
    >
      <Typography
        fontSize='1rem!important'
        fontWeight='bold'
        color='#333'
        overflow='hidden'
        whiteSpace='nowrap'
        textOverflow='ellipsis'
      >
        {title}
      </Typography>
      {subtitle && (
        <Typography
          fontSize='0.875rem!important'
          color='#666'
          overflow='hidden'
          whiteSpace='nowrap'
          textOverflow='ellipsis'
        >
          {subtitle}
        </Typography>
      )}
    </Stack>
  );
};

export default ChatMessengerChannelTitle;

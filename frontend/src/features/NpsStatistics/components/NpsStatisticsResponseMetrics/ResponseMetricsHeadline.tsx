import { Stack, Box, Typography } from '@mui/material';
import NpsStatisticsActivityIcon from '../NpsStatisticsActivityIcon';

const ResponseMetricsHeadline = ({
  goToResponsesLinkElement,
}: {
  goToResponsesLinkElement?: React.ReactNode;
}) => {
  return (
    <Stack flexDirection='row'>
      <Typography
        component='h3'
        fontSize='1.4rem!important'
        fontWeight='600'
        lineHeight='1.3'
        mb='1rem'
        sx={{
          display: 'flex',
          columnGap: '0.5rem',
        }}
      >
        <Box width='1.5rem'>
          <NpsStatisticsActivityIcon />
        </Box>
        <span>Response Metrics</span>
      </Typography>

      <Box ml='auto'>{goToResponsesLinkElement}</Box>
    </Stack>
  );
};

export default ResponseMetricsHeadline;

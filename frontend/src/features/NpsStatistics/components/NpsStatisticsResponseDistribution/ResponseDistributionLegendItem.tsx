import { Box, Typography } from '@mui/material';
import type { NpsBreakdownSegment } from './types';

const ResponseDistributionLegendItem = ({
  segment,
}: {
  segment: NpsBreakdownSegment;
}) => (
  <Box key={segment.category} display='flex' alignItems='center' gap={1.2}>
    <Box
      width={12}
      height={12}
      borderRadius='4px'
      sx={{ backgroundColor: segment.color }}
      aria-label={segment.category}
    />
    <Box>
      <Typography fontWeight={500}>{segment.category}</Typography>
      <Typography color='text.secondary' fontSize='0.85rem'>
        {segment.count} ({segment.percentage.toFixed(2)}%)
      </Typography>
    </Box>
  </Box>
);

export default ResponseDistributionLegendItem;

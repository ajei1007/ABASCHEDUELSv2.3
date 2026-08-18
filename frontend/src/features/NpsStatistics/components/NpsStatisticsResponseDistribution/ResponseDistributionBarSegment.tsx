import { Box, Tooltip } from '@mui/material';
import type { NpsBreakdownSegment } from './types';

const ResponseDistributionBarSegment = ({
  segment,
  index,
}: {
  segment: NpsBreakdownSegment;
  index: number;
}) => (
  <Tooltip
    title={`${segment.category}: ${segment.percentage}%`}
    arrow
    placement='top'
  >
    <Box
      key={segment.category}
      height='100%'
      sx={{
        width: `${segment.percentage}%`,
        backgroundColor: segment.color,
        transition: 'width 0.5s ease-out',
        transitionDelay: `${index * 0.2}s`,
      }}
      aria-label={`${segment.category}: ${segment.percentage}%`}
      role='presentation'
    />
  </Tooltip>
);

export default ResponseDistributionBarSegment;

import { Typography } from '@mui/material';
import BarChartIcon from '@mui/icons-material/BarChart';

const ResponseDistributionHeadline = () => (
  <Typography
    component='h3'
    fontSize='1.4rem!important'
    fontWeight={600}
    lineHeight='1.3'
    mb='1rem'
    sx={{ display: 'flex', columnGap: '0.5rem' }}
    flexShrink={0}
  >
    <BarChartIcon sx={{ fontSize: '1.65rem!important' }} />
    <span>Response Distribution</span>
  </Typography>
);

export default ResponseDistributionHeadline;

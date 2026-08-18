import { Typography } from '@mui/material';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';

const ScoreDistributionByRoleHeadline = () => (
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
    <GroupOutlinedIcon
      sx={{
        fontSize: '1.65rem!important',
      }}
    />
    <span>NPS by Role</span>
  </Typography>
);

export default ScoreDistributionByRoleHeadline;

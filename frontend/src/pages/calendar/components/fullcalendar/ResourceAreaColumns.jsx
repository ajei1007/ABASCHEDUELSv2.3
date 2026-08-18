import { Stack, IconButton, Tooltip, Typography } from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import CustomCheckboxBlock from 'components/CustomCheckboxBlock/CustomCheckboxBlock';
import FlaggingJobsChip from '../FlaggingJobsChip';

export const ResourceAreaColumns = ({
  nameChecked,
  handleNameCheck,
  toggleSortOrder,
  toggleSortOrderLast,
  eventSortOrder,
  isOptimizerResultsPreviewMode,
}) => {
  return (
    <Stack direction='row' alignItems='center' spacing={1}>
      <CustomCheckboxBlock
        checked={nameChecked}
        onChange={handleNameCheck}
        disabled={isOptimizerResultsPreviewMode}
        color='#6b859e'
      />
      <Stack direction='row' alignItems='center' spacing={1}>
        <Tooltip title='Sort by First Name'>
          <IconButton
            onClick={toggleSortOrder}
            sx={{ padding: 0, mr: '3px' }}
            size='small'
          >
            {eventSortOrder === 'title' ? (
              <ArrowDownwardIcon fontSize='16px' />
            ) : (
              <ArrowUpwardIcon fontSize='16px' />
            )}
          </IconButton>
        </Tooltip>
        <Typography textTransform='none'>Name</Typography>
        <Tooltip title='Sort by Last Name'>
          <IconButton
            onClick={toggleSortOrderLast}
            sx={{ padding: 0, mr: '3px' }}
            size='small'
          >
            {eventSortOrder === 'lastName' ? (
              <ArrowDownwardIcon fontSize='16px' />
            ) : (
              <ArrowUpwardIcon fontSize='16px' />
            )}
          </IconButton>
        </Tooltip>
        <FlaggingJobsChip />
      </Stack>
    </Stack>
  );
};

export const StatsCol = ({ title, text, color = '#6b859e' }) => (
  <Tooltip
    placement='top-start'
    title={<div color='inherit'>{title}</div>}
    arrow
  >
    <p style={{ color: color }}>{text}</p>
  </Tooltip>
);

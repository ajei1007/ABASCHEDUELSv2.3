import { useNavigate } from 'react-router-dom';
import { Stack, Box, Typography } from '@mui/material';
import ArrowBackIosOutlinedIcon from '@mui/icons-material/ArrowBackIosOutlined';
import NpsStatisticsCompanySelect from '@/features/NpsStatistics/components/NpsStatisticsCompanySelect';
import NpsStatisticsQuestionSelect from '@/features/NpsStatistics/components/NpsStatisticsQuestionSelect';
import NpsStatisticsQuarterSelect from '@/features/NpsStatistics/components/NpsStatisticsQuarterSelect';

const NpsStatisticsResponsesHeadline = ({
  companyId,
  setCompanyId,
  questionId,
  setQuestionId,
  quarter,
  setQuarter,
  exportButtonElement,
}: {
  companyId: string | null;
  setCompanyId: (id: string | null) => void;
  questionId: string | null;
  setQuestionId: (id: string | null) => void;
  quarter: string;
  setQuarter: (quarter: string) => void;
  exportButtonElement?: React.ReactNode;
}) => {
  const navigate = useNavigate();

  return (
    <Stack
      mb={2.5}
      sx={{
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
        border: '1px solid #e0e0e0',
        padding: '1rem',
        display: 'flex',
        px: '1rem',
        pt: '1rem',
        pb: '1.25rem',
      }}
    >
      <Stack flexDirection='row' columnGap={0.25} rowGap={1} flexWrap='wrap'>
        <Stack flexDirection='row' alignItems='center' columnGap={1.5}>
          <Box
            component='button'
            display='flex'
            alignItems='center'
            justifyContent='center'
            width='2.25rem'
            height='2.25rem'
            columnGap={1}
            sx={{
              backgroundColor: '#fff',
              border: '1px solid #e0e0e0',
              borderRadius: '4px',
              cursor: 'pointer',
              boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
              transition: 'background-color 0.2s ease',
              '&:hover': {
                backgroundColor: '#f5f5f5',
              },
              '&:active': {
                backgroundColor: '#e0e0e0',
              },
            }}
            onClick={() => navigate(-1)}
          >
            <ArrowBackIosOutlinedIcon
              sx={{
                fontSize: '0.75rem',
              }}
            />
          </Box>
          <Stack pt={0.5} flexDirection='column' rowGap={0.25}>
            <Typography
              fontWeight='600'
              lineHeight={1.25}
              fontSize='1.5rem!important'
            >
              NPS Response Details
            </Typography>
            <Typography
              fontSize='0.9rem!important'
              fontWeight='300'
              lineHeight={1.5}
              sx={{
                color: '#415e84',
              }}
            >
              Individual User Feedback and Ratings
            </Typography>
          </Stack>
        </Stack>

        <Box
          ml='auto'
          display='flex'
          alignItems='center'
          minWidth='15rem'
          columnGap={1}
        >
          <Typography fontSize='0.75rem!important'>Quarter:</Typography>
          <NpsStatisticsQuarterSelect value={quarter} onChange={setQuarter} />
        </Box>
      </Stack>

      <Box
        sx={{
          borderTop: '1px solid #f2f2f2',
          marginTop: '1rem',
          marginBottom: '0.75rem',
        }}
      ></Box>

      <Stack flexDirection='row' columnGap={2} rowGap={2} flexWrap='wrap'>
        <NpsStatisticsCompanySelect
          value={companyId}
          sx={{
            minWidth: {
              xs: '100%',
              lg: '20rem',
            },
          }}
          onChange={setCompanyId}
        />
        <NpsStatisticsQuestionSelect
          value={questionId}
          sx={{
            minWidth: {
              xs: '100%',
              lg: '30rem',
            },
          }}
          onChange={setQuestionId}
        />
        {exportButtonElement && (
          <Box display='flex' alignItems='flex-end' ml='auto'>
            {exportButtonElement}
          </Box>
        )}
      </Stack>
    </Stack>
  );
};

export default NpsStatisticsResponsesHeadline;

import { useMemo } from 'react';
import { Typography, Button } from '@mui/material';
import { Link, createSearchParams } from 'react-router-dom';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';

const NpsStatisticsGoToResponsesLink = ({
  companyId,
  questionId,
  quarter,
}: {
  companyId: string | null;
  questionId: string | null;
  quarter: string;
}) => {
  const to = useMemo(() => {
    const params: Record<string, any> = {};
    if (companyId) params.companyId = companyId;
    if (questionId) params.questionId = questionId;
    if (quarter) params.quarter = quarter;
    return {
      pathname: '/admin/nps-statistics/responses',
      search: createSearchParams(params).toString(),
    };
  }, [companyId, questionId, quarter]);

  return (
    <Link to={to}>
      <Button
        startIcon={
          <VisibilityOutlinedIcon
            sx={{
              fontSize: '1rem!important',
            }}
          />
        }
        sx={{
          height: '2.2rem',
        }}
        size='small'
        variant='outlined'
      >
        <Typography
          component='span'
          sx={{
            fontSize: '0.8rem!important',
          }}
        >
          View Responses
        </Typography>
      </Button>
    </Link>
  );
};

export default NpsStatisticsGoToResponsesLink;

import { Grid2 as Grid, Alert, Button } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import NpsStatisticsOverallScore from '../NpsStatisticsOverallScore/NpsStatisticsOverallScore';
import NpsStatisticsRatingStatistics from '../NpsStatisticsRatingStatistics';
import NpsStatisticsResponseDistribution from '../NpsStatisticsResponseDistribution/NpsStatisticsResponseDistribution';
import NpsStatisticsScoreDistributionByRole from '../NpsStatisticsScoreDistributionByRole/NpsStatisticsScoreDistributionByRole';
import NpsStatisticsResponseMetrics from '../NpsStatisticsResponseMetrics/NpsStatisticsResponseMetrics';
import NpsStatisticsResponseMetricsOutcome from '../NpsStatisticsResponseMetricsOutcome';
import NpsStatisticsGoToResponsesLink from '../NpsStatisticsGoToResponsesLink';
import ContentWrapperWithLoading from './ContentWrapperWithLoading';

const NpsStatisticsContent = ({
  statistics,
  isStatisticsLoading,
  statisticsErrorMessage,
  companyId,
  questionId,
  quarter,
  refetchStatistics,
}: {
  statistics: any;
  isStatisticsLoading: boolean;
  statisticsErrorMessage: any;
  companyId: string | null;
  questionId: string | null;
  quarter: string;
  refetchStatistics: () => void;
}) => {
  return (
    <ContentWrapperWithLoading isLoading={isStatisticsLoading}>
      {statisticsErrorMessage && (
        <Alert
          severity='error'
          sx={{
            mb: 2,
            boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.1)',
          }}
          action={
            <Button
              color='primary'
              variant='contained'
              size='small'
              onClick={refetchStatistics}
              sx={{
                textTransform: 'none',
                height: '2rem',
                py: 0,
                fontWeight: 500,
              }}
              startIcon={<RefreshIcon />}
            >
              Retry
            </Button>
          }
        >
          {statisticsErrorMessage ||
            'Something went wrong while loading NPS statistics'}
          . Please try again.
        </Alert>
      )}
      <Grid container spacing={2.5}>
        <Grid size={{ sm: 12, md: 12, lg: 6 }} alignItems='stretch'>
          <NpsStatisticsOverallScore
            npsScores={statistics.npsScore}
            totalResponses={statistics.npsTotalResponses}
          />
        </Grid>
        <Grid size={{ sm: 12, md: 12, lg: 6 }} alignItems='stretch'>
          <NpsStatisticsRatingStatistics
            ratingStatistics={statistics.npsRatingStatistics}
          />
        </Grid>
        <Grid size={{ sm: 12, md: 12, lg: 6 }} alignItems='stretch'>
          <NpsStatisticsResponseDistribution
            ratingDistribution={statistics.npsRatingDistribution}
          />
        </Grid>
        <Grid size={{ sm: 12, md: 12, lg: 6 }} alignItems='stretch'>
          <NpsStatisticsScoreDistributionByRole
            distributionByRole={statistics.npsDistributionByRole}
          />
        </Grid>
        <Grid size={{ sm: 12 }}>
          <NpsStatisticsResponseMetrics
            totalResponses={statistics.npsTotalResponses}
            responseRate={statistics.npsResponseRate}
            responseTrends={statistics.npsResponseTrends}
            goToResponsesLinkElement={
              <NpsStatisticsGoToResponsesLink
                companyId={companyId}
                questionId={questionId}
                quarter={quarter}
              />
            }
          />
        </Grid>
        <Grid size={{ sm: 12 }}>
          <NpsStatisticsResponseMetricsOutcome
            totalResponses={statistics.npsTotalResponses}
            responseRate={statistics.npsResponseRate}
          />
        </Grid>
      </Grid>
    </ContentWrapperWithLoading>
  );
};

export default NpsStatisticsContent;

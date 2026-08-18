import ContentSkeletonLoading from './ContentSkeletonLoading';
import ContentLoadError from './ContentLoadError';
import ContentNoData from './ContentNoData';

const NpsStatisticsContentEmpty = ({
  isStatisticsLoading,
  statisticsErrorMessage,
  refetchStatistics,
}: {
  isStatisticsLoading: boolean;
  statisticsErrorMessage: any;
  refetchStatistics: () => void;
}) => {
  if (isStatisticsLoading) {
    return <ContentSkeletonLoading />;
  }

  if (statisticsErrorMessage) {
    return (
      <ContentLoadError
        errorMessage={statisticsErrorMessage}
        refetch={refetchStatistics}
      />
    );
  }

  return <ContentNoData />;
};

export default NpsStatisticsContentEmpty;

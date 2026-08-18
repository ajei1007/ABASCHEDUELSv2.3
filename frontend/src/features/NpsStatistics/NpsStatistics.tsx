import { lazy, Suspense } from 'react';
import NpsStatisticsHeadline from './components/NpsStatisticsHeadline';
import NpsStatisticsContentEmpty from './components/NpsStatisticsContentEmpty/NpsStatisticsContentEmpty';
import NpsStatisticsContent from './components/NpsStatisticsContent/NpsStatisticsContent';
import { useNpsStatisticsQueryParams } from './hooks/useNpsStatisticsQueryParams';
import { useNpsStatisticsFetch } from './hooks/useNpsStatisticsFetch';

const NpsStatisticsExportButton = lazy(
  () => import('./components/NpsStatisticsExportButton'),
);

const NpsStatistics = () => {
  const {
    companyId,
    setCompanyId,
    questionId,
    setQuestionId,
    quarter,
    setQuarter,
  } = useNpsStatisticsQueryParams();

  const {
    statistics,
    isStatisticsLoading,
    statisticsErrorMessage,
    refetchStatistics,
  } = useNpsStatisticsFetch({
    companyId,
    questionId,
    quarter,
  });

  return (
    <div>
      <NpsStatisticsHeadline
        companyId={companyId}
        setCompanyId={setCompanyId}
        questionId={questionId}
        setQuestionId={setQuestionId}
        quarter={quarter}
        setQuarter={setQuarter}
        exportButtonElement={
          <Suspense>
            <NpsStatisticsExportButton
              statistics={statistics}
              statisticsErrorMessage={statisticsErrorMessage}
              isStatisticsLoading={isStatisticsLoading}
            />
          </Suspense>
        }
      />
      {statistics ? (
        <NpsStatisticsContent
          statistics={statistics}
          isStatisticsLoading={isStatisticsLoading}
          statisticsErrorMessage={statisticsErrorMessage}
          companyId={companyId}
          questionId={questionId}
          quarter={quarter}
          refetchStatistics={refetchStatistics}
        />
      ) : (
        <NpsStatisticsContentEmpty
          isStatisticsLoading={isStatisticsLoading}
          statisticsErrorMessage={statisticsErrorMessage}
          refetchStatistics={refetchStatistics}
        />
      )}
    </div>
  );
};

export default NpsStatistics;

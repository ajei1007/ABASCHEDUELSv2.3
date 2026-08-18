import { lazy, Suspense } from 'react';
import NpsStatisticsResponsesHeadline from './components/NpsStatisticsResponsesHeadline';
import NpsStatisticsResponsesTableSection from './components/NpsStatisticsResponsesTableSection/NpsStatisticsResponsesTableSection';
import { useNpsStatisticsQueryParams } from '@/features/NpsStatistics/hooks/useNpsStatisticsQueryParams';
import { useNpsStatisticsResponseQueryParams } from './hooks/useNpsStatisticsResponseQueryParams';
import { useNpsStatisticsResponseItemsFetch } from './hooks/useNpsStatisticsResponseItemsFetch';

const NpsStatisticsResponsesExportButton = lazy(
  () => import('./components/NpsStatisticsResponsesExportButton'),
);

const NpsStatisticsResponses = () => {
  const {
    companyId,
    setCompanyId,
    questionId,
    setQuestionId,
    quarter,
    setQuarter,
  } = useNpsStatisticsQueryParams();

  const { page, setPage, limit, setLimit } =
    useNpsStatisticsResponseQueryParams();

  const {
    responseItems,
    totalCount,
    isResponseItemsLoading,
    responseItemsErrorMessage,
    refetchResponseItems,
  } = useNpsStatisticsResponseItemsFetch({
    page,
    limit,
    companyId,
    questionId,
    quarter,
  });
  return (
    <div>
      <NpsStatisticsResponsesHeadline
        companyId={companyId}
        setCompanyId={setCompanyId}
        questionId={questionId}
        setQuestionId={setQuestionId}
        quarter={quarter}
        setQuarter={setQuarter}
        exportButtonElement={
          <Suspense>
            <NpsStatisticsResponsesExportButton
              companyId={companyId}
              questionId={questionId}
              quarter={quarter}
              totalCount={totalCount}
              isLoading={isResponseItemsLoading}
              errorMessage={responseItemsErrorMessage}
            />
          </Suspense>
        }
      />
      <NpsStatisticsResponsesTableSection
        page={page}
        setPage={setPage}
        limit={limit}
        setLimit={setLimit}
        rows={responseItems}
        totalCount={totalCount}
        isLoading={isResponseItemsLoading}
        errorMessage={responseItemsErrorMessage}
        hideCompanyColumn={!!companyId}
        refetch={refetchResponseItems}
      />
    </div>
  );
};

export default NpsStatisticsResponses;

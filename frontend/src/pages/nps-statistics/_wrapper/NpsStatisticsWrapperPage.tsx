import { NpsStatisticsCompaniesContextProvider } from '@/features/NpsStatistics/context/NpsStatisticsCompaniesContext';
import { NpsStatisticsQuestionsContextProvider } from '@/features/NpsStatistics/context/NpsStatisticsQuestionsContext';

const NpsStatisticsWrapperPage = ({
  children,
}: {
  children?: React.ReactNode;
}) => {
  return (
    <NpsStatisticsCompaniesContextProvider>
      <NpsStatisticsQuestionsContextProvider>
        {children}
      </NpsStatisticsQuestionsContextProvider>
    </NpsStatisticsCompaniesContextProvider>
  );
};

export default NpsStatisticsWrapperPage;

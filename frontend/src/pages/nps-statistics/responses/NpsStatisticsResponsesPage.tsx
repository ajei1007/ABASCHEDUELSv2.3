import { useEffect } from 'react';
import NpsStatisticsResponses from '@/features/NpsStatisticsResponses/NpsStatisticsResponses';

const NpsStatisticsResponsesPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return <NpsStatisticsResponses />;
};

export default NpsStatisticsResponsesPage;

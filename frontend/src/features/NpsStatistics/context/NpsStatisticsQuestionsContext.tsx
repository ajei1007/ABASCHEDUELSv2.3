import { useMemo, useContext, createContext } from 'react';
import axios from 'axios';
import { useFetchOnce } from 'hooks/useFetchOnce';
import type { IApiSurveyQuestionItem } from 'types/api';

async function questionsFetcher({ signal }: { signal: AbortSignal }) {
  const response = await axios.get('/surveydata/questions', {
    signal,
  });
  return (
    Array.isArray(response.data) ? response.data : []
  ) as IApiSurveyQuestionItem[];
}

export const NpsStatisticsQuestionsContext = createContext<{
  questions: IApiSurveyQuestionItem[];
  fetchingStatus: 'idle' | 'loading' | 'error' | 'success';
  fetchQuestions: () => Promise<void>;
}>({
  questions: [] as IApiSurveyQuestionItem[],
  fetchingStatus: 'idle',
  // Default implementation, can be overridden by provider
  fetchQuestions: async () => {},
});

export const useNpsStatisticsQuestionsContext = () => {
  return useContext(NpsStatisticsQuestionsContext);
};

export const NpsStatisticsQuestionsContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const {
    data: questions,
    fetchingStatus,
    fetchData: fetchQuestions,
  } = useFetchOnce({
    fetcher: questionsFetcher,
    initialData: [],
  });

  const contextValue = useMemo(
    () => ({
      questions,
      fetchingStatus,
      fetchQuestions,
    }),
    [questions, fetchingStatus, fetchQuestions],
  );

  return (
    <NpsStatisticsQuestionsContext.Provider value={contextValue}>
      {children}
    </NpsStatisticsQuestionsContext.Provider>
  );
};

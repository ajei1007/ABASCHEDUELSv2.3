import { useMemo, useContext, createContext } from 'react';
import axios from 'axios';
import { useFetchOnce } from 'hooks/useFetchOnce';
import type { IApiCompanyItem } from 'types/api';

async function companiesFetcher({ signal }: { signal: AbortSignal }) {
  const response = await axios.get('/companies', {
    params: {
      page: 1,
      limit: 1000,
    },
    signal: signal,
  });

  return (response?.data?.rows || []) as IApiCompanyItem[];
}

export const NpsStatisticsCompaniesContext = createContext<{
  companies: IApiCompanyItem[];
  fetchingStatus: 'idle' | 'loading' | 'error' | 'success';
  fetchCompanies: () => Promise<void>;
}>({
  companies: [] as IApiCompanyItem[],
  fetchingStatus: 'idle',
  // Default implementation, can be overridden by provider
  fetchCompanies: async () => {},
});

export const useNpsStatisticsCompaniesContext = () => {
  return useContext(NpsStatisticsCompaniesContext);
};

export const NpsStatisticsCompaniesContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const {
    data: companies,
    fetchingStatus,
    fetchData: fetchCompanies,
  } = useFetchOnce({
    fetcher: companiesFetcher,
    initialData: [],
  });

  const contextValue = useMemo(
    () => ({
      companies,
      fetchingStatus,
      fetchCompanies,
    }),
    [companies, fetchingStatus, fetchCompanies],
  );

  return (
    <NpsStatisticsCompaniesContext.Provider value={contextValue}>
      {children}
    </NpsStatisticsCompaniesContext.Provider>
  );
};

import axios from 'axios';
import { useState, useCallback } from 'react';

interface CompanyOption {
  id: string;
  value: string | null;
  label: string;
}

interface UseOptimizerActionLogsCompanyOptionsReturn {
  companyOptions: CompanyOption[];
  fetchCompanyOptions: () => Promise<void>;
}

export function useOptimizerActionLogsCompanyOptions(): UseOptimizerActionLogsCompanyOptionsReturn {
  const [companyOptions, setCompanyOptions] = useState<CompanyOption[]>([]);

  const fetchCompanyOptions = useCallback(async () => {
    try {
      const response = await axios.get(`/companies/autocomplete`);
      const companies = response.data;
      setCompanyOptions(
        companies.map((company: any) => ({
          id: company.id,
          value: company.id,
          label: company.label,
        })),
      );
    } catch (error) {
      console.error('Error fetching activity options:', error);
    }
  }, []);

  return {
    companyOptions,
    fetchCompanyOptions,
  };
}

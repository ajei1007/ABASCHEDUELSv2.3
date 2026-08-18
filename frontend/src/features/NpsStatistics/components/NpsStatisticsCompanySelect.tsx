import { useMemo, useEffect, useRef } from 'react';
import { Box, type BoxProps } from '@mui/material';
import CustomSelect from 'components/CustomSelect/CustomSelect';
import Business from '@mui/icons-material/Business';
import { useNpsStatisticsCompaniesContext } from '../context/NpsStatisticsCompaniesContext';

export type TNpsStatisticsCompanySelectProps = Omit<BoxProps, 'onChange'> & {
  value?: string | null;
  onChange?: (company: string | null) => void;
};

const NpsStatisticsCompanySelect = ({
  value,
  onChange,
  ...boxProps
}: TNpsStatisticsCompanySelectProps) => {
  const { companies, fetchingStatus, fetchCompanies } =
    useNpsStatisticsCompaniesContext();

  const companyOptions = useMemo(
    () =>
      companies.map((company) => ({
        value: company.id,
        label: company.name,
      })),
    [companies],
  );

  const isMounted = useRef(false);

  useEffect(() => {
    if (value && !isMounted.current) {
      fetchCompanies();
      isMounted.current = true;
    }
  }, []);

  return (
    <Box {...boxProps}>
      <label style={{ display: 'flex', alignItems: 'center', fontWeight: 500 }}>
        <Business sx={{ mr: 0.5, mb: '1px', fontSize: 16 }} /> Company
      </label>
      <CustomSelect
        value={companyOptions.find((item) => item.value === value) || null}
        placeholder='All Companies'
        options={companyOptions}
        isLoading={fetchingStatus === 'loading'}
        isClearable
        onChange={(item: any) => {
          onChange?.(item ? item?.value : null);
        }}
        onFocus={() => {
          fetchCompanies();
        }}
      />
    </Box>
  );
};

export default NpsStatisticsCompanySelect;

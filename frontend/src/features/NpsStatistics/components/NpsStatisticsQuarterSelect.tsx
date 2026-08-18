import { useMemo } from 'react';
import CustomSelect from 'components/CustomSelect/CustomSelect';
import { generateQuarters, getCurrentQuarter } from '@/utils/quarterGenerator';

export interface INpsStatisticsQuarterSelect {
  value?: string;
  onChange?: (value: string) => void;
}

const NpsStatisticsQuarterSelect = ({
  value,
  onChange,
}: INpsStatisticsQuarterSelect) => {
  const quarters = useMemo(() => generateQuarters(new Date('2024-10-01')), []);

  return (
    <CustomSelect
      value={quarters.find((item) => item.value === value) || null}
      options={quarters}
      onChange={(item: any) => {
        onChange?.(item && item?.value ? item.value : getCurrentQuarter());
      }}
    />
  );
};

export default NpsStatisticsQuarterSelect;

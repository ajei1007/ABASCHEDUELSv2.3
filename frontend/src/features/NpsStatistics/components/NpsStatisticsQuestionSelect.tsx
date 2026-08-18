import { useEffect, useMemo, useRef } from 'react';
import { Box, type BoxProps } from '@mui/material';
import CustomSelect from 'components/CustomSelect/CustomSelect';
import HelpOutline from '@mui/icons-material/HelpOutline';
import { useNpsStatisticsQuestionsContext } from '../context/NpsStatisticsQuestionsContext';

export type TNpsStatisticsQuestionSelectProps = Omit<BoxProps, 'onChange'> & {
  value?: string | null;
  onChange?: (company: string | null) => void;
};

const NpsStatisticsQuestionSelect = ({
  value,
  onChange,
  ...boxProps
}: TNpsStatisticsQuestionSelectProps) => {
  const { questions, fetchingStatus, fetchQuestions } =
    useNpsStatisticsQuestionsContext();

  const questionOptions = useMemo(
    () =>
      questions.map((item) => ({
        value: item.id,
        label: item.question,
      })),
    [questions],
  );

  const isMounted = useRef(false);

  useEffect(() => {
    if (value && !isMounted.current) {
      fetchQuestions();
      isMounted.current = true;
    }
  }, []);

  return (
    <Box {...boxProps}>
      <label style={{ display: 'flex', alignItems: 'center', fontWeight: 500 }}>
        <HelpOutline sx={{ mr: 0.5, mb: '1px', fontSize: 16 }} /> Question
      </label>
      <CustomSelect
        value={questionOptions.find((item) => item.value === value) || null}
        placeholder='All Questions'
        options={questionOptions}
        isLoading={fetchingStatus === 'loading'}
        isClearable
        onChange={(item: any) => {
          onChange?.(item ? item?.value : null);
        }}
        onFocus={() => {
          fetchQuestions();
        }}
      />
    </Box>
  );
};

export default NpsStatisticsQuestionSelect;

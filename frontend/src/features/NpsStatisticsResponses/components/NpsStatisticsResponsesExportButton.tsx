import { useCallback, type FC } from 'react';
import { Button, CircularProgress } from '@mui/material';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import { useNpsStatisticsResponseExport } from '../hooks/useNpsStatisticsResponseExport';

interface INpsStatisticsResponsesExportButtonProps {
  companyId: string | null;
  questionId: string | null;
  quarter: string;
  totalCount: number;
  isLoading: boolean;
  errorMessage: string | null;
}

const NpsStatisticsResponsesExportButton: FC<
  INpsStatisticsResponsesExportButtonProps
> = ({
  companyId,
  questionId,
  quarter,
  totalCount,
  isLoading,
  errorMessage,
}) => {
  const { exportResponsesData, isExporting } = useNpsStatisticsResponseExport({
    companyId: companyId || null,
    questionId: questionId || null,
    quarter: quarter,
    totalCount: totalCount,
  });
  const handleExport = useCallback(() => {
    exportResponsesData();
  }, [exportResponsesData]);

  const isDisabled =
    isExporting || totalCount === 0 || isLoading || !!errorMessage;

  return (
    <Button
      type='button'
      startIcon={
        isExporting ? (
          <CircularProgress size={20} color='inherit' />
        ) : (
          <SaveAltIcon />
        )
      }
      variant='contained'
      disabled={isDisabled}
      onClick={handleExport}
    >
      {isExporting ? 'Exporting...' : 'Export Responses'}
    </Button>
  );
};

export default NpsStatisticsResponsesExportButton;

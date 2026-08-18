import { useCallback, type FC } from 'react';
import { Button, CircularProgress } from '@mui/material';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import { useNpsStatisticsExport } from '../hooks/useNpsStatisticsExport';
import type { IApiNpsStatisticsData } from 'types/api';

interface INpsStatisticsExportButtonProps {
  statistics: IApiNpsStatisticsData | null;
  isStatisticsLoading: boolean;
  statisticsErrorMessage: string | null;
}

const NpsStatisticsExportButton: FC<INpsStatisticsExportButtonProps> = ({
  statistics,
  isStatisticsLoading,
  statisticsErrorMessage,
}) => {
  const { exportStatistics, isExporting } = useNpsStatisticsExport(statistics);

  const handleExport = useCallback(() => {
    exportStatistics();
  }, [exportStatistics]);

  const isDisabled =
    !statistics ||
    !!statisticsErrorMessage ||
    isStatisticsLoading ||
    isExporting;

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
      data-testid='nps-statistics-export-button'
    >
      {isExporting ? 'Exporting...' : 'Export Statistics'}
    </Button>
  );
};

export default NpsStatisticsExportButton;

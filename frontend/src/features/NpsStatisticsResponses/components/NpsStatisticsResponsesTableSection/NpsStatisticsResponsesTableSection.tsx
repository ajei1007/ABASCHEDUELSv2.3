import { Stack, Box, Typography, Alert, Button } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import ResponsesTable from './ResponsesTable';
import type { IApiNpsStatisticsResponseItem } from 'types/api';

const NpsStatisticsResponsesTableSection = ({
  page,
  setPage,
  limit,
  setLimit,
  rows,
  totalCount,
  isLoading,
  errorMessage,
  hideCompanyColumn = false,
  refetch,
}: {
  page: number;
  setPage: (page: number) => void;
  limit: number;
  setLimit: (limit: number) => void;
  rows: IApiNpsStatisticsResponseItem[];
  totalCount: number;
  isLoading: boolean;
  errorMessage: string | null;
  hideCompanyColumn?: boolean;
  refetch: () => void;
}) => {
  const updatePagination = (pagination: { page: number; limit: number }) => {
    const newLimit = pagination.limit;
    const newPage = limit !== newLimit ? 1 : pagination.page;
    setPage(newPage);
    setLimit(newLimit);
  };

  return (
    <>
      <Stack
        mb={3}
        sx={{
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
          border: '1px solid #e0e0e0',
          display: 'flex',
          rowGap: '1rem',
          pt: '1.25rem',
          pb: '1rem',
        }}
      >
        <Stack px='1rem'>
          <Typography
            component='h4'
            fontWeight='600'
            lineHeight={1.25}
            fontSize='1.2rem!important'
          >
            User Responses ({totalCount} total)
          </Typography>
        </Stack>

        {errorMessage && (
          <Box px='1rem'>
            <Alert
              severity='error'
              sx={{
                boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.1)',
              }}
              action={
                <Button
                  color='primary'
                  variant='contained'
                  size='small'
                  onClick={refetch}
                  sx={{
                    textTransform: 'none',
                    height: '2rem',
                    py: 0,
                    fontWeight: 500,
                  }}
                  startIcon={<RefreshIcon />}
                >
                  Retry
                </Button>
              }
            >
              {errorMessage ||
                'Something went wrong while loading NPS statistics'}
              . Please try again.
            </Alert>
          </Box>
        )}

        <ResponsesTable
          rows={rows}
          count={totalCount}
          page={page}
          limit={limit}
          loading={isLoading}
          hideCompanyColumn={hideCompanyColumn}
          updatePagination={updatePagination}
        />
      </Stack>
    </>
  );
};

export default NpsStatisticsResponsesTableSection;

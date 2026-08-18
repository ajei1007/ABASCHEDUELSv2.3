import { useMemo, memo, type FC } from 'react';
import { Alert, Box, Stack, Typography } from '@mui/material';
import { uniqBy } from 'lodash';
import { useCalendarSelectedEventsContext } from '../../context/CalendarSelectedEventsContext';
import ActionButtons from './ActionButtons';

export interface ICopySelectModeActiveAlertProps {
  disableActions?: boolean;
  onDeleteEvents?: () => void;
  onPasteEvents?: () => void;
  onExitMode?: () => void;
}

const CopySelectModeActiveAlert: FC<ICopySelectModeActiveAlertProps> = ({
  disableActions = false,
  onDeleteEvents,
  onPasteEvents,
  onExitMode,
}) => {
  const { selectedEvents } = useCalendarSelectedEventsContext();

  const selectedEventsCount = useMemo(
    () => uniqBy(selectedEvents, 'extendedProps.eventGroupId').length,
    [selectedEvents],
  );

  return (
    <Alert
      sx={{
        position: 'relative',
        '&': {
          paddingTop: '0.3rem',
          paddingBottom: '0.2rem',
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: '0.5rem',
          '.MuiAlert-message': {
            flexGrow: '1',
            paddingY: '0.2rem',
          },
        },
      }}
      icon={<span></span>}
      action={
        <ActionButtons
          selectedEventsCount={selectedEventsCount}
          disableActions={disableActions}
          onDeleteEvents={onDeleteEvents}
          onPasteEvents={onPasteEvents}
          onExitMode={onExitMode}
        />
      }
      severity='info'
    >
      <Stack
        direction='column'
        sx={{
          alignItems: {
            xl: 'center',
            xs: 'flex-start',
          },
        }}
      >
        <Stack
          direction='row'
          gap={1}
          width='100%'
          alignItems='center'
          justifyContent='center'
          color='#4d53e0'
          sx={{
            justifyContent: {
              lg: 'center',
              xs: 'flex-start',
            },
          }}
        >
          {selectedEventsCount > 0 ? (
            <>
              <Box
                component='span'
                sx={{
                  lineHeight: '1.5',
                }}
              >
                Events Copied/Selected
              </Box>
              {' - '}
              <Box
                component='span'
                sx={{
                  display: 'inline-block',
                  py: '0',
                  px: '6px',
                  backgroundColor: '#fefefe',
                  borderRadius: '0.3rem',
                  border: '1px solid #acacac',
                  fontSize: '0.75rem',
                  lineHeight: '1.5',
                  fontWeight: 500,
                  color: '#4d53e0',
                  whiteSpace: 'nowrap',
                }}
              >
                {`Items: ${selectedEventsCount}`}
              </Box>
            </>
          ) : (
            <Box
              component='span'
              sx={{
                lineHeight: '1.5',
              }}
            >
              Copy/Select Events Mode is activated!
            </Box>
          )}
        </Stack>
        <Typography
          textAlign='center'
          fontSize='0.78rem'
          sx={{
            color: '#757575',
            textAlign: {
              xl: 'center',
              xs: 'left',
            },
          }}
        >
          Selected events are automatically copied and can be pasted or deleted
          from the calendar.
        </Typography>
      </Stack>
    </Alert>
  );
};

export default memo(CopySelectModeActiveAlert);

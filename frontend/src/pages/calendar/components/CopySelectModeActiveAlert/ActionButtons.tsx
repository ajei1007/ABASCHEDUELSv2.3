import { useMemo, type FC } from 'react';
import { Button, Stack, Tooltip } from '@mui/material';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CloseIcon from '@mui/icons-material/Close';
import { useAppSelector } from '@/store/hooks';
import role_permissions from '@/helpers/role_permissions';

export interface IActionButtonsProps {
  selectedEventsCount: number;
  disableActions?: boolean;
  onPasteEvents?: () => void;
  onDeleteEvents?: () => void;
  onExitMode?: () => void;
}

const ActionButtons: FC<IActionButtonsProps> = ({
  selectedEventsCount,
  disableActions = false,
  onPasteEvents,
  onDeleteEvents,
  onExitMode,
}) => {
  const currentUser = useAppSelector((state) => state.auth.currentUser);

  const pasteEventsLoading = useAppSelector(
    (state) => state.calendar.pasteEventsLoading,
  );
  const deleteEventsLoading = useAppSelector(
    (state) => state.calendar.deleteEventsLoading,
  );

  const actionsDisabled =
    pasteEventsLoading || deleteEventsLoading || disableActions;

  const hasAccessCreateEvent = useMemo(
    () => role_permissions(currentUser, 'createEvent'),
    [currentUser],
  );

  const hasAccessDeleteEvent = useMemo(
    () => role_permissions(currentUser, 'deleteEvent'),
    [currentUser],
  );

  const handleExitMode = () => {
    if (selectedEventsCount > 0) {
      const confirmed = window.confirm(
        `You have ${selectedEventsCount} event${selectedEventsCount > 1 ? 's' : ''} selected. Are you sure you want to exit and lose your selection?`,
      );
      if (!confirmed) {
        return;
      }
    }
    onExitMode?.();
  };

  if (!hasAccessCreateEvent && !hasAccessDeleteEvent) {
    return null;
  }

  return (
    <Stack
      direction='row'
      alignItems='center'
      justifyContent='flex-end'
      gap={0.5}
      sx={{
        position: {
          xl: 'absolute',
          xs: 'static',
        },
        top: {
          xl: '50%',
          xs: 'auto',
        },
        right: {
          xl: '0.5rem',
          xs: 'auto',
        },
        transform: {
          xl: 'translateY(-50%)',
          xs: 'none',
        },
        flexWrap: {
          lg: 'nowrap',
          xs: 'wrap',
        },
        minWidth: '12rem',
      }}
    >
      {selectedEventsCount > 0 && (
        <>
          {hasAccessCreateEvent && onPasteEvents && (
            <Tooltip
              title={
                actionsDisabled
                  ? 'Paste action is currently disabled'
                  : `Paste ${selectedEventsCount} copied event${selectedEventsCount > 1 ? 's' : ''} to the selected time slot`
              }
            >
              <span>
                <Button
                  startIcon={<ContentPasteIcon />}
                  variant='contained'
                  color='primary'
                  size='small'
                  loading={pasteEventsLoading}
                  disabled={actionsDisabled}
                  onClick={onPasteEvents}
                  sx={{
                    minWidth: 'auto !important',
                    px: '12px !important',
                    py: '4px !important',
                    fontSize: '0.75rem !important',
                    height: '32px !important',
                  }}
                >
                  Paste
                </Button>
              </span>
            </Tooltip>
          )}
          {hasAccessDeleteEvent && onDeleteEvents && (
            <Tooltip
              title={
                actionsDisabled
                  ? 'Delete action is currently disabled'
                  : `Delete ${selectedEventsCount} selected event${selectedEventsCount > 1 ? 's' : ''} permanently`
              }
            >
              <span>
                <Button
                  startIcon={<DeleteOutlineIcon />}
                  variant='contained'
                  color='error'
                  size='small'
                  loading={deleteEventsLoading}
                  disabled={actionsDisabled}
                  onClick={onDeleteEvents}
                  sx={{
                    minWidth: 'auto !important',
                    px: '12px !important',
                    py: '4px !important',
                    fontSize: '0.75rem !important',
                    height: '32px !important',
                  }}
                >
                  Delete
                </Button>
              </span>
            </Tooltip>
          )}
        </>
      )}

      {onExitMode && (
        <Tooltip title='Exit copy/select mode and return to normal calendar view'>
          <Button
            startIcon={<CloseIcon />}
            variant='outlined'
            color='primary'
            size='small'
            onClick={handleExitMode}
            sx={{
              minWidth: 'auto !important',
              px: '12px !important',
              py: '4px !important',
              fontSize: '0.75rem !important',
              height: '32px !important',
            }}
          >
            Close
          </Button>
        </Tooltip>
      )}
    </Stack>
  );
};

export default ActionButtons;

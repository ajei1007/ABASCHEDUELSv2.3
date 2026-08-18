import { lazy, Suspense, type FC } from 'react';
import {
  Box,
  Checkbox,
  Typography,
  CircularProgress,
  Tooltip,
  IconButton,
  Skeleton,
} from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import type { IApiOnboardingChecklistItem } from 'types/api';
import { useChecklistItemState } from '../../hooks/useChecklistItemState';
import { useChecklistItemStyles } from '../../hooks/useChecklistItemStyles';
import { CHECKLIST_SPACING } from '../../constants/checklistStyles';

export interface IOnboardingChecklistItemProps {
  checklistItem: IApiOnboardingChecklistItem;
  hasAccessToggleItem: boolean; // Optional prop for access control
}

const MarkdownContent = lazy(() => import('./MarkdownContent'));

const OnboardingChecklistItem: FC<IOnboardingChecklistItemProps> = ({
  checklistItem,
  hasAccessToggleItem,
}) => {
  const { completed, isToggling, toggleCompleted, error } =
    useChecklistItemState(checklistItem);

  const { containerStyles, titleStyles, checkboxStyles } =
    useChecklistItemStyles({ completed, hasAccessToggleItem });

  const handleClick = () => {
    if (!isToggling) {
      toggleCompleted();
    }
  };

  return (
    <Box
      sx={containerStyles}
      onClick={hasAccessToggleItem ? handleClick : undefined}
      role='button'
      tabIndex={0}
      aria-label={`${completed ? 'Uncheck' : 'Check'} ${checklistItem.title}`}
      aria-pressed={completed}
      aria-disabled={isToggling}
    >
      <Box
        display='flex'
        alignItems='flex-start'
        gap={CHECKLIST_SPACING.itemGap}
        p={CHECKLIST_SPACING.itemPadding}
      >
        <Box
          display='flex'
          alignItems='flex-start'
          gap={CHECKLIST_SPACING.itemGap}
          flex={1}
        >
          <Box
            position='relative'
            display='flex'
            alignItems='center'
            sx={{
              pt: '6px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <Checkbox
              checked={completed}
              onChange={hasAccessToggleItem ? handleClick : undefined}
              disabled={isToggling}
              disableRipple
              disableFocusRipple
              disableTouchRipple
              sx={checkboxStyles}
              slotProps={{
                input: {
                  role: 'checkbox',
                  'aria-labelledby': `checklist-item-${checklistItem.id}`,
                  'aria-checked': completed ? 'true' : 'false',
                  sx: {
                    cursor: hasAccessToggleItem ? 'pointer' : 'default',
                  },
                },
              }}
            />
            {isToggling && (
              <CircularProgress
                size={16}
                sx={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  marginLeft: '-8px',
                  marginTop: '-8px',
                }}
              />
            )}
          </Box>
          <Box flex={1}>
            <Box
              display='flex'
              alignItems='flex-start'
              justifyContent='space-between'
            >
              <Box flex={1}>
                <Typography
                  id={`checklist-item-${checklistItem.id}`}
                  variant='h4'
                  component='h3'
                  sx={titleStyles}
                >
                  {checklistItem.title}
                </Typography>
                <Box mt={0.5}>
                  <Suspense
                    fallback={
                      <Skeleton
                        height='0.75rem'
                        width='100%'
                        variant='rectangular'
                        animation='wave'
                        sx={{
                          mt: '0.35rem',
                          transform: 'none',
                          borderRadius: '6px',
                          maxWidth: '20rem',
                        }}
                        aria-label='Loading checklist item content'
                      />
                    }
                  >
                    <MarkdownContent
                      content={checklistItem.content}
                      completed={completed}
                    />
                  </Suspense>
                </Box>
              </Box>
              {error && (
                <Tooltip title={error} placement='top' arrow>
                  <IconButton
                    size='small'
                    sx={{
                      color: '#f44336',
                      '&:hover': {
                        backgroundColor: 'rgba(244, 67, 54, 0.04)',
                      },
                    }}
                    aria-label={`Error: ${error}`}
                  >
                    <ErrorOutlineIcon fontSize='small' />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

OnboardingChecklistItem.displayName = 'OnboardingChecklistItem';

export default OnboardingChecklistItem;

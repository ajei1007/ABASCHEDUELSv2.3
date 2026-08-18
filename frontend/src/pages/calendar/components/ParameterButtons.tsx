import {
  CircularProgress,
  Grow,
  IconButton,
  Stack,
  Tooltip,
  Box,
} from '@mui/material';
import type { IconButtonProps } from '@mui/material';
import role_permissions from 'helpers/role_permissions';
import { memo, lazy, Suspense } from 'react';
import type { ReactNode, Dispatch, SetStateAction } from 'react';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import ContentPasteOutlinedIcon from '@mui/icons-material/ContentPasteOutlined';
import PercentOutlinedIcon from '@mui/icons-material/PercentOutlined';
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import CompressOutlinedIcon from '@mui/icons-material/CompressOutlined';
import ListAltIcon from '@mui/icons-material/ListAlt';
import { resetStatistics } from 'store/slices/calendar/actions';
import { fetchStatistics } from 'store/slices/calendar/thunks';
import {
  handleSettingValues,
  updateSchedulerLocked,
} from 'store/actions/settingsActions';
import UndoOutlinedIcon from '@mui/icons-material/UndoOutlined';
import RedoOutlinedIcon from '@mui/icons-material/RedoOutlined';
import RemoveCircleOutlineOutlinedIcon from '@mui/icons-material/RemoveCircleOutlineOutlined';
import BookmarkAddedOutlinedIcon from '@mui/icons-material/BookmarkAddedOutlined';
import BookmarkRemoveOutlinedIcon from '@mui/icons-material/BookmarkRemoveOutlined';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import LockOpenOutlinedIcon from '@mui/icons-material/LockOpenOutlined';
import useUndoRedo from 'hooks/useUndoRedo';
import hasUserPermissionOnLockedScheduler from '../utils/hasUserPermissionOnLockedScheduler';
import FlagIcon from '@mui/icons-material/Flag';
import DriveEtaOutlinedIcon from '@mui/icons-material/DriveEtaOutlined';
import CustomDatePicker from 'components/CustomDatePicker/CustomDatePicker';
import SendToMobileOutlinedIcon from '@mui/icons-material/SendToMobileOutlined';
import checkCompanyPlanFeature from 'utils/checkCompanyPlanFeature';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import { allowedIntegration, IntegrationTypes } from 'utils/integrations';
import momentTimezone from 'moment-timezone';
import WorkspacesOutlinedIcon from '@mui/icons-material/WorkspacesOutlined';
import { fetchSyncedUsers } from 'store/actions/integrationAction';
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined';
import LaunchIcon from '@mui/icons-material/Launch';
import {
  fetchFlaggingData,
  setFlaggingData,
  setFlaggingEnabled,
  showFlaggingModal,
  setFlaggingFilterConstraintTypes,
} from 'store/slices/flagging/actions';
import { isOptimizerResultsPreviewModeSelector } from 'store/selectors/optimizerSelectors';
import { toggleOptimizerModal } from 'store/actions/optimizerActions';
import {
  newIntegrationSoftwareSelector,
  newIntegrationCheckingCredentialsSelector,
} from 'store/slices/newIntegration/selectors';
import {
  toggleRequestsModalOpen,
  toggleApprovalsModalOpen,
  toggleConstraintsModalOpen,
  toggleSettingsModalOpen,
  toggleFiltersModalOpen,
  toggleMailsModalOpen,
  toggleDistanceModalOpen,
  togglePdfModalOpen,
  toggleExportCalendarModalOpen,
  toggleRightSidebarOpen,
} from 'store/slices/calendarOverlayingPanels/actions';
import { selectRightSidebarOpen } from 'store/slices/calendarOverlayingPanels';
import { checkNpsSurvey } from 'store/slices/npsSurvey/actions';
import { useCalendarCopyModeContext } from '../context/CalendarCopyModeContext';
import { useNewIntegrationsCheckCredentials } from '../hooks/new-integrations/useNewIntegrationsCheckCredentials';
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';
import { IntegrationActionTypes } from 'types/redux/integrations';
import CalculateOutlinedIcon from '@mui/icons-material/CalculateOutlined';
import RestoreFromTrashIcon from '@mui/icons-material/RestoreFromTrash';
import DoneOutlineIcon from '@mui/icons-material/DoneOutline';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import FilePresentOutlinedIcon from '@mui/icons-material/FilePresentOutlined';
import NestedButtonPopover from 'components/NestedButton/NestedButtonPopover';
import ViewDayOutlinedIcon from '@mui/icons-material/ViewDayOutlined';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ViewModuleOutlinedIcon from '@mui/icons-material/ViewModuleOutlined';
import ExtensionOutlinedIcon from '@mui/icons-material/ExtensionOutlined';
import PublishOutlinedIcon from '@mui/icons-material/PublishOutlined';
import MapOutlinedIcon from '@mui/icons-material/MapOutlined';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
import TherapyPmsLogoIcon from './new-integrations/therapypms/TherapyPmsLogoIcon';
import RethinkLogoIcon from './new-integrations/rethink/RethinkLogoIcon';

const CollapseIcon = lazy(() => import('components/Icons/CollapseIcon'));
const ExpandIcon = lazy(() => import('components/Icons/ExpandIcon'));

export interface ICustomIconButtonProps extends IconButtonProps {
  children: ReactNode;
  name?: string;
}

export const CustomIconButton = ({
  children,
  id,
  name,
  disabled = false,
  ...props
}: ICustomIconButtonProps) => {
  return (
    <Tooltip arrow title={name} placement='top'>
      <span id={id}>
        <IconButton aria-label={name} disabled={disabled} {...props}>
          {children}
        </IconButton>
      </span>
    </Tooltip>
  );
};

export interface ILetterIconTextProps {
  children: ReactNode;
  isActive?: boolean;
}

export const LetterIconText = ({
  children,
  isActive = false,
}: ILetterIconTextProps) => (
  <span className={`control-letter-icon ${isActive && 'active-icon'}`}>
    {children}
  </span>
);

export const iconProps = (isActive = false, type = 'default-icon') => ({
  fontSize: 'small' as const,
  className: `control-icon ${isActive && 'active-icon'} ${type}`,
});

export interface IAnimatedControlGroupProps {
  children: ReactNode;
  timeout: number;
}

export const AnimatedControlGroup = ({
  timeout,
  children,
}: IAnimatedControlGroupProps) => (
  <Grow in={true} style={{ transformOrigin: '0 0 0' }} timeout={timeout}>
    <div className='control-button-group'>{children}</div>
  </Grow>
);

export interface IParameterButtonsProps {
  isolate: () => void;
  trash: () => void;
  activeDay: any;
  setSelectedEvents: (events: any[]) => void;
  uncheckAll: () => void;
  paste: () => void;
  checkedResources: any;
  handleSetActiveDay: (type: any, value: any) => void;
  activeView: string;
  handleAddDriveBetweenEvent: () => void;
  calendarApi: any | null;
  isDeleteDisabled: boolean;
  isUnDeleteDisabled: boolean;
  hasCurrentDayHaveOptimizerJob: boolean;
  handleClickMakeEventsSandboxed: (isSandbox?: boolean) => void;
  handleClickUndelete: () => void;
  handleAddUnavalabilities: () => void;
  handleAddAvalabilities: () => void;
  creatingUnavailabilites?: boolean;
  creatingAvailabilites?: boolean;
  handleRemoveUnavailabilities: () => void;
  weekExpanded: boolean;
  toggleWeekExpanded: () => void;
}

const ParameterButtons = memo(
  ({
    isolate,
    trash,
    activeDay,
    setSelectedEvents,
    uncheckAll,
    paste,
    checkedResources,
    handleSetActiveDay,
    activeView,
    handleAddDriveBetweenEvent,
    calendarApi,
    isDeleteDisabled,
    isUnDeleteDisabled,
    hasCurrentDayHaveOptimizerJob,
    handleClickMakeEventsSandboxed,
    handleClickUndelete,
    // handleCreateEvent,
    // toggleModalOncall,
    handleAddUnavalabilities,
    handleAddAvalabilities,
    creatingUnavailabilites,
    creatingAvailabilites,
    handleRemoveUnavailabilities,
    weekExpanded,
    toggleWeekExpanded,
  }: IParameterButtonsProps) => {
    const dispatch = useAppDispatch();
    const calendar_start = useAppSelector(
      (state) => state.calendar.calendar_start,
    );
    const calendar_end = useAppSelector((state) => state.calendar.calendar_end);
    const current_branches = useAppSelector(
      (state) => state.calendar.current_branches,
    );

    const settingValuesStatsViewEnabled = useAppSelector(
      (state) => state.settings.settingValues.statsViewEnabled,
    );

    const isCurrentBranchLevelHighest = useAppSelector(
      (state) => state.calendar.isCurrentBranchLevelHighest,
    );
    const currentUser = useAppSelector((state) => state.auth.currentUser);
    const membership = useAppSelector(
      (state) => state.settings.settingsCompany.company.membership,
    );
    const sandboxMode = useAppSelector((state) => state.calendar.sandboxMode);
    const includeDeleted = useAppSelector(
      (state) => state.calendar.includeDeleted,
    );
    const schedulerLocked = useAppSelector(
      (state) => state.settings.schedulerLocked,
    );
    const lockedParentBranches = useAppSelector(
      (state) => state.settings.lockedParentBranches,
    );
    const settingsCompanyLoading = useAppSelector(
      (state) => state.settings.settingsCompanyLoading,
    );
    const integrationEnabled =
      useAppSelector(
        (state) => state.settings.settingsCompany.integrationEnabled,
      ) ?? false;
    const companyIntegrations =
      useAppSelector((state) => state.settings.settingsCompany.integrations) ??
      [];

    const fetchingIntegrationLoading = useAppSelector(
      (state) => state.integration.fetchingIntegrationLoading,
    );
    const selectedIntegrationSoftware = useAppSelector(
      (state) => state.integration.selectedIntegrationSoftware,
    );
    const flaggingData = useAppSelector((state) => state.flagging.flaggingData);
    const isFlaggingEnabled = useAppSelector(
      (state) => state.flagging.flaggingEnabled,
    );
    const isOverbookingEnabled = useAppSelector(
      (state) => state.settings.settingValues.overbooking,
    );
    const isOptimizerResultsPreviewMode = useAppSelector(
      isOptimizerResultsPreviewModeSelector,
    );
    const newIntegrationSoftware = useAppSelector(
      newIntegrationSoftwareSelector,
    );
    const newIntegrationCheckingCredentials = useAppSelector(
      newIntegrationCheckingCredentialsSelector,
    );

    const sidebarOpen = useAppSelector(selectRightSidebarOpen);

    const toggleSidebarOpen = () => {
      dispatch(toggleRightSidebarOpen());
    };

    // Context for copy mode
    const { copyModeActive, toggleCopyMode } = useCalendarCopyModeContext();

    // Internal Hooks
    const { canRedo, canUndo, undo, redo, undoRedoLoading } = useUndoRedo();
    // Internal Hooks
    // const [creatingUnavailabilites, setCreatingUnavailabilites] =
    //   useState(false);

    const { handleNewIntegrate } = useNewIntegrationsCheckCredentials();

    const handleClickSchedulerLocked = () => {
      if (
        role_permissions(currentUser, 'canLockScheduler') &&
        lockedParentBranches.length === 0
      ) {
        dispatch(updateSchedulerLocked());
      }
    };

    // TODO Check CR integration
    const handleIntegrate = (platform: IntegrationTypes) => {
      dispatch({
        type: IntegrationActionTypes.SET_SELECTED_INTEGRATION_SOFTWARE,
        selectedIntegrationSoftware: platform,
      });

      if (platform === IntegrationTypes.THERALYTICS) {
        dispatch(fetchSyncedUsers());
      } else {
        dispatch({
          type: IntegrationActionTypes.SET_INTEGRATION_AUTH_TYPE,
          integrationAuthType: 'integration',
        });
        dispatch({
          type: IntegrationActionTypes.SET_INTEGRATION_MODAL,
          integrationLoginModal: true,
        });
      }
    };

    const handleClickStats = () => {
      const checked = !settingValuesStatsViewEnabled;
      dispatch(handleSettingValues('statsViewEnabled', checked));

      if (!checked) {
        dispatch(resetStatistics());
      } else {
        dispatch(
          fetchStatistics({
            start: calendar_start,
            end: calendar_end,
          }),
        ).then(() => {
          dispatch(
            checkNpsSurvey({
              chance: 1, // 100% chance to show NPS survey
            }),
          );
        });
      }
    };

    const handleChangeFlaggingEnabled = () => {
      const newValue = !isFlaggingEnabled;
      dispatch(setFlaggingEnabled(newValue));

      if (newValue) {
        dispatch(fetchFlaggingData()).then(({ success }) => {
          if (success) {
            dispatch(
              checkNpsSurvey({
                chance: 1, // 100% chance to show NPS survey
              }),
            );
          }
        });
      } else if (isOverbookingEnabled) {
        dispatch(
          setFlaggingData({
            constraints: (flaggingData?.constraints || []).filter(
              (item) => item.constraintType === 'overbooking',
            ),
          }),
        );
      } else {
        dispatch(setFlaggingData({ constraints: [] }));
      }
    };

    const handleFlaggingModalOpen = () => {
      dispatch(fetchFlaggingData());
      dispatch(showFlaggingModal());
      dispatch(setFlaggingFilterConstraintTypes([]));
    };

    const isCurrentBranchNotHighLevel =
      current_branches?.[0].level !== 3 && current_branches?.[0].level !== 4;

    const localTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const date = momentTimezone.parseZone(calendar_start);
    const formattedDate = date.tz(localTimeZone).format('YYYY-MM-DDTHH:mm:ssZ');

    return (
      <Stack
        direction='row'
        alignItems='center'
        justifyContent='center'
        marginBottom='1rem'
        // maxWidth='1200px'
        width='100%'
        alignSelf='center'
        flexWrap='wrap'
        rowGap='1rem'
        columnGap={2}
      >
        <AnimatedControlGroup timeout={400}>
          <CustomDatePicker
            // dateFormat='MM-dd-yyyy'
            selected={formattedDate}
            onChange={(date: any) => {
              calendarApi.gotoDate(date);
            }}
            disabled={isOptimizerResultsPreviewMode}
            containerStyle={undefined} // formatted
          />
        </AnimatedControlGroup>
        {role_permissions(currentUser, 'dataAccess') !== 'User' && (
          <AnimatedControlGroup timeout={500}>
            <CustomIconButton
              name='Everyone'
              disabled={isOptimizerResultsPreviewMode}
              onClick={() =>
                dispatch(handleSettingValues('isolatedResources', []))
              }
            >
              <PeopleAltOutlinedIcon {...iconProps()} />
            </CustomIconButton>
            <CustomIconButton
              name='Isolate'
              disabled={isOptimizerResultsPreviewMode}
              onClick={isolate}
            >
              <PersonOutlineOutlinedIcon {...iconProps()} />
            </CustomIconButton>
          </AnimatedControlGroup>
        )}
        {(role_permissions(currentUser, 'deleteEvent') ||
          (role_permissions(currentUser, 'createEvent') &&
            activeDay !== 'Month')) &&
          hasUserPermissionOnLockedScheduler(currentUser, schedulerLocked) && (
            <NestedButtonPopover
              renderRoot={(node) => (
                <AnimatedControlGroup timeout={600}>
                  {node}
                </AnimatedControlGroup>
              )}
              triggerIcon={
                <MoreVertIcon {...iconProps(settingValuesStatsViewEnabled)} />
              }
              actions={[
                ...(role_permissions(currentUser, 'deleteEvent')
                  ? [
                      {
                        render: ({ closePopover }: any) => (
                          <CustomIconButton
                            name='Trash'
                            onClick={() => {
                              trash();
                              closePopover();
                            }}
                            disabled={
                              isDeleteDisabled ||
                              isOptimizerResultsPreviewMode ||
                              hasCurrentDayHaveOptimizerJob
                            }
                          >
                            <DeleteOutlinedIcon
                              {...iconProps(false, 'delete-icon')}
                            />
                          </CustomIconButton>
                        ),
                      },
                    ]
                  : []),
                ...(role_permissions(currentUser, 'createEvent') &&
                activeDay !== 'Month'
                  ? [
                      {
                        render: ({ closePopover }: any) => (
                          <CustomIconButton
                            name='Copy'
                            disabled={isOptimizerResultsPreviewMode}
                            onClick={() => {
                              setSelectedEvents([]);
                              toggleCopyMode();
                              uncheckAll();
                              closePopover();
                            }}
                          >
                            <ContentCopyOutlinedIcon
                              {...iconProps(copyModeActive)}
                            />
                          </CustomIconButton>
                        ),
                      },
                      {
                        render: ({ closePopover }: any) => (
                          <CustomIconButton
                            name='Paste'
                            disabled={
                              isOptimizerResultsPreviewMode ||
                              hasCurrentDayHaveOptimizerJob
                            }
                            onClick={() => {
                              paste();
                              closePopover();
                            }}
                          >
                            <ContentPasteOutlinedIcon {...iconProps()} />
                          </CustomIconButton>
                        ),
                      },
                    ]
                  : []),
                ...(checkedResources.length > 0 &&
                role_permissions(currentUser, 'deleteAvailability')
                  ? [
                      {
                        render: ({ closePopover }: any) => (
                          <CustomIconButton
                            name='Remove Unavailability'
                            disabled={
                              isOptimizerResultsPreviewMode ||
                              hasCurrentDayHaveOptimizerJob
                            }
                            onClick={() => {
                              handleRemoveUnavailabilities();
                              closePopover();
                            }}
                          >
                            <RemoveCircleOutlineOutlinedIcon {...iconProps()} />
                          </CustomIconButton>
                        ),
                      },
                      {
                        render: ({ closePopover }: any) => (
                          <CustomIconButton
                            name='Add Unavailability'
                            onClick={() => {
                              handleAddUnavalabilities();
                              closePopover();
                            }}
                            disabled={
                              creatingUnavailabilites ||
                              isOptimizerResultsPreviewMode ||
                              hasCurrentDayHaveOptimizerJob
                            }
                          >
                            {creatingUnavailabilites ? (
                              <CircularProgress size={20} />
                            ) : (
                              <EventBusyIcon {...iconProps()} />
                            )}
                          </CustomIconButton>
                        ),
                      },
                      {
                        render: ({ closePopover }: any) => (
                          <CustomIconButton
                            name='Add Availability'
                            disabled={
                              creatingAvailabilites ||
                              isOptimizerResultsPreviewMode ||
                              hasCurrentDayHaveOptimizerJob
                            }
                            onClick={() => {
                              handleAddAvalabilities();
                              closePopover();
                            }}
                          >
                            <EventAvailableIcon {...iconProps()} />
                          </CustomIconButton>
                        ),
                      },
                    ]
                  : []),
                ...(sandboxMode
                  ? [
                      {
                        render: ({ closePopover }: any) => (
                          <CustomIconButton
                            name='Make Sandboxed'
                            onClick={() => {
                              handleClickMakeEventsSandboxed(true);
                              closePopover();
                            }}
                            disabled={
                              isDeleteDisabled ||
                              isOptimizerResultsPreviewMode ||
                              hasCurrentDayHaveOptimizerJob
                            }
                          >
                            <BookmarkAddedOutlinedIcon {...iconProps()} />
                          </CustomIconButton>
                        ),
                      },
                      {
                        render: ({ closePopover }: any) => (
                          <CustomIconButton
                            name='Make Unsandboxed'
                            onClick={() => {
                              handleClickMakeEventsSandboxed(false);
                              closePopover();
                            }}
                            disabled={
                              isDeleteDisabled ||
                              isOptimizerResultsPreviewMode ||
                              hasCurrentDayHaveOptimizerJob
                            }
                          >
                            <BookmarkRemoveOutlinedIcon {...iconProps()} />
                          </CustomIconButton>
                        ),
                      },
                    ]
                  : []),
                ...(includeDeleted
                  ? [
                      {
                        render: ({ closePopover }: any) => (
                          <CustomIconButton
                            name='Undelete'
                            onClick={() => {
                              handleClickUndelete();
                              closePopover();
                            }}
                            disabled={isUnDeleteDisabled}
                          >
                            <RestoreFromTrashIcon
                              {...iconProps(false, 'restore-icon')}
                            />
                          </CustomIconButton>
                        ),
                      },
                    ]
                  : []),
              ]}
              direction='row'
              tooltip='Actions'
            />
          )}

        <AnimatedControlGroup timeout={700}>
          <NestedButtonPopover
            triggerIcon={
              <ViewDayOutlinedIcon
                {...iconProps(settingValuesStatsViewEnabled)}
              />
            }
            actions={[
              {
                render: ({ closePopover }: any) => (
                  <CustomIconButton
                    name='Day'
                    disabled={isOptimizerResultsPreviewMode}
                    onClick={() => {
                      handleSetActiveDay('day', 'Day');
                      closePopover();
                    }}
                    id='DayControlButtonGroup'
                    data-qa='calendar-day-view'
                  >
                    <LetterIconText isActive={activeDay === 'Day'}>
                      D
                    </LetterIconText>
                  </CustomIconButton>
                ),
              },
              {
                render: ({ closePopover }: any) => (
                  <CustomIconButton
                    name='Week'
                    disabled={isOptimizerResultsPreviewMode}
                    onClick={() => {
                      handleSetActiveDay('day', 'Week');
                      closePopover();
                    }}
                    id='WeekControlButtonGroup'
                    data-qa='calendar-weekly-view'
                  >
                    <LetterIconText isActive={activeDay === 'Week'}>
                      W
                    </LetterIconText>
                  </CustomIconButton>
                ),
              },
              {
                render: ({ closePopover }: any) => (
                  <CustomIconButton
                    name={
                      isCurrentBranchLevelHighest
                        ? 'Month'
                        : 'You need to be in the Lowest Branch Type to use Month view!'
                    }
                    onClick={() => {
                      handleSetActiveDay('day', 'Month');
                      closePopover();
                    }}
                    disabled={
                      !isCurrentBranchLevelHighest ||
                      isOptimizerResultsPreviewMode
                    }
                    data-qa='calendar-monthly-view'
                  >
                    <LetterIconText isActive={activeDay === 'Month'}>
                      M
                    </LetterIconText>
                  </CustomIconButton>
                ),
              },
            ]}
            direction='row'
            tooltip='Switch calendar view'
            data-qa='calendar-daily-view'
          />
          {activeDay === 'Week' && activeView === 'Timeline' && (
            <CustomIconButton
              id='ExpandWeekView'
              name={weekExpanded ? 'Collapse Week View' : 'Expand Week View'}
              onClick={() => {
                toggleWeekExpanded();
              }}
            >
              <Box
                display='flex'
                alignItems='center'
                justifyContent='center'
                width='20px'
                height='20px'
                p='1px'
              >
                <Suspense>
                  {!weekExpanded ? (
                    <ExpandIcon {...(iconProps() as any)} />
                  ) : (
                    <CollapseIcon {...(iconProps(true) as any)} />
                  )}
                </Suspense>
              </Box>
            </CustomIconButton>
          )}
        </AnimatedControlGroup>

        <NestedButtonPopover
          renderRoot={(node) => (
            <AnimatedControlGroup timeout={800}>{node}</AnimatedControlGroup>
          )}
          triggerIcon={
            <ViewModuleOutlinedIcon
              {...iconProps(settingValuesStatsViewEnabled)}
            />
          }
          actions={[
            {
              render: ({ closePopover }: any) => (
                <CustomIconButton
                  name='Timeline'
                  onClick={() => {
                    handleSetActiveDay('view', 'Timeline');
                    closePopover();
                  }}
                  disabled={
                    activeDay === 'Month' || isOptimizerResultsPreviewMode
                  }
                >
                  <LetterIconText isActive={activeView === 'Timeline'}>
                    T
                  </LetterIconText>
                </CustomIconButton>
              ),
            },
            {
              render: ({ closePopover }: any) => (
                <CustomIconButton
                  name={
                    isCurrentBranchLevelHighest
                      ? 'Timegrid'
                      : 'You need to be in the Lowest Branch Type to use TimeGrid view!'
                  }
                  onClick={() => {
                    handleSetActiveDay('view', 'Timegrid');
                    closePopover();
                  }}
                  disabled={
                    !isCurrentBranchLevelHighest ||
                    isOptimizerResultsPreviewMode
                  }
                  id='TimelGridineControlButtonGroup'
                >
                  <LetterIconText isActive={activeView === 'Timegrid'}>
                    G
                  </LetterIconText>
                </CustomIconButton>
              ),
            },
          ]}
          direction='row'
          tooltip='Switch calendar layout'
          data-qa='calendar-timeline'
        />
        {/* <div className='control-button-group'>
        <CustomIconButton
          name='List'
          onClick={() => handleSetActiveDay('view', 'List')}
        >
          <LetterIconText isActive={activeView === 'List'}>L</LetterIconText>
        </CustomIconButton>
      </div> */}
        <AnimatedControlGroup timeout={900}>
          {undoRedoLoading ? (
            <CircularProgress size={20} />
          ) : (
            <>
              <CustomIconButton
                name='Undo'
                onClick={undo}
                disabled={
                  !canUndo ||
                  isOptimizerResultsPreviewMode ||
                  hasCurrentDayHaveOptimizerJob
                }
                id='UndoControlButtonGroup'
                data-qa='undo-button'
              >
                <UndoOutlinedIcon {...iconProps()} />
              </CustomIconButton>
              <CustomIconButton
                name='Redo'
                onClick={redo}
                disabled={
                  !canRedo ||
                  isOptimizerResultsPreviewMode ||
                  hasCurrentDayHaveOptimizerJob
                }
                id='RedoControlButtonGroup'
                data-qa='undo-button'
              >
                <RedoOutlinedIcon {...iconProps()} />
              </CustomIconButton>
            </>
          )}
        </AnimatedControlGroup>
        {role_permissions(currentUser, 'viewReport') && (
          <AnimatedControlGroup timeout={1000}>
            {role_permissions(currentUser, 'viewReport') && (
              <CustomIconButton
                name='Stats Quick View'
                onClick={handleClickStats}
                id='StatsQuickViewControlButtonGroup'
                disabled={isOptimizerResultsPreviewMode}
              >
                <PercentOutlinedIcon
                  {...iconProps(settingValuesStatsViewEnabled)}
                />
              </CustomIconButton>
            )}
            <NestedButtonPopover
              triggerIcon={
                <PublishOutlinedIcon
                  {...iconProps(settingValuesStatsViewEnabled)}
                />
              }
              actions={[
                ...(role_permissions(currentUser, 'viewReport') &&
                isCurrentBranchNotHighLevel
                  ? [
                      {
                        render: ({ closePopover }: any) => (
                          <CustomIconButton
                            name='Download Table as a PDF'
                            onClick={() => {
                              dispatch(togglePdfModalOpen());
                              closePopover();
                            }}
                            disabled={isOptimizerResultsPreviewMode}
                          >
                            <FileDownloadOutlinedIcon {...iconProps()} />
                          </CustomIconButton>
                        ),
                      },
                    ]
                  : []),
                {
                  render: ({ closePopover }: any) => (
                    <CustomIconButton
                      name='Export Calendar File'
                      onClick={() => {
                        dispatch(toggleExportCalendarModalOpen());
                        closePopover();
                      }}
                      disabled={isOptimizerResultsPreviewMode}
                    >
                      <FilePresentOutlinedIcon {...iconProps()} />
                    </CustomIconButton>
                  ),
                },
              ]}
              direction='row'
              tooltip='Download & Export tools '
            />
            <CustomIconButton
              name='Email and/or Mass Push Notification'
              onClick={() => {
                dispatch(toggleMailsModalOpen());
              }}
              disabled={isOptimizerResultsPreviewMode}
            >
              <SendToMobileOutlinedIcon {...iconProps()} />
            </CustomIconButton>
            {/* <CustomIconButton name='Oncall' onClick={toggleModalOncall}>
              <CallIcon {...iconProps()} />
            </CustomIconButton> */}
            <NestedButtonPopover
              triggerIcon={<ExtensionOutlinedIcon {...iconProps()} />}
              tooltip='Integrations'
              direction='row'
              spacing={1}
              actions={[
                // CENTRAL_REACH
                ...(integrationEnabled &&
                role_permissions(currentUser, 'integrationFeature') &&
                allowedIntegration(
                  IntegrationTypes.CENTRAL_REACH,
                  companyIntegrations,
                )
                  ? [
                      {
                        render: ({ closePopover }: any) => (
                          <CustomIconButton
                            name='Integration | Central Reach'
                            disabled={isOptimizerResultsPreviewMode}
                            onClick={() => {
                              handleIntegrate(IntegrationTypes.CENTRAL_REACH);
                              closePopover();
                            }}
                          >
                            {fetchingIntegrationLoading &&
                            selectedIntegrationSoftware ===
                              IntegrationTypes.CENTRAL_REACH ? (
                              <CircularProgress size={20} />
                            ) : (
                              <WorkspacesOutlinedIcon {...iconProps()} />
                            )}
                          </CustomIconButton>
                        ),
                      },
                    ]
                  : []),

                // RETHINK
                ...(integrationEnabled &&
                role_permissions(currentUser, 'integrationFeature') &&
                allowedIntegration(
                  IntegrationTypes.RETHINK,
                  companyIntegrations,
                )
                  ? [
                      {
                        render: ({ closePopover }: any) => (
                          <CustomIconButton
                            name='Integration | Rethink'
                            disabled={isOptimizerResultsPreviewMode}
                            onClick={() => {
                              handleIntegrate(IntegrationTypes.RETHINK);
                              closePopover();
                            }}
                          >
                            {fetchingIntegrationLoading &&
                            selectedIntegrationSoftware ===
                              IntegrationTypes.RETHINK ? (
                              <CircularProgress size={20} />
                            ) : (
                              <WorkspacesOutlinedIcon {...iconProps()} />
                            )}
                          </CustomIconButton>
                        ),
                      },
                    ]
                  : []),

                // THERALYTICS
                ...(integrationEnabled &&
                role_permissions(currentUser, 'integrationFeature') &&
                allowedIntegration(
                  IntegrationTypes.THERALYTICS,
                  companyIntegrations,
                )
                  ? [
                      {
                        render: ({ closePopover }: any) => (
                          <CustomIconButton
                            name='Integration | Theralytics'
                            disabled={isOptimizerResultsPreviewMode}
                            onClick={() => {
                              handleIntegrate(IntegrationTypes.THERALYTICS);
                              closePopover();
                            }}
                          >
                            {fetchingIntegrationLoading &&
                            selectedIntegrationSoftware ===
                              IntegrationTypes.THERALYTICS ? (
                              <CircularProgress size={20} />
                            ) : (
                              <WorkspacesOutlinedIcon {...iconProps()} />
                            )}
                          </CustomIconButton>
                        ),
                      },
                    ]
                  : []),

                // MEASURE_PM
                ...(integrationEnabled &&
                role_permissions(currentUser, 'integrationFeature') &&
                allowedIntegration(
                  IntegrationTypes.MEASURE_PM,
                  companyIntegrations,
                )
                  ? [
                      {
                        render: ({ closePopover }: any) => (
                          <CustomIconButton
                            name='Integration | MeasurePM'
                            disabled={isOptimizerResultsPreviewMode}
                            onClick={() => {
                              handleIntegrate(IntegrationTypes.MEASURE_PM);
                              closePopover();
                            }}
                          >
                            {fetchingIntegrationLoading &&
                            selectedIntegrationSoftware ===
                              IntegrationTypes.MEASURE_PM ? (
                              <CircularProgress size={20} />
                            ) : (
                              <WorkspacesOutlinedIcon {...iconProps()} />
                            )}
                          </CustomIconButton>
                        ),
                      },
                    ]
                  : []),

                //Hiding new integration for now
                // ...(integrationEnabled &&
                // role_permissions(currentUser, 'integrationFeature') &&
                // allowedIntegration(
                //   IntegrationTypes.RETHINK,
                //   companyIntegrations,
                // )
                //   ? [
                //       {
                //         render: ({ closePopover }: any) => (
                //           <CustomIconButton
                //             name='Integration | Rethink'
                //             disabled={isOptimizerResultsPreviewMode}
                //             onClick={() => {
                //               handleNewIntegrate('rethink');
                //               closePopover();
                //             }}
                //           >
                //             {newIntegrationCheckingCredentials &&
                //             newIntegrationSoftware === 'rethink' ? (
                //               <CircularProgress size={20} />
                //             ) : (
                //               <Box width='21px' height='21px'>
                //                 <RethinkLogoIcon />
                //               </Box>
                //             )}
                //           </CustomIconButton>
                //         ),
                //       },
                //     ]
                //   : []),

                //Hiding new integration for now
                // ...(integrationEnabled &&
                // role_permissions(currentUser, 'integrationFeature') &&
                // allowedIntegration(
                //   IntegrationTypes.THERAPY_PMS,
                //   companyIntegrations,
                // )
                //   ? [
                //       {
                //         render: ({ closePopover }: any) => (
                //           <CustomIconButton
                //             name='Integration | TherapyPMS'
                //             disabled={isOptimizerResultsPreviewMode}
                //             onClick={() => {
                //               handleNewIntegrate('therapypms');
                //               closePopover();
                //             }}
                //           >
                //             {newIntegrationCheckingCredentials &&
                //             newIntegrationSoftware === 'therapypms' ? (
                //               <CircularProgress size={20} />
                //             ) : (
                //               <Box width='21px' height='21px'>
                //                 <TherapyPmsLogoIcon />
                //               </Box>
                //             )}
                //           </CustomIconButton>
                //         ),
                //       },
                //     ]
                //   : []),
              ]}
            />
          </AnimatedControlGroup>
        )}
        {((role_permissions(currentUser, 'optimizerFeature') &&
          checkCompanyPlanFeature(membership, 'flagging')) ||
          (role_permissions(currentUser, 'flaggingFeature') &&
            checkCompanyPlanFeature(membership, 'flagging')) ||
          (role_permissions(currentUser, 'requestsFeature') &&
            checkCompanyPlanFeature(membership, 'requests')) ||
          role_permissions(currentUser, 'createAvailability')) && (
          <AnimatedControlGroup timeout={1100}>
            <NestedButtonPopover
              triggerIcon={<BuildOutlinedIcon {...iconProps()} />}
              tooltip='Advanced tools'
              direction='row'
              spacing={1}
              actions={[
                // Optimizer
                ...(checkCompanyPlanFeature(membership, 'optimizer') &&
                //activeDay !== 'Week' &&
                role_permissions(currentUser, 'optimizerFeature')
                  ? [
                      {
                        render: ({ closePopover }: any) => (
                          <CustomIconButton
                            name='Optimizer'
                            disabled={
                              isOptimizerResultsPreviewMode ||
                              hasCurrentDayHaveOptimizerJob
                            }
                            onClick={() => {
                              dispatch(toggleOptimizerModal());
                              closePopover();
                            }}
                          >
                            <SmartToyOutlinedIcon {...iconProps()} />
                          </CustomIconButton>
                        ),
                      },
                    ]
                  : []),

                // Constraints
                ...(checkCompanyPlanFeature(membership, 'optimizer') &&
                //activeDay !== 'Week' &&
                role_permissions(currentUser, 'optimizerFeature')
                  ? [
                      {
                        render: ({ closePopover }: any) => (
                          <CustomIconButton
                            name='Constraints'
                            disabled={isOptimizerResultsPreviewMode}
                            onClick={() => {
                              dispatch(toggleConstraintsModalOpen());
                              closePopover();
                            }}
                          >
                            <CompressOutlinedIcon {...iconProps()} />
                          </CustomIconButton>
                        ),
                      },
                    ]
                  : []),

                // Enable/Disable Flagging
                // FLAGGING actions
                ...(checkCompanyPlanFeature(membership, 'flagging') &&
                role_permissions(currentUser, 'flaggingFeature')
                  ? [
                      // 1) Enable / Disable toggle
                      {
                        render: ({ closePopover }: any) => (
                          <CustomIconButton
                            name={
                              isFlaggingEnabled
                                ? 'Disable Flagging'
                                : 'Enable Flagging'
                            }
                            disabled={isOptimizerResultsPreviewMode}
                            onClick={() => {
                              handleChangeFlaggingEnabled();
                            }}
                          >
                            {isFlaggingEnabled ? (
                              <FlagIcon {...iconProps()} />
                            ) : (
                              <FlagOutlinedIcon {...iconProps()} />
                            )}
                          </CustomIconButton>
                        ),
                      },
                      ...(isFlaggingEnabled || isOverbookingEnabled
                        ? [
                            {
                              render: ({ closePopover }: any) => (
                                <CustomIconButton
                                  name='Flagging'
                                  disabled={isOptimizerResultsPreviewMode}
                                  onClick={() => {
                                    handleFlaggingModalOpen();
                                    closePopover();
                                  }}
                                >
                                  <LaunchIcon {...iconProps()} />
                                </CustomIconButton>
                              ),
                            },
                          ]
                        : []),
                    ]
                  : []),
              ]}
            />
            {/* // Oncall */}
            {/* {role_permissions(currentUser, 'createAvailability') && (
                <CustomIconButton name='Oncall' onClick={toggleModalOncall}>
                  <CallIcon {...iconProps()} />
                </CustomIconButton>
              )} */}
            <NestedButtonPopover
              triggerIcon={<MapOutlinedIcon {...iconProps()} />}
              tooltip='Drive & Distance Tools'
              direction='row'
              spacing={1}
              actions={[
                ...(role_permissions(currentUser, 'optimizerFeature') &&
                checkCompanyPlanFeature(membership, 'optimizer') &&
                checkCompanyPlanFeature(membership, 'calculationOfDriveTime')
                  ? [
                      {
                        render: ({ closePopover }: any) => (
                          <CustomIconButton
                            name='Add Drive'
                            disabled={
                              isDeleteDisabled ||
                              isOptimizerResultsPreviewMode ||
                              hasCurrentDayHaveOptimizerJob
                            }
                            onClick={() => {
                              handleAddDriveBetweenEvent();
                              closePopover();
                            }}
                          >
                            <DriveEtaOutlinedIcon {...iconProps()} />
                          </CustomIconButton>
                        ),
                      },
                    ]
                  : []),

                // Distance / Time Calculator
                ...(checkCompanyPlanFeature(
                  membership,
                  'calculationOfDriveTime',
                )
                  ? [
                      {
                        render: ({ closePopover }: any) => (
                          <CustomIconButton
                            name='Distance/Time Calculator'
                            disabled={isOptimizerResultsPreviewMode}
                            onClick={() => {
                              dispatch(toggleDistanceModalOpen());
                              closePopover();
                            }}
                          >
                            <CalculateOutlinedIcon {...iconProps()} />
                          </CustomIconButton>
                        ),
                      },
                    ]
                  : []),
              ]}
            />
          </AnimatedControlGroup>
        )}
        <AnimatedControlGroup timeout={1200}>
          <NestedButtonPopover
            triggerIcon={<AssignmentOutlinedIcon {...iconProps()} />}
            tooltip='Requests & Approvals'
            direction='row'
            spacing={1}
            actions={[
              // Requests
              {
                render: ({ closePopover }: any) => (
                  <CustomIconButton
                    name='Requests'
                    disabled={isOptimizerResultsPreviewMode}
                    onClick={() => {
                      dispatch(toggleRequestsModalOpen());
                      closePopover();
                    }}
                  >
                    <ListAltIcon {...iconProps()} />
                  </CustomIconButton>
                ),
              },
              // Approvals (conditionally shown)
              ...(checkCompanyPlanFeature(membership, 'requests') &&
              role_permissions(currentUser, 'requestsFeature')
                ? [
                    {
                      render: ({ closePopover }: any) => (
                        <CustomIconButton
                          name='Approvals'
                          disabled={isOptimizerResultsPreviewMode}
                          onClick={() => {
                            dispatch(toggleApprovalsModalOpen());
                            closePopover();
                          }}
                        >
                          <DoneOutlineIcon {...iconProps()} />
                        </CustomIconButton>
                      ),
                    },
                  ]
                : []),
            ]}
          />
          {role_permissions(currentUser, 'canLockScheduler') && (
            <>
              {settingsCompanyLoading ? (
                <CircularProgress size={20} />
              ) : (
                <CustomIconButton
                  name={
                    lockedParentBranches.length > 0
                      ? `Parent branches locked: ${lockedParentBranches.join(
                          ' ,',
                        )}`
                      : schedulerLocked
                        ? 'Unlock Scheduler'
                        : 'Lock Scheduler'
                  }
                  onClick={handleClickSchedulerLocked}
                  disabled={
                    lockedParentBranches.length > 0 ||
                    isOptimizerResultsPreviewMode
                  }
                >
                  {schedulerLocked ? (
                    <LockOutlinedIcon {...iconProps(schedulerLocked)} />
                  ) : (
                    <LockOpenOutlinedIcon {...iconProps(schedulerLocked)} />
                  )}
                </CustomIconButton>
              )}
            </>
          )}
          <CustomIconButton
            name='Settings'
            disabled={isOptimizerResultsPreviewMode}
            onClick={() => {
              dispatch(toggleSettingsModalOpen());
            }}
          >
            <SettingsOutlinedIcon {...iconProps()} />
          </CustomIconButton>
          <CustomIconButton
            name='Filters'
            disabled={isOptimizerResultsPreviewMode}
            onClick={() => {
              dispatch(toggleFiltersModalOpen());
            }}
            data-qa='calendar-filters'
          >
            <TuneOutlinedIcon {...iconProps()} />
          </CustomIconButton>

          {!role_permissions(currentUser, 'createEvent') && (
            <CustomIconButton
              name='Toggle Side Bar'
              onClick={() => {
                toggleSidebarOpen();
              }}
              id='ToggleSideBarControlButtonGroup'
              disabled={isOptimizerResultsPreviewMode}
            >
              <RemoveRedEyeOutlinedIcon {...iconProps(sidebarOpen)} />
            </CustomIconButton>
          )}

          {/* {!sidebar && role_permissions(currentUser, 'createEvent') && (
            <CustomIconButton name='Create Event' onClick={handleCreateEvent}>
              <AddCircleOutlineOutlinedIcon {...iconProps()} />
            </CustomIconButton>
          )} */}
        </AnimatedControlGroup>
      </Stack>
    );
  },
);

export default ParameterButtons;

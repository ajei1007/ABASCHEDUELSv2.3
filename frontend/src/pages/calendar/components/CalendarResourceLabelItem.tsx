import { memo, useMemo } from 'react';
import role_permissions from 'helpers/role_permissions';
import {
  Stack,
  Typography,
  IconButton,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import ActionEditButton from 'components/ActionButtons/EditButton';
import FlagButton from './FlagButton';
import CONSTRAINT_TYPES_WITH_ICONS from '../utils/constraintTypesWithIcons';
import TAGS_TYPES_WITH_ICONS from '../utils/tagsWithIcons';
import CustomCheckboxBlock from 'components/CustomCheckboxBlock/CustomCheckboxBlock';
import CallOutlinedIcon from '@mui/icons-material/CallOutlined';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import { expandResource } from 'store/slices/calendar/thunks';
import { isOptimizerResultsPreviewModeSelector } from 'store/selectors/optimizerSelectors';
import { useCalendarSelectedResourcesContext } from '../context/CalendarSelectedResourcesContext';
import { useFullcalendarApiContext } from '../context/FullcalendarApiContext';
import {
  showFlaggingModal,
  setFlaggingFilterUsers,
  setFlaggingFilterConstraintTypes,
} from 'store/slices/flagging/actions';
import { selectFlaggingBeingFetchedResourcesSet } from 'store/slices/flagging/selectors';

interface ICalendarResourceLabelItem {
  activeView: string;
  id: string;
  title: string;
  email?: string | null;
  email1?: string | null;
  email2?: string | null;
  checked: boolean;
  currentUser: any;
  resourceType: string;
  callout: string;
  calloutBranchName: string;
  calloutColor: string;
  subgroupIconsJson: string;
  waitlisted: any;
  hasCurrentDayHaveOptimizerJob: boolean;
  handleClickEditButton: (_id: any, _resourceType: any) => void;
}
const CalendarResourceLabelItem = ({
  activeView,
  id,
  title,
  email,
  email1,
  email2,
  checked,
  currentUser,
  resourceType,
  callout,
  calloutBranchName,
  calloutColor,
  subgroupIconsJson,
  waitlisted,
  hasCurrentDayHaveOptimizerJob,
  handleClickEditButton,
}: ICalendarResourceLabelItem) => {
  const dispatch = useAppDispatch();
  const flaggingDataConstrainsts = useAppSelector(
    (state) => state.flagging?.flaggingData?.constraints,
  );
  const storeSettingsValuesOverbooking = useAppSelector(
    (state) => state.settings.settingValues?.overbooking,
  );
  const storeSettingsValuesEmptyAvailability = useAppSelector(
    (state) => state.settings.settingValues?.emptyAvailability,
  );
  const storeSettingsValuesNotAvailableBusy = useAppSelector(
    (state) => state.settings.settingValues?.notAvailableBusy,
  );
  const storeCurrentBranches = useAppSelector(
    (state) => state.calendar.current_branches,
  );
  const isOptimizerResultsPreviewMode = useAppSelector(
    isOptimizerResultsPreviewModeSelector,
  );

  const flaggingBeingFetchedResourcesSet = useAppSelector(
    selectFlaggingBeingFetchedResourcesSet,
  );

  // Context for selected resources
  const { selectSingleResource } = useCalendarSelectedResourcesContext();

  // Context for FullCalendar API
  const { updateCalendarSize } = useFullcalendarApiContext();

  const flaggingBeingFetchedForResource = useMemo(
    () => flaggingBeingFetchedResourcesSet.has(id),
    [flaggingBeingFetchedResourcesSet, id],
  );

  const { flagged, brokenConstraints } = useMemo(() => {
    let _flagged = false;
    let _brokenConstraints = [];

    const flaggingConstraints = flaggingDataConstrainsts;
    if (flaggingConstraints?.length) {
      const userConstraints = flaggingConstraints.filter(
        (c: any) => c.userId === id,
      );
      if (userConstraints?.length) {
        const isOverbookingEnabled = storeSettingsValuesOverbooking;
        const isEmptyAvailabilityEnabled = storeSettingsValuesEmptyAvailability;
        const isNotAvailableBusyEnabled = storeSettingsValuesNotAvailableBusy;
        let ignoredConstraintTypes: string[] = [];
        if (!isOverbookingEnabled) {
          ignoredConstraintTypes.push('overbooking');
        } else {
          ignoredConstraintTypes = ignoredConstraintTypes.filter(
            (item) => item !== 'overbooking',
          );
        }
        if (!isEmptyAvailabilityEnabled) {
          ignoredConstraintTypes.push('emptyAvailability');
        } else {
          ignoredConstraintTypes = ignoredConstraintTypes.filter(
            (item) => item !== 'emptyAvailability',
          );
        }
        if (!isNotAvailableBusyEnabled) {
          ignoredConstraintTypes.push('notAvailableBusy');
        } else {
          ignoredConstraintTypes = ignoredConstraintTypes.filter(
            (item) => item !== 'notAvailableBusy',
          );
        }
        const userBrokenAndSpecificConstraints = userConstraints.filter(
          (c) => c.broken && !ignoredConstraintTypes.includes(c.constraintType),
        );

        if (userBrokenAndSpecificConstraints?.length) {
          _flagged = true;
          _brokenConstraints = userBrokenAndSpecificConstraints;
        }
      }
    }

    return {
      flagged: _flagged,
      brokenConstraints: _brokenConstraints,
    };
  }, [
    id,
    flaggingDataConstrainsts,
    storeSettingsValuesOverbooking,
    storeSettingsValuesEmptyAvailability,
    storeSettingsValuesNotAvailableBusy,
  ]);

  const {
    tagIcon,
    icons,
    lengthOfIcons,
    tagIcons,
    tagNames,
    colorIcon,
    subgroup_icons,
  } = useMemo(() => {
    let tagIcon = false;
    let colorIcon = 'red';

    const subgroup_icons_arrays = JSON.parse(subgroupIconsJson);
    const subgroup_icons = subgroup_icons_arrays?.map((t: any) => t[1]) || [];

    const icons = [];
    const tagIcons = [];
    const tagNames = [];
    if (subgroup_icons.length > 0) {
      tagIcon = true;
      for (let index = 0; index < subgroup_icons.length; index++) {
        const element = subgroup_icons[index];
        const tagFound = TAGS_TYPES_WITH_ICONS.find(
          (type) => type.value === element,
        )?.icon;
        if (tagFound) {
          tagIcons.push(tagFound);
          tagNames.push(subgroup_icons_arrays[index][0]);
        }
      }
    }

    let lengthOfIcons;

    if (brokenConstraints?.length) {
      const constraint = brokenConstraints[0];

      if (
        constraint.constraintType === 'authorization' &&
        constraint.actual < constraint.max
      ) {
        colorIcon = 'blue';
      }

      const matchingConstraint = CONSTRAINT_TYPES_WITH_ICONS.find(
        (type) => type.value === constraint.constraintType,
      );

      if (matchingConstraint) {
        icons.push(matchingConstraint.icon);
      }

      if (brokenConstraints.length > 1) {
        lengthOfIcons = <>{brokenConstraints.length - 1}</>;
      }
    }

    return {
      tagIcon,
      icons,
      lengthOfIcons,
      tagIcons,
      tagNames,
      colorIcon,
      subgroup_icons,
    };
  }, [brokenConstraints, subgroupIconsJson]);

  const handleClickEdit = () => {
    handleClickEditButton(id, resourceType);
  };

  const handleClickExpandResource = () => {
    if (storeCurrentBranches[0].bol) {
      dispatch(
        expandResource({
          id: id,
          type: resourceType,
        }),
      );
      updateCalendarSize();
    }
  };

  const handleCheckedResources = () => {
    selectSingleResource({
      value: id,
      label: title,
      type: resourceType,
      email,
      email1,
      email2,
    });
  };

  const handleClickResourceFlagging = (userObj: any) => {
    dispatch(showFlaggingModal());
    dispatch(setFlaggingFilterUsers([userObj]));
    dispatch(setFlaggingFilterConstraintTypes([]));
  };

  return (
    <Stack
      flexDirection={activeView === 'Timegrid' ? 'column' : 'row'}
      columnGap='0.25rem'
      alignItems='center'
      pl={1}
    >
      <Stack flexDirection='row' columnGap='2px' alignItems='center'>
        <CustomCheckboxBlock
          value={id}
          checked={checked}
          disabled={isOptimizerResultsPreviewMode}
          onChange={() => {
            handleCheckedResources();
          }}
        />
        {role_permissions(
          currentUser,
          resourceType === 'Activity' ? 'editActivity' : 'editUser',
        ) && (
          <ActionEditButton
            handleClick={handleClickEdit}
            disabled={
              isOptimizerResultsPreviewMode || hasCurrentDayHaveOptimizerJob
            }
          />
        )}
        {callout && (
          <Tooltip
            title={`On-Call${
              calloutBranchName ? `: ${calloutBranchName}` : ''
            }`}
            arrow
            placement='top'
          >
            <IconButton
              size='small'
              aria-label={title}
              sx={{
                color: calloutColor,
              }}
            >
              <CallOutlinedIcon fontSize='small' />
            </IconButton>
          </Tooltip>
        )}
        {waitlisted && (
          <Tooltip title={`Waitlisted`} arrow placement='top'>
            <IconButton
              size='small'
              aria-label={'Waitlisted'}
              sx={{ color: 'orange' }}
            >
              <AssignmentIcon fontSize='small' />
            </IconButton>
          </Tooltip>
        )}
        {tagIcon && tagIcons.length > 0 && (
          <FlagButton
            icons={[tagIcons[0]]}
            lengthOfIcons={tagIcons.length - 1}
            title={tagNames.map((constraint, index) => (
              <div className='fc-event-title-container' key={index}>
                <div
                  className='fc-event-title fc-sticky'
                  style={{ display: 'flex', alignItems: 'flex-start' }}
                >
                  {index + 1}.
                  {
                    TAGS_TYPES_WITH_ICONS.find(
                      (type) => type.value === subgroup_icons[index],
                    )?.icon
                  }
                  <div
                    style={{ textIndent: '5px' }}
                    dangerouslySetInnerHTML={{
                      __html: constraint,
                    }}
                  />
                </div>
              </div>
            ))}
          />
        )}
        {flagged &&
          (!flaggingBeingFetchedForResource ? (
            <FlagButton
              color={colorIcon}
              icons={icons}
              lengthOfIcons={lengthOfIcons}
              handleClick={() =>
                handleClickResourceFlagging({
                  value: id,
                  label: title,
                })
              }
              title={brokenConstraints.map((constraint, index) => {
                const brokenSessionsActuals = constraint?.brokenSessions
                  ?.filter((a: any) => a?.actual)
                  .map((a: any) => a?.actual)
                  .join(', ');
                return (
                  <div className='fc-event-title-container' key={index}>
                    <div
                      className='fc-event-title fc-sticky'
                      style={{ display: 'flex', alignItems: 'flex-start' }}
                    >
                      {index + 1}.
                      {
                        CONSTRAINT_TYPES_WITH_ICONS.find(
                          (type) => type.value === constraint.constraintType,
                        )?.icon
                      }
                      <div
                        style={{ textIndent: '5px' }}
                        dangerouslySetInnerHTML={{
                          __html:
                            constraint.description +
                            (brokenSessionsActuals
                              ? `. Actual: ${brokenSessionsActuals}`
                              : ''),
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            />
          ) : (
            <Tooltip
              title='Flagging data is being fetched...'
              arrow
              placement='top'
            >
              <CircularProgress
                size='1rem'
                sx={{
                  mr: 0.75,
                  mb: '1px',
                }}
              />
            </Tooltip>
          ))}
      </Stack>
      <Typography
        className={`resource-name ${
          storeCurrentBranches[0].bol &&
          !isOptimizerResultsPreviewMode &&
          'active'
        } ${flaggingBeingFetchedForResource ? 'shimmer-text' : ''}`}
        fontSize={'14px'}
        onClick={
          !isOptimizerResultsPreviewMode ? handleClickExpandResource : undefined
        }
      >
        {title}
      </Typography>
    </Stack>
  );
};

export type { ICalendarResourceLabelItem };
export default memo(CalendarResourceLabelItem);

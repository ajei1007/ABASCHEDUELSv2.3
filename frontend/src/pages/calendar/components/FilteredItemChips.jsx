import { memo, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Chip, Stack, Skeleton } from '@mui/material';
import { toast } from 'react-toastify';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import { useLatestCallback } from 'hooks/useLatestCallback';
import { handleSettingValues } from 'store/actions/settingsActions';
import { isOptimizerResultsPreviewModeSelector } from 'store/selectors/optimizerSelectors';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

const FilteredItemChips = memo(() => {
  const dispatch = useAppDispatch();
  const subgroupsFilter = useAppSelector(
    (state) => state.settings.settingValues.subgroupsFilter,
  );
  const storeSettingsValuesIsolatedResources = useAppSelector(
    (state) => state.settings.settingValues.isolatedResources,
  );
  const roleFilter = useAppSelector(
    (state) => state.settings.settingValues.roleFilter,
  );
  const blocks = useAppSelector((state) => state.settings.settingValues.blocks);
  const driveTime = useAppSelector(
    (state) => state.settings.settingValues.driveTime,
  );
  const driveDistanceMax = useAppSelector(
    (state) => state.settings.settingValues.driveDistanceMax,
  );
  const isOptimizerResultsPreviewMode = useAppSelector(
    isOptimizerResultsPreviewModeSelector,
  );
  const hideUsersWithNoAvailability = useAppSelector(
    (state) => state.settings.settingValues.hideUsersWithNoAvailability,
  );

  const isolatedResources = useMemo(
    () =>
      storeSettingsValuesIsolatedResources.map((item) => ({
        label: item.label,
        value: item.value,
        isLoading: item.label === item.value,
      })),
    [storeSettingsValuesIsolatedResources],
  );

  const notLoadedIsolatedResources = useMemo(
    () => isolatedResources.filter((resource) => resource.isLoading),
    [isolatedResources],
  );

  const fetchResources = useLatestCallback(
    async ({ notLoadedIsolatedResources, cancelToken }) => {
      try {
        const response = await axios.get(`/scheduler/resource-by-ids`, {
          params: {
            users: notLoadedIsolatedResources
              .map((item) => item.value)
              .join('|'),
          },
          cancelToken: cancelToken.token,
        });

        const resources = (response?.data || []).map((item) => ({
          value: item.id,
          label: item.title,
          type: item.type,
          email: item.email,
          email1: item.email1,
          email2: item.email2,
        }));

        if (resources.length === 0) {
          return;
        }

        dispatch(
          handleSettingValues('isolatedResources', [
            ...storeSettingsValuesIsolatedResources.filter(
              (item) =>
                !notLoadedIsolatedResources.some(
                  (resource) => resource.value === item.value,
                ),
            ),
            ...resources,
          ]),
        );
      } catch (err) {
        if (!axios.isCancel(err)) {
          const errMsg = err?.response?.data;
          toast.error(errMsg);
        }
      }
    },
  );

  useEffect(() => {
    if (notLoadedIsolatedResources.length === 0) {
      return;
    }

    const cancelToken = axios.CancelToken.source();
    fetchResources({
      notLoadedIsolatedResources,
      cancelToken,
    });

    return () => cancelToken.cancel();
  }, [notLoadedIsolatedResources, fetchResources]);

  if (
    isolatedResources.length > 0 ||
    roleFilter.length > 0 ||
    subgroupsFilter.length > 0 ||
    hideUsersWithNoAvailability
  )
    return (
      <Stack
        sx={{
          overflowY: 'hidden',
        }}
        mb={1}
      >
        <Stack
          direction='row'
          alignItems='center'
          spacing={1}
          overflow={'scroll'}
          py={1}
        >
          {false && (
            <Stack direction='row' alignItems='center' spacing={1}>
              {blocks && (
                <Chip
                  label='Blocks'
                  key='blocks'
                  variant='outlined'
                  icon={
                    <CheckCircleOutlineIcon
                      fontSize='small'
                      style={{ color: '#4d53e0' }}
                    />
                  }
                />
              )}
              {driveTime && (
                <Chip
                  label='Drive Time'
                  key='driveTime'
                  variant='outlined'
                  icon={
                    <CheckCircleOutlineIcon
                      fontSize='small'
                      style={{ color: '#4d53e0' }}
                    />
                  }
                />
              )}
              {driveDistanceMax && (
                <Chip
                  label='Distance'
                  key='Drive Distance'
                  variant='outlined'
                  icon={
                    <CheckCircleOutlineIcon
                      fontSize='small'
                      style={{ color: '#4d53e0' }}
                    />
                  }
                />
              )}
            </Stack>
          )}
          {isolatedResources.length > 0 && (
            <Stack direction='row' alignItems='center' spacing={1}>
              {isolatedResources.map((item) =>
                item.isLoading ? (
                  <Skeleton
                    key={`${item.value}-skeleton`}
                    width={140}
                    height={30}
                    variant='rounded'
                    sx={{
                      borderRadius: '100px',
                    }}
                  />
                ) : (
                  <Chip
                    label={item?.label}
                    key={item?.value}
                    variant='outlined'
                    onDelete={
                      !isOptimizerResultsPreviewMode
                        ? () => {
                            const updatedIsolatedResources =
                              storeSettingsValuesIsolatedResources.filter(
                                (resource) => resource?.value !== item?.value,
                              );
                            dispatch(
                              handleSettingValues(
                                'isolatedResources',
                                updatedIsolatedResources,
                              ),
                            );
                          }
                        : undefined
                    }
                  />
                ),
              )}
            </Stack>
          )}
          {roleFilter.length > 0 && (
            <Stack direction='row' alignItems='center' spacing={1}>
              {roleFilter.map((item, index) => (
                <Chip
                  label={item}
                  key={index}
                  variant='outlined'
                  onDelete={
                    !isOptimizerResultsPreviewMode
                      ? () => {
                          const updatedRoleFilter = roleFilter.filter(
                            (filter) => filter !== item,
                          );
                          dispatch(
                            handleSettingValues(
                              'roleFilter',
                              updatedRoleFilter,
                            ),
                          );
                        }
                      : undefined
                  }
                />
              ))}
            </Stack>
          )}
          {subgroupsFilter.length > 0 && (
            <Stack direction='row' alignItems='center' spacing={1}>
              {subgroupsFilter.map((item, index) => (
                <Chip
                  label={item}
                  key={index}
                  variant='outlined'
                  onDelete={
                    !isOptimizerResultsPreviewMode
                      ? () =>
                          dispatch(
                            handleSettingValues(
                              'subgroupsFilter',
                              subgroupsFilter.filter(
                                (filter) => filter !== item,
                              ),
                            ),
                          )
                      : undefined
                  }
                />
              ))}
            </Stack>
          )}
          {hideUsersWithNoAvailability && (
            <Stack direction='row' alignItems='center' spacing={1}>
              <Chip
                label='Hide Users with no Availability'
                key='users'
                variant='outlined'
                onDelete={() =>
                  dispatch(
                    handleSettingValues('hideUsersWithNoAvailability', false),
                  )
                }
              />
            </Stack>
          )}
        </Stack>
      </Stack>
    );

  return null;
});
export default FilteredItemChips;

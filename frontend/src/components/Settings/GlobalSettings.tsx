import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import { useLatestCallback } from 'hooks/useLatestCallback';
import CustomModal from '../Modal';
import CustomButton from '../Button';
import { Stack, Grid2 as Grid, Typography, Tooltip } from '@mui/material';
import CustomSelect from '../CustomSelect/CustomSelect';
import { getTimeZones } from '../../utils/timezones';
import {
  handleSettingValues,
  saveDefaultSettings,
  updateAlias,
} from 'store/actions/settingsActions';
import { resetExpandedResources } from 'store/slices/calendar/actions';
import CustomSwitch from 'components/CustomSwitch/CustomSwitch';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import role_permissions from 'helpers/role_permissions';

interface SettingProps {
  modalSetting: boolean;
  setModalSetting: (value: boolean) => void;
  toggleModalSetting: () => void;
}

const GlobalSettings: React.FC<SettingProps> = ({
  modalSetting,
  setModalSetting,
  toggleModalSetting,
}) => {
  const dispatch = useAppDispatch();
  const { timezone, branchDefault } = useSelector(
    (state: any) => state.settings.settingValues,
  );
  const settingsCompany = useAppSelector(
    (state: any) => state.settings.settingsCompany,
  );
  const currentUser = useAppSelector((state: any) => state.auth.currentUser);
  // Local state for timezone & branch selection
  const [selectGlobalTimezone, setGlobalTimezone] = useState<string | null>(
    timezone,
  );
  const [selectGlobalBranch, setGlobalBranch] = useState<string | null>(
    branchDefault,
  );
  const [selectGlobalAlias, setGlobalAlias] = useState<boolean>(false);
  const [selectGlobalAliasFormat, setGlobalAliasFormat] = useState<
    string | null
  >(null);

  const [branches, setBranches] = useState<any[]>([]);
  const [branchesFetchStatus, setBranchesFetchStatus] = useState<
    'loading' | 'success' | 'failed' | 'initial'
  >('initial');

  const fetchBranches = useLatestCallback(async () => {
    if (['loading', 'success'].includes(branchesFetchStatus)) {
      return;
    }

    setBranchesFetchStatus('loading');
    try {
      const response = await axios.get('/scheduler/branches', {});
      setBranches(response.data);
      setBranchesFetchStatus('success');
    } catch (err) {
      setBranchesFetchStatus('failed');
      console.error('Error fetching branches:', err);
    }
  });

  useEffect(() => {
    setGlobalAlias(settingsCompany?.isAlias ?? false);
    setGlobalAliasFormat(settingsCompany?.aliasFormatType ?? null);
  }, [settingsCompany]);

  // Fetch branches from API using Axios
  useEffect(() => {
    if (modalSetting) {
      fetchBranches();
    }
  }, [fetchBranches, modalSetting]);

  // Reset local state when modal is opened
  useEffect(() => {
    if (modalSetting) {
      setGlobalTimezone(timezone);
      setGlobalBranch(branchDefault);
    }
  }, [modalSetting, timezone, branchDefault]);

  const handleSetDefaultSettings = async () => {
    try {
      if (selectGlobalBranch || selectGlobalTimezone) {
        // Find the correct branch within the grouped structure
        const selectedBranch = branches
          .flatMap((group) => group.options) // Flatten all branch options
          .find((branch) => branch.value === selectGlobalBranch); // Find the selected branch by id

        if (selectedBranch) {
          const selectedBranchName = selectedBranch?.label || '';
          dispatch(resetExpandedResources());
          dispatch(handleSettingValues('branchDefault', selectGlobalBranch)); // Save branch in Redux
          dispatch(
            handleSettingValues('branchDefaultName', selectedBranchName),
          );
        }

        if (selectGlobalTimezone) {
          dispatch(handleSettingValues('timezone', selectGlobalTimezone));
        }
      }

      await dispatch(saveDefaultSettings()); // Ensure Redux saves changes

      // Save alias and alias format type
      await dispatch(updateAlias(selectGlobalAlias, selectGlobalAliasFormat));
    } catch (err) {
      console.error('Error setting default settings:', err);
    } finally {
      toggleModalSetting();
      window.location.reload();
    }
  };

  const handleTimezoneChange = (data: any) => {
    setGlobalTimezone(data.value);
    dispatch(handleSettingValues('timezone', data.value));
  };

  const handleAliasChange = () => {
    const newAlias = !selectGlobalAlias;
    setGlobalAlias(newAlias);
  };

  return (
    <CustomModal
      open={modalSetting}
      onClose={() => setModalSetting(false)}
      aria-labelledby='Global Settings Modal'
      aria-describedby='Global Settings Modal For Entire Application'
      title='Global Settings'
      actionbuttons={
        <>
          <CustomButton onClick={handleSetDefaultSettings}>
            Save As Default
          </CustomButton>
          <CustomButton onClick={toggleModalSetting} variant='outlined'>
            Cancel
          </CustomButton>
        </>
      }
    >
      <Stack spacing={1}>
        <Stack>
          <p>Account Settings</p>
          <Grid>
            {/* Timezone Selection */}
            <Grid>
              <label>Timezone</label>
              <CustomSelect
                menuPlacement='bottom'
                options={getTimeZones().map((val: any) => ({
                  ...val,
                  value: val.id,
                }))}
                value={getTimeZones().find(
                  (t: any) => t.id === selectGlobalTimezone,
                )}
                onChange={handleTimezoneChange}
              />
            </Grid>

            {/* Branch Selection */}
            <Grid mt={1}>
              <label>Branch</label>
              <CustomSelect
                options={branches} // Grouped branches by type
                value={
                  branches
                    .flatMap((group) => group.options)
                    .find((branch) => branch.value === selectGlobalBranch) ||
                  null
                }
                isLoading={branchesFetchStatus === 'loading'}
                onChange={(data: any) => setGlobalBranch(data.value)}
              />
            </Grid>
          </Grid>
        </Stack>

        {role_permissions(currentUser, 'editUser') && (
          <Stack>
            <p>Company Settings</p>
            <Grid mt={2}>
              <Stack direction='row' alignItems='center' spacing={1}>
                <CustomSwitch
                  checked={selectGlobalAlias}
                  onChange={() => handleAliasChange()}
                  data-qa='global-alias-toggle'
                />
                <Typography color='#6b859e' fontSize='0.875rem'>
                  Use Alias
                </Typography>
                <Tooltip
                  title='You can allow this feature for specific roles, and change this in the user settings'
                  placement='right'
                  arrow
                >
                  <button
                    id='MagicButtonTooltip'
                    className='magic-button'
                    type='button'
                  >
                    <HelpOutlineIcon
                      fontSize='medium'
                      style={{ color: '#6b859e' }}
                    />
                  </button>
                </Tooltip>
              </Stack>
              <Grid mt={1}>
                <label>Alias Format</label>
                <CustomSelect
                  isDisabled={!selectGlobalAlias}
                  options={[
                    { label: 'Jo Do', value: 'Jo Do' },
                    { label: 'JoDo', value: 'JoDo' },
                    { label: 'DoJo', value: 'DoJo' },
                    { label: 'J.D.', value: 'J.D.' },
                  ]}
                  value={
                    selectGlobalAliasFormat
                      ? {
                          label: selectGlobalAliasFormat,
                          value: selectGlobalAliasFormat,
                        }
                      : null
                  }
                  onChange={(data: any) =>
                    setGlobalAliasFormat(data?.value ?? null)
                  }
                />
              </Grid>
            </Grid>
          </Stack>
        )}
      </Stack>
    </CustomModal>
  );
};

export default GlobalSettings;

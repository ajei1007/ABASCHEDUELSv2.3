import CustomModal from 'components/Modal';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import IntegrationLoginForm from './IntegrationLoginForm';
import { Stack, Tab, Tabs } from '@mui/material';
import CustomButton from 'components/Button';
import SyncOutlinedIcon from '@mui/icons-material/SyncOutlined';
import WorkspacesOutlinedIcon from '@mui/icons-material/WorkspacesOutlined';
import UndynamicTable from '../UndynamicTable';
import { integrateNow, syncUsers } from 'store/actions/integrationAction';
import { useMemo, useState, memo } from 'react';
import TabPanel from 'components/TabPanel/TabPanel';
import CustomInput from 'components/CustomInputModal/CustomInput';
import CustomSelect from 'components/CustomSelect/CustomSelect';
import { syncPastUpdatesOptions } from 'pages/calendar/constants';
import { IntegrationActionTypes } from 'types/redux/integrations';

const syncedUsersCols = [
  {
    accessorKey: 'user',
    header: 'User',
    Cell: (row) => {
      const firstName = row?.row.original?.firstName;
      const lastName = row?.row.original?.lastName ?? '';
      return `${firstName} ${lastName}`;
    },
    size: 160,
    enableEditing: false,
  },
  {
    accessorKey: 'userType',
    header: 'Type',
    Cell: (row) => {
      const userType = row?.row.original?.userType;
      if (userType) {
        return userType.charAt(0).toUpperCase() + userType.slice(1);
      }
      return '';
    },
    size: 160,
    enableEditing: false,
  },
];

const IntegrationModal = () => {
  const dispatch = useAppDispatch();
  const integrationLoginModal = useAppSelector(
    (state) => state.integration.integrationLoginModal,
  );
  const integrationAuthType = useAppSelector(
    (state) => state.integration.integrationAuthType,
  );
  const fetchingIntegrationLoading = useAppSelector(
    (state) => state.integration.fetchingIntegrationLoading,
  );
  const selectedIntegrationSoftware = useAppSelector(
    (state) => state.integration.selectedIntegrationSoftware,
  );
  const syncedUsers = useAppSelector((state) => state.integration.syncedUsers);
  const failedUsers = useAppSelector((state) => state.integration.failedUsers);
  //
  const [selectedTab, setSelectedTab] = useState(0);
  const [searchSynced, setSearchSynced] = useState('');
  const [searchFailed, setSearchFailed] = useState('');
  const [syncEventUpdatedInThePast, setSyncEventUpdatedInThePast] = useState(
    syncPastUpdatesOptions[0],
  );

  const handleChangeTab = (_, newValue) => {
    setSelectedTab(newValue);
  };

  const handleSyncUsers = () => {
    dispatch(syncUsers(null, syncEventUpdatedInThePast.value));
  };

  const handleIntegrate = () => {
    dispatch(integrateNow(null, syncEventUpdatedInThePast.value));
  };

  const toggleModal = () => {
    dispatch({
      type: IntegrationActionTypes.SET_INTEGRATION_MODAL,
      integrationLoginModal: !integrationLoginModal,
    });
    dispatch({
      type: IntegrationActionTypes.SET_THERA_QUESTIONS_AND_ANSWERS,
      payload: null,
    });
  };

  const filteredSyncedUsers = useMemo(() => {
    return syncedUsers.filter((row) => {
      const label = `${row?.firstName} ${row?.lastName || ''}`;
      return label.toLowerCase().includes(searchSynced.toLowerCase());
    });
  }, [syncedUsers, searchSynced]);

  const filteredFailedUsers = useMemo(() => {
    return failedUsers.filter((row) => {
      const label = `${row?.firstName} ${row?.lastName || ''}`;
      return label.toLowerCase().includes(searchFailed.toLowerCase());
    });
  }, [failedUsers, searchFailed]);

  const actionButtons = !integrationAuthType ? (
    <Stack
      flexDirection='row'
      justifyContent={
        integrationAuthType !== 'sync' ? 'space-between' : 'flex-end'
      }
      alignItems='center'
      width={'100%'}
    >
      <Stack flexDirection='row' alignItems='center' columnGap={1}>
        <label>Sync events updated in the past </label>
        <Stack width='120px'>
          <CustomSelect
            options={syncPastUpdatesOptions}
            value={syncEventUpdatedInThePast}
            onChange={(val) => setSyncEventUpdatedInThePast(val)}
          />
        </Stack>
      </Stack>
      <Stack
        flexDirection='row'
        justifyContent='center'
        alignItems='center'
        columnGap={1}
      >
        <CustomButton
          variant='outlined'
          startIcon={<SyncOutlinedIcon />}
          onClick={handleSyncUsers}
          loading={fetchingIntegrationLoading}
        >
          Sync Users
        </CustomButton>
        <CustomButton
          startIcon={<WorkspacesOutlinedIcon />}
          onClick={handleIntegrate}
          loading={fetchingIntegrationLoading}
        >
          Integrate
        </CustomButton>
      </Stack>
    </Stack>
  ) : null;
  return (
    <CustomModal
      maxWidth='md'
      open={integrationLoginModal}
      // hideClose
      onClose={toggleModal}
      aria-labelledby='Integration Login Modal'
      aria-describedby='Integration Login Modal'
      title={
        !integrationAuthType
          ? `${selectedIntegrationSoftware} Integration`
          : `${selectedIntegrationSoftware} Login`
      }
      actionbuttons={actionButtons}
    >
      {!integrationAuthType ? (
        <Stack>
          <Tabs value={selectedTab} onChange={handleChangeTab}>
            <Tab label='Synced Users' style={{ maxWidth: 'unset' }} />
            <Tab label='Failed Users' style={{ maxWidth: 'unset' }} />
          </Tabs>
          <TabPanel value={selectedTab} index={0}>
            <Stack marginTop={2} rowGap={1}>
              <CustomInput
                name='search'
                placeholder='Search'
                onChange={(e) => setSearchSynced(e.target.value)}
                value={searchSynced}
              />
              <UndynamicTable
                columns={syncedUsersCols}
                rows={filteredSyncedUsers}
              />
            </Stack>
          </TabPanel>
          <TabPanel value={selectedTab} index={1}>
            <Stack marginTop={2} rowGap={1}>
              <CustomInput
                name='search'
                placeholder='Search'
                onChange={(e) => setSearchFailed(e.target.value)}
                value={searchFailed}
              />
              <UndynamicTable
                columns={syncedUsersCols}
                rows={filteredFailedUsers}
              />
            </Stack>
          </TabPanel>
        </Stack>
      ) : (
        <IntegrationLoginForm
          toggleModal={toggleModal}
          syncEventUpdatedInThePast={syncEventUpdatedInThePast}
          setSyncEventUpdatedInThePast={setSyncEventUpdatedInThePast}
        />
      )}
    </CustomModal>
  );
};

export default memo(IntegrationModal);

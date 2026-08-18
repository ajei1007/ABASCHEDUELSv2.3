import { Stack } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import CustomButton from 'components/Button';
import SyncOutlinedIcon from '@mui/icons-material/SyncOutlined';
import CustomSelect from 'components/CustomSelect/CustomSelect';
import {
  importPastUpdatesOptions,
  syncPastUpdatesOptions,
} from 'pages/calendar/constants';
import { useState } from 'react';
import { useRethinkEventsIntegrate } from 'pages/calendar/hooks/new-integrations/rethink/useRethinkEventsIntegrate';
import { useAppSelector } from 'store/hooks';
import { useRethinkEventsImport } from 'pages/calendar/hooks/new-integrations/rethink/useRethinkEventsImport';

const RethinkTabPanelEvents = ({ onCancel }: { onCancel: () => void }) => {
  const currentBranch = useAppSelector(
    (state) => state.calendar.current_branches,
  );

  const [syncEventUpdatedInThePast, setSyncEventUpdatedInThePast] = useState(
    syncPastUpdatesOptions[0],
  );
  const [importEventsUpdatedInThePast, setImportEventsUpdatedInThePast] =
    useState(importPastUpdatesOptions[0]);

  const { integrateEvents, loading: loadingSync } = useRethinkEventsIntegrate();
  const { importEvents, loading: loadingImport } = useRethinkEventsImport();

  const onClickIntegrate = async () => {
    await integrateEvents({
      branches: currentBranch.map((e: any) => e.value).join('|'),
      syncEventUpdatedInThePast: syncEventUpdatedInThePast.value,
    });
  };

  const onClickImport = async () => {
    await importEvents({
      branches: currentBranch.map((e: any) => e.value).join('|'),
      importEventsUpdatedInThePast: importEventsUpdatedInThePast.value,
    });
  };

  return (
    <div>
      <Stack minHeight='300px' direction='column' spacing='1.5rem'></Stack>
      <Stack
        flexDirection='row'
        justifyContent='flex-end'
        alignItems='center'
        marginTop={4}
        width={'100%'}
      >
        <Stack width={'100%'} spacing={2}>
          <Stack flexDirection='row' columnGap={2}>
            {/* Import events in the past */}
            <Stack
              flex={1}
              flexDirection='row'
              alignItems='end'
              justifyContent='space-between'
              columnGap={1}
              p={2}
              borderRadius={3}
              style={{ backgroundColor: '#f7f8fb' }}
            >
              <Stack alignItems='start' justifyContent='center' columnGap={1}>
                <label>Import events in the past </label>
                <Stack width='150px'>
                  <CustomSelect
                    options={importPastUpdatesOptions}
                    value={importEventsUpdatedInThePast}
                    onChange={(val: any) =>
                      setImportEventsUpdatedInThePast(val)
                    }
                  />
                </Stack>
              </Stack>
              <CustomButton
                startIcon={<DownloadIcon />}
                type='button'
                variant='outlined'
                onClick={onClickImport}
                loading={loadingImport}
              >
                Import Events
              </CustomButton>
            </Stack>
            <Stack
              flex={1}
              flexDirection='row'
              alignItems='end'
              justifyContent='space-between'
              columnGap={1}
              p={2}
              borderRadius={3}
              style={{ backgroundColor: '#f7f8fb' }}
            >
              <Stack alignItems='start' justifyContent='center' columnGap={1}>
                <label>Sync events updated in the past </label>
                <Stack width='150px'>
                  <CustomSelect
                    options={syncPastUpdatesOptions}
                    value={syncEventUpdatedInThePast}
                    onChange={(val: any) => setSyncEventUpdatedInThePast(val)}
                  />
                </Stack>
              </Stack>
              <CustomButton
                startIcon={<SyncOutlinedIcon />}
                type='button'
                color='primary'
                onClick={onClickIntegrate}
                disabled={loadingSync}
              >
                Integrate
              </CustomButton>
            </Stack>
          </Stack>
          <CustomButton
            style={{ alignSelf: 'end' }}
            variant='outlined'
            type='button'
            onClick={onCancel}
          >
            Cancel
          </CustomButton>
        </Stack>
      </Stack>
    </div>
  );
};

export default RethinkTabPanelEvents;

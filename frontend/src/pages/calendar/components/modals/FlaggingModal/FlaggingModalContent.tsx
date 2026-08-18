import { Stack } from '@mui/material';
import { memo, type FC } from 'react';
import { flaggingTableColumns } from 'pages/calendar/utils/calendarTableColumns';
import Loader from 'components/Loader/Loader';
import { useAppSelector } from 'store/hooks';
import FlaggingTable from '../../FlaggingTable';

const FlaggingModalContent: FC = () => {
  const flaggingLoading = useAppSelector(
    (state) => state.flagging.flaggingLoading,
  );
  const flaggingDataConstraints = useAppSelector(
    (state) => state.flagging?.flaggingData?.constraints,
  );

  return flaggingLoading ? (
    <Loader />
  ) : (
    <Stack>
      <FlaggingTable
        columns={flaggingTableColumns}
        rows={flaggingDataConstraints}
      />
    </Stack>
  );
};

FlaggingModalContent.displayName = 'FlaggingModalContent';

export default memo(FlaggingModalContent);

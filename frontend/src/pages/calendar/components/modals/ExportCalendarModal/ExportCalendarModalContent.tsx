import { useState, memo, type FC } from 'react';
import { Stack } from '@mui/material';
import axios from 'axios';
import moment from 'moment';
import CustomButton from 'components/Button';
import CustomDateRangePicker from 'components/CustomDateRangePicker/CustomDateRangePicker';
import Errors from 'components/FormItems/error/errors';
import InternalPortal from 'components/InternalPortal';
import Portal from 'components/Portal';
import BackdropLoading from '../../BackdropLoading';

export interface IExportCalendarModalContentProps {
  actionButtonsTargetRef: React.RefObject<HTMLElement>;
  toggleModalOpen: () => void;
}

const ExportCalendarModalContent: FC<IExportCalendarModalContentProps> = ({
  actionButtonsTargetRef,
  toggleModalOpen,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedStartDate, setSelectedStartDate] = useState<Date>(
    moment().startOf('day').toDate(),
  );
  const [selectedEndDate, setSelectedEndDate] = useState<Date>(
    moment().startOf('day').add(1, 'weeks').toDate(),
  );

  const handleChangeTableDate = (start: Date, end: Date) => {
    setSelectedStartDate(start);
    setSelectedEndDate(end);
  };

  const handleConfirm = async () => {
    if (isLoading) {
      return;
    }

    const start = selectedStartDate
      ? moment(selectedStartDate).format('DD-MM-YYYY')
      : 'start';
    const end = selectedEndDate
      ? moment(selectedEndDate).format('DD-MM-YYYY')
      : 'end';

    setIsLoading(true);
    try {
      const { data: blob } = await axios.get<Blob>(
        '/scheduler/events-calendar',
        {
          responseType: 'blob',
          params: {
            start: selectedStartDate,
            end: selectedEndDate,
          },
        },
      );
      const newBlob = new Blob([blob], {
        type: 'text/calendar;charset=utf-8',
      });
      const url = window.URL.createObjectURL(newBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${start}-${end}-event.ics`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      const message = error.message ?? 'Download failed';
      Errors.showMessage(message);
      console.error('Failed to download .ics file:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Stack direction='column' alignItems='start'>
      <label>Select Date Range:</label>
      <CustomDateRangePicker
        startDate={selectedStartDate}
        endDate={selectedEndDate}
        onSubmit={handleChangeTableDate}
      />

      <InternalPortal targetRef={actionButtonsTargetRef}>
        <CustomButton onClick={toggleModalOpen} variant='outlined'>
          Cancel
        </CustomButton>
        <CustomButton onClick={handleConfirm} variant='contained'>
          Confirm
        </CustomButton>
      </InternalPortal>

      {/* 
        This is where the loading indicator will be shown while the export is in progress.
        It can be customized further if needed.
      */}
      <Portal>
        <BackdropLoading open={isLoading} title='Exporting Calendar...' />
      </Portal>
    </Stack>
  );
};

export default memo(ExportCalendarModalContent);

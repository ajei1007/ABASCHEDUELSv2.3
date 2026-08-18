import { memo, type FC } from 'react';
import { Stack } from '@mui/material';
import CustomButton from 'components/Button';
import Filters from 'components/Filters';
import InternalPortal from 'components/InternalPortal';
import { useAppDispatch } from 'store/hooks';
import { saveDefaultSettings } from 'store/actions/settingsActions';
import SectionTitle from '../SettingsModal/SectionTitle';

export interface IFiltersModalContentProps {
  actionButtonsTargetRef: React.RefObject<HTMLElement>;
  toggleModalOpen: () => void;
}

const FiltersModalContent: FC<IFiltersModalContentProps> = ({
  actionButtonsTargetRef,
  toggleModalOpen,
}) => {
  const dispatch = useAppDispatch();

  const handleSetDefaultSettings = () => {
    const confirming = window.confirm(
      'Are You sure you want to save these filters as your default filters?',
    );
    if (confirming) {
      dispatch(saveDefaultSettings());
      toggleModalOpen();
    }
  };

  return (
    <Stack>
      <SectionTitle>Filters</SectionTitle>
      <Filters gridCol={6} subgroupBol={true} />

      <InternalPortal targetRef={actionButtonsTargetRef}>
        <CustomButton onClick={handleSetDefaultSettings}>
          Save As Default
        </CustomButton>
        <CustomButton onClick={toggleModalOpen} variant='outlined'>
          Cancel
        </CustomButton>
      </InternalPortal>
    </Stack>
  );
};

FiltersModalContent.displayName = 'FiltersModalContent';

export default memo(FiltersModalContent);

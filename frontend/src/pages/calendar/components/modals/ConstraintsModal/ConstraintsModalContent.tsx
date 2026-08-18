import { useState, memo } from 'react';
import { Stack } from '@mui/material';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import InternalPortal from 'components/InternalPortal';
import CustomButton from 'components/Button';
import { saveDefaultConstraintPlacements } from 'store/slices/flagging/actions';
import ConstraintPlacements from '../../../components/ConstraintPlacements';

export interface IConstraintsModalContentProps {
  actionButtonsTargetRef: React.RefObject<HTMLElement>;
  toggleModalOpen: () => void;
}

const ConstraintsModalContent = ({
  actionButtonsTargetRef,
  toggleModalOpen,
}: IConstraintsModalContentProps) => {
  const dispatch = useAppDispatch();

  const flaggingCustomConstraints = useAppSelector(
    (state) => state.flagging?.customConstraints,
  );

  const [items, setItems] = useState(flaggingCustomConstraints ?? null);

  const saveConstraintsSettings = async () => {
    await dispatch(saveDefaultConstraintPlacements(items));
    toggleModalOpen();
  };

  const handleSetDefaultConstraints = async () => {
    const confirming = window.confirm(
      'Are You sure you want to save these constraints settings as your default settings?',
    );
    if (confirming) {
      await saveConstraintsSettings();
    }
  };

  return (
    <Stack rowGap='1rem'>
      <ConstraintPlacements items={items} setItems={setItems} />

      <InternalPortal targetRef={actionButtonsTargetRef}>
        <CustomButton onClick={handleSetDefaultConstraints} variant='contained'>
          Save
        </CustomButton>
        <CustomButton onClick={toggleModalOpen} variant='outlined'>
          Cancel
        </CustomButton>
      </InternalPortal>
    </Stack>
  );
};

ConstraintsModalContent.displayName = 'ConstraintsModalContent';

export default memo(ConstraintsModalContent);

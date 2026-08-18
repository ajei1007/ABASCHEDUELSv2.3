import { useState } from 'react';
import { useAppDispatch } from 'store/hooks';
import {
  addUnavailablities,
  removeUnavailable,
} from 'store/slices/calendar/thunks';
import { useLatestCallback } from 'hooks/useLatestCallback';
import type { IModalWrapperRef } from 'components/ModalWrapper';
import { useCalendarSelectedResourcesContext } from '../context/CalendarSelectedResourcesContext';
import type { ISelectAndConfirmUnavailabilityPropsForRef } from '../components/modals/SeletedAndConfirmedUnavailabilityModal';
import type { ISelectAndConfirmAvailabilityPropsForRef } from '../components/modals/SeletedAndConfirmedAvailabilityModal';

export function useCalendarUserAvailabilityActionHandlers({
  unavailabilityModalRef,
  availabilityModalRef,
}: {
  unavailabilityModalRef: React.RefObject<
    IModalWrapperRef<ISelectAndConfirmUnavailabilityPropsForRef, any>
  >;
  availabilityModalRef: React.RefObject<
    IModalWrapperRef<ISelectAndConfirmAvailabilityPropsForRef, any>
  >;
}) {
  const dispatch = useAppDispatch();

  // Context for selected resources
  const { selectedResources, resetAnySelected } =
    useCalendarSelectedResourcesContext();

  const [creatingUnavailabilites, setCreatingUnavailabilites] = useState(false);
  const [creatingAvailabilites, setCreatingAvailabilites] = useState(false);

  const handleAddUnavalabilities = useLatestCallback(async () => {
    if (!unavailabilityModalRef.current) {
      return;
    }

    const modalResult = await unavailabilityModalRef.current.show({
      mode: 'add', // <-- distinguishes the action
      title: 'Add Unavailability for Selected Resources',
      confirmButtonText: 'Remove',
      confirmButtonColor: 'primary',
      checkedResources: selectedResources,
    });

    if (modalResult.isSubmit) {
      console.log('Unavailability action confirmed!');
      try {
        setCreatingUnavailabilites(true);
        await dispatch(addUnavailablities(selectedResources));
        console.log('Unavailabilities successfully added.');
      } catch (err) {
        console.error('Error adding unavailabilities:', err);
      } finally {
        setCreatingUnavailabilites(false);
        resetAnySelected();
      }
    } else {
      console.log('User canceled the action.');
    }
  });

  const handleRemoveUnavailabilities = useLatestCallback(async () => {
    if (!unavailabilityModalRef.current) {
      return;
    }

    const modalResult = await unavailabilityModalRef.current.show({
      mode: 'remove',
      title: 'Remove Unavailability for Selected Resources',
      confirmButtonText: 'Remove',
      confirmButtonColor: 'primary',
      checkedResources: selectedResources,
    });

    if (modalResult.isSubmit) {
      console.log('Unavailability action confirmed!');
      try {
        await dispatch(removeUnavailable(selectedResources));
        console.log('Unavailabilities successfully added.');
      } catch (err) {
        console.error('Error adding unavailabilities:', err);
      } finally {
        resetAnySelected();
      }
    } else {
      console.log('User canceled the action.');
    }
  });

  const handleAddAvalabilities = useLatestCallback(async () => {
    if (!availabilityModalRef.current) {
      return;
    }

    const modalResult = await availabilityModalRef.current.show({
      title: 'Add Availability for Selected Resources',
      confirmButtonText: 'Remove',
      confirmButtonColor: 'primary',
      checkedResources: selectedResources,
    });

    if (modalResult.isSubmit) {
      try {
        setCreatingAvailabilites(true);
        await dispatch(addUnavailablities(selectedResources, true));
        console.log('Availabilities successfully added.');
      } catch (err) {
        console.error('Error adding availabilities:', err);
      } finally {
        setCreatingAvailabilites(false);
        resetAnySelected();
      }
    } else {
      console.log('User canceled the action.');
    }
  });

  return {
    creatingUnavailabilites,
    creatingAvailabilites,
    handleAddUnavalabilities,
    handleRemoveUnavailabilities,
    handleAddAvalabilities,
  };
}

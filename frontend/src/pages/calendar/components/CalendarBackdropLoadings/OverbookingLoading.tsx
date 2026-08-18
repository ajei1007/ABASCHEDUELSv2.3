import { memo } from 'react';
import { useAppSelector } from 'store/hooks';
import BackdropLoading from '../BackdropLoading';

const OverbookingLoading = () => {
  const overbookingLoading = useAppSelector(
    (state) => state.calendar.overbookingLoading,
  );

  return (
    <BackdropLoading
      open={overbookingLoading}
      title='Finding Overbooking Events...'
    />
  );
};

OverbookingLoading.displayName = 'OverbookingLoading';

export default memo(OverbookingLoading);

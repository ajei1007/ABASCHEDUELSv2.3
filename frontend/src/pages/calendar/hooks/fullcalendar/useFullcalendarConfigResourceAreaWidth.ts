import { useMemo } from 'react';
import { useAppSelector } from 'store/hooks';

export function useFullcalendarConfigResourceAreaWidth() {
  const statsViewEnabled = useAppSelector(
    (state) => state.settings.settingValues.statsViewEnabled,
  );

  const resourceAreaWidth = useMemo(
    () => (statsViewEnabled ? '35%' : '20%'),
    [statsViewEnabled],
  );

  return resourceAreaWidth;
}

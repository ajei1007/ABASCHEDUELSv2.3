import { useMemo } from 'react';
import TherapyPmsResources from './TherapyPmsResources';
import TherapyPmsResourcesActions from './TherapyPmsResourcesActions';
import { EventEmitter } from 'utils/eventEmitter';

const TherapyPmsTabPanelUsers = ({ onCancel }: { onCancel: () => void }) => {
  const eventBus = useMemo(
    () =>
      new EventEmitter<{
        refetch: number | undefined;
      }>(),
    [],
  );

  return (
    <div>
      <TherapyPmsResources eventBus={eventBus} />
      <TherapyPmsResourcesActions eventBus={eventBus} onCancel={onCancel} />
    </div>
  );
};

export default TherapyPmsTabPanelUsers;

import { useMemo } from 'react';
import RethinkResources from './RethinkResources';
import RethinkResourcesActions from './RethinkResourcesActions';
import { EventEmitter } from 'utils/eventEmitter';

const RethinkTabPanelUsers = ({ onCancel }: { onCancel: () => void }) => {
  const eventBus = useMemo(
    () =>
      new EventEmitter<{
        refetch: number | undefined;
      }>(),
    [],
  );

  return (
    <div>
      <RethinkResources eventBus={eventBus} />
      <RethinkResourcesActions eventBus={eventBus} onCancel={onCancel} />
    </div>
  );
};

export default RethinkTabPanelUsers;

import type { FC } from 'react';
import role_permissions from 'helpers/role_permissions';
import { useTypedSelector } from 'hooks/useTypedSelector';
import ActionSwitchUserButton from './SwitchUserButton';
import ActionEditButton from './EditButton';
import ActionDeleteButton from './DeleteButton';

interface ActionFormatterProps {
  editPermissionType?: string;
  deletePermissionType?: string;
  switchEvent?: ((e: any) => void )| null;
  deleteEvent?: (e: any) => void;
  editEvent?: ((e: any) => void) | null;
}

const ActionFormatter: FC<ActionFormatterProps> = ({
  editPermissionType = null,
  deletePermissionType = null,
  switchEvent,
  deleteEvent,
  editEvent,
}) => {
  const currentUser = useTypedSelector((store) => store.auth.currentUser);

  const isEditPossible = editPermissionType ? role_permissions(currentUser, editPermissionType) : true;
  const isDeletePossible = deletePermissionType ? role_permissions(currentUser, deletePermissionType) : true;
  return (
    <div className='action-buttons'>
      {isEditPossible && switchEvent && <ActionSwitchUserButton handleClick={switchEvent} />}
      {isEditPossible && editEvent && <ActionEditButton handleClick={editEvent} />}
      
      {/* Render delete button only if deleteEvent is provided for tables that dont need delete functionality */}
      {isDeletePossible && deleteEvent && <ActionDeleteButton handleClick={deleteEvent} />}
    </div>
  );
};

export default ActionFormatter;

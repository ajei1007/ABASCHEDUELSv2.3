import { Grid2 as Grid, Stack } from '@mui/material';
// @ts-ignore
import AsyncSelect from 'react-select/async';
import asyncSearchUsers from 'utils/asyncSearchUsers';
import UsersDraggableList from '../../components/UsersDraggableList';
import { DragDropContext } from 'react-beautiful-dnd';
import reorder from 'utils/reorder';
import { selectInputControlStyles } from 'utils/selectInputControlStyles';

type PriorityConstraintProps = {
  form: any;
};

const PriorityConstraint = ({ form }: PriorityConstraintProps) => {
  const { values, setFieldValue } = form;
  const { priorityUsers } = values;
  
  const handleOnDragEnd = (result: any) => {
    if (!result.destination) {
      return;
    }

    const sourceList = result.source.droppableId;
    const destinationList = result.destination.droppableId;

    // Reorder the items in the same list
    if (sourceList === destinationList) {
      const arr = priorityUsers;

      const updatedItems = reorder(
        arr,
        result.source.index,
        result.destination.index,
      );
      setFieldValue('priorityUsers', updatedItems);
    }
  };

  const handleDeleteItem = (id: string) => {
    const _users = priorityUsers;
    const updatedItems = _users.filter((user: any) => user.value !== id);
    setFieldValue('priorityUsers', updatedItems);
  };


  return (
    <Stack>
      {/* Users Select */}
      <Stack>
        <label htmlFor='users'>Users</label>
        <AsyncSelect
          name='users'
          className='w-100'
          classNamePrefix='select'
          styles={selectInputControlStyles()}
          placeholder=''
          defaultOptions={true}
          isMulti
          loadOptions={asyncSearchUsers}
          value={priorityUsers}
          onChange={(opts: any) => setFieldValue('priorityUsers', opts)}
        />
      </Stack>
      <Grid container spacing={1} marginTop={2}>
        <DragDropContext onDragEnd={handleOnDragEnd}>
          <Grid
            size={{
              sm: 12,
              md: 12
            }}>
            <UsersDraggableList
              users={priorityUsers}
              columnId='priorityUsers'
              handleDeleteItem={handleDeleteItem}
              showRanking
            />
          </Grid>
        </DragDropContext>
      </Grid>
    </Stack>
  );
};

export default PriorityConstraint;

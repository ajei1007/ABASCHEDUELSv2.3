import { Grid2 as Grid, IconButton, Stack } from '@mui/material';
// @ts-ignore
import AsyncSelect from 'react-select/async';
import asyncSearchUsers from 'utils/asyncSearchUsers';
import UsersDraggableList from '../../components/UsersDraggableList';
import { DragDropContext } from 'react-beautiful-dnd';
import reorder from 'utils/reorder';
import FormErrors from 'components/FormItems/formErrors';
import { selectInputControlStyles } from 'utils/selectInputControlStyles';
import CustomCheckboxBlock from 'components/CustomCheckboxBlock/CustomCheckboxBlock';

type MatchingUnmatchingPriorityProps = {
  form: any;
};

const MatchingUnmatchingPriority = ({
  form,
}: MatchingUnmatchingPriorityProps) => {
  const { values, setFieldValue } = form;
  const { matchingUnmatching } = values;

  const handleOnDragEnd = (result: any) => {
    if (!result.destination) {
      return;
    }

    const sourceList = result.source.droppableId;
    const destinationList = result.destination.droppableId;

    // Reorder the items in the same list
    if (sourceList === destinationList) {
      const arr = matchingUnmatching[sourceList];

      const updatedItems = reorder(
        arr,
        result.source.index,
        result.destination.index,
      );
      setFieldValue(`matchingUnmatching.${sourceList}`, updatedItems);
    } else {
      // Move item between lists
      const sourceItems = Array.from(matchingUnmatching[sourceList]);
      const destinationItems = Array.from(matchingUnmatching[destinationList]);

      const [removed] = sourceItems.splice(result.source.index, 1);
      destinationItems.splice(result.destination.index, 0, removed);

      setFieldValue(`matchingUnmatching`, {
        [sourceList]: sourceItems,
        [destinationList]: destinationItems,
      });
    }
  };

  const handleChangeCheckbox = (
    event: any,
    columnId: string,
    userId: string,
  ) => {
    const checked = event.target.checked;

    const _users = matchingUnmatching[columnId];
    const updatedItems = _users.map((user: any) => {
      if (user.value === userId) {
        user.soft = checked;
      }
      return user;
    });
    setFieldValue(`matchingUnmatching.${columnId}`, updatedItems);
  };

  const handleDeleteItem = (id: string, columnId: string) => {
    const _users = matchingUnmatching[columnId];
    const updatedItems = _users.filter((user: any) => user.value !== id);
    setFieldValue(`matchingUnmatching.${columnId}`, updatedItems);
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
          styles={selectInputControlStyles(
            !!FormErrors.displayableError(form!, 'antecedentTypeUser'),
          )}
          placeholder=''
          defaultOptions={true}
          isMulti
          loadOptions={asyncSearchUsers}
          isClearable={true}
          value={[
            ...matchingUnmatching.matching,
            ...matchingUnmatching.unmatching,
          ]}
          onChange={(opts: any) => {
            const allUsers = [
              ...matchingUnmatching.matching,
              ...matchingUnmatching.unmatching,
            ];
            const newUserIds = allUsers.map((usr: any) => usr.value);
            const newUsers = opts.filter(
              (opt: any) => !newUserIds.includes(opt.value),
            );
            const matchingUserIds = matchingUnmatching.matching.map(
              (usr: any) => usr.value,
            );
            const unmatchingUserIds = matchingUnmatching.unmatching.map(
              (usr: any) => usr.value,
            );
            const updatedMatchingUsers = opts.filter((opt: any) =>
              matchingUserIds.includes(opt.value),
            );
            const updatedUnmatchingUsers = opts.filter((opt: any) =>
              unmatchingUserIds.includes(opt.value),
            );

            setFieldValue(`matchingUnmatching`, {
              matching: updatedMatchingUsers,
              unmatching: [...updatedUnmatchingUsers, ...newUsers],
            });
          }}
        />
      </Stack>
      <Grid container marginTop={2}>
        <DragDropContext onDragEnd={handleOnDragEnd}>
          <Grid
            size={{
              sm: 12,
              md: 12,
            }}
          >
            <Stack
              my={1}
              flexDirection='row'
              justifyContent='space-between'
              alignItems='center'
              columnGap={1}
            >
              <label style={{ margin: 0 }}>Must work with</label>
              <CustomCheckboxBlock
                label='Soft'
                color={'#4d53e0'}
                checked={values.matchingSoft}
                value='soft'
                onChange={(event) =>
                  setFieldValue('matchingSoft', event.target.checked)
                }
              />
            </Stack>
            <UsersDraggableList
              users={matchingUnmatching.matching}
              columnId='matching'
              // handleChangeCheckbox={handleChangeCheckbox}
              handleDeleteItem={handleDeleteItem}
            />
          </Grid>
          <Grid
            size={{
              sm: 12,
              md: 12,
            }}
          >
            <label>Cannot work with</label>
            <UsersDraggableList
              users={matchingUnmatching.unmatching}
              columnId='unmatching'
              handleChangeCheckbox={handleChangeCheckbox}
              handleDeleteItem={handleDeleteItem}
            />
          </Grid>
        </DragDropContext>
      </Grid>
    </Stack>
  );
};

export default MatchingUnmatchingPriority;

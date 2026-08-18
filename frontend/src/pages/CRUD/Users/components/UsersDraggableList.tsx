import { Droppable, Draggable } from 'react-beautiful-dnd';
import style from '../../../../components/DragAndDropList/DragAndDrop.module.scss';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { IconButton, Stack, Typography } from '@mui/material';
import CustomCheckboxBlock from 'components/CustomCheckboxBlock/CustomCheckboxBlock';
import HighlightOffOutlinedIcon from '@mui/icons-material/HighlightOffOutlined';

interface UsersDraggableListProps {
  users: any;
  columnId: string;
  showRanking?: boolean;
  handleChangeCheckbox?: any;
  handleDeleteItem?: any;
}

const UsersDraggableList = ({
  users,
  columnId,
  showRanking,
  handleChangeCheckbox,
  handleDeleteItem,
}: UsersDraggableListProps) => {
  return (
    <Droppable droppableId={columnId}>
      {(provided) => (
        <Stack
          ref={provided.innerRef}
          {...provided.droppableProps}
          style={{ height: '100%' }}
        >
          {users.length === 0 ? (
            <Stack justifyContent='center' alignItems='center' height='60px'>
              <Typography>Drop here...</Typography>
            </Stack>
          ) : (
            <>
              {users.map((user: any, index: number) => (
                <Draggable key={user.value} draggableId={user.value} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={style.draggableItem}
                    >
                      <Stack
                        flexDirection='row'
                        alignItems='center'
                        justifyContent='space-between'
                        width='100%'
                      >
                        <Stack flexDirection='row' alignItems='center'>
                          <DragIndicatorIcon
                            fontSize='medium'
                            sx={{ color: '#6b859e', marginRight: '0.5rem' }}
                          />
                          {showRanking && (
                            <Typography
                              fontSize='0.75rem'
                              paddingRight={1}
                              color='#4d53e0'
                              fontWeight='600'
                            >
                              {index + 1}.
                            </Typography>
                          )}
                          {user.label}
                        </Stack>
                        <Stack
                          flexDirection='row'
                          alignItems='center'
                          justifyContent='center'
                          gap={2}
                        >
                          {handleChangeCheckbox && (
                            <CustomCheckboxBlock
                              label='Soft'
                              color={'#4d53e0'}
                              checked={user?.soft ?? false}
                              value='soft'
                              onChange={(event) =>
                                handleChangeCheckbox(event, columnId, user.value)
                              }
                            />
                          )}
                          {handleDeleteItem && (
                            <IconButton
                              size='small'
                              aria-label='delete'
                              className='btn-icon error'
                              onClick={() =>
                                handleDeleteItem(user.value, columnId)
                              }
                            >
                              <HighlightOffOutlinedIcon fontSize='small' />
                            </IconButton>
                          )}
                        </Stack>
                      </Stack>
                    </div>
                  )}
                </Draggable>
              ))}
            </>
          )}
          {provided.placeholder}
        </Stack>
      )}
    </Droppable>
  );
};

export default UsersDraggableList;

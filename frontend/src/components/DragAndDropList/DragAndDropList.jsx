import { Droppable, Draggable } from 'react-beautiful-dnd';
import style from './DragAndDrop.module.scss';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { Stack, Typography, Chip } from '@mui/material';
import CustomCheckbox from './helpers/CustomCheckbox';
import { CONSTRAINT_TYPES } from 'pages/CRUD/CustomConstraints/helpers/customTypes';

const DragAndDropList = ({
  items,
  columnId,
  showRanking,
  checkbox,
  setItems,
  constraintType,
}) => {
  const handleChangeCheckbox = (type, constraintId) => {
    setItems((prev) => {
      const block = prev[columnId];
      const updatedItems = block.constraints.map((constraint) => {
        if (constraint.constraintId === constraintId) {
          constraint[type] = !constraint[type];
        }
        return constraint;
      });
      return {
        ...prev,
        [columnId]: {
          constraints: updatedItems,
        },
      };
    });
  };
  return (
    <Droppable droppableId={columnId}>
      {(provided) => (
        <Stack
          ref={provided.innerRef}
          {...provided.droppableProps}
          style={{ height: '100%' }}
        >
          {items.length === 0 ? (
            <Stack justifyContent='center' alignItems='center' height='60px'>
              <Typography>Drop here...</Typography>
            </Stack>
          ) : (
            <>
              {items.map((item, index) => (
                <Draggable
                  key={item.constraintId}
                  draggableId={item.constraintId}
                  index={index}
                >
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={style.draggableItem}
                    >
                    <Stack flexDirection='row' alignItems='center' justifyContent='space-between' width='100%'>
                      <Stack flexDirection='row' alignItems='center'>
                      <DragIndicatorIcon
                        fontSize='1rem'
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

                      <div dangerouslySetInnerHTML={{ __html: item.content }} />
                      </Stack>
                      <Stack flexDirection='row' alignItems='center' >
                      {constraintType && (
                        <Stack>
                          <Chip label={
                            CONSTRAINT_TYPES.find(
                              (type) => type.value === item.constraintType,
                            )?.label ?? ""} variant='outlined'/>
                        </Stack>
                        )}
                        {checkbox && (
                          <>
                            <Stack flexDirection='row' mx={2}>
                              <Stack>
                                <CustomCheckbox
                                  color='#ff0000'
                                  label='F'
                                  checked={item.flagging}
                                  onChange={() =>
                                    handleChangeCheckbox(
                                      'flagging',
                                      item.constraintId,
                                    )
                                  }
                                />
                              </Stack>
                              <Stack mx={2}>
                                <CustomCheckbox
                                  color='#43bc13'
                                  label='S'
                                  checked={item.solutionGenerator}
                                  onChange={() =>
                                    handleChangeCheckbox(
                                      'solutionGenerator',
                                      item.constraintId,
                                    )
                                  }
                                />
                              </Stack>
                              <Stack>
                                <CustomCheckbox
                                  color='#00a5ff'
                                  label='O'
                                  checked={item.optimizer}
                                  onChange={() =>
                                    handleChangeCheckbox(
                                      'optimizer',
                                      item.constraintId,
                                    )
                                  }
                                />
                              </Stack>
                            </Stack>
                          </>
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

export default DragAndDropList;

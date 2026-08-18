/* eslint-disable react-hooks/exhaustive-deps */
import {
  Stack,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Box,
} from '@mui/material';
import CustomSwitch from '../../../components/CustomSwitch/CustomSwitch';
import { useMemo, useState } from 'react';
import { useAppDispatch } from 'store/hooks';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { CONSTRAINT_TYPES } from 'pages/CRUD/CustomConstraints/helpers/customTypes';
import CustomInput from 'components/CustomInputModal/CustomInput';
import { updateConstraintPlacements } from 'store/slices/flagging/actions';

const ConstraintItem = ({ item, updateConstraintItem }) => {
  const constraintChecked =
    item.flagging && item.solutionGenerator && item.optimizer;

  const handleChangeChecked = (e) => {
    const checked = e.target.checked;
    updateConstraintItem({
      ...item,
      flagging: checked,
      solutionGenerator: checked,
      optimizer: checked,
    });
  };

  return (
    <div
      style={{
        backgroundColor: '#FFF',
        borderRadius: '0.5rem',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        padding: '0.75rem 1rem',
        fontSize: '0.875rem',
      }}
    >
      <Stack
        flexDirection='row'
        alignItems='center'
        justifyContent='space-between'
        width='100%'
      >
        <Stack flexDirection='row' alignItems='center'>
          <div dangerouslySetInnerHTML={{ __html: item.content }} />
        </Stack>
        <Stack flexDirection='row' alignItems='center' gap={2}>
          <Stack>
            <Chip
              label={
                ('soft' in item && item.soft) || item?.importance === 'low'
                  ? 'Soft'
                  : 'Hard'
              }
              variant='outlined'
            />
          </Stack>
          <Stack flexDirection='row' ml='auto'>
            <CustomSwitch
              checked={constraintChecked}
              onChange={handleChangeChecked}
            />
          </Stack>
        </Stack>
      </Stack>
    </div>
  );
};

const ConstraintGroup = ({ constraintType, updateConstraintItem }) => {
  return (
    <Accordion className='accordion-item'>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls='panel1a-content'
        id='panel1a-header'
      >
        <Stack direction='row' width='100%' alignItems='center'>
          <Typography
            component='span'
            style={{
              fontWeight: '600',
              fontSize: '0.875rem',
              color: '#474747',
            }}
          >
            {constraintType.label}
          </Typography>
        </Stack>
      </AccordionSummary>
      <AccordionDetails className='accordion-item-details'>
        <Stack spacing={2}>
          {constraintType.constraints.map((item) => (
            <ConstraintItem
              key={item.constraintId}
              item={item}
              updateConstraintItem={updateConstraintItem}
            />
          ))}
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
};

const ConstraintEnableForAll = ({
  items,
  filteredItems,
  groupedConstraints,
  doUpdateCustomConstraints,
}) => {
  const allEnabled = groupedConstraints.every((group) =>
    group.constraints.every(
      (item) => item.flagging && item.solutionGenerator && item.optimizer,
    ),
  );

  const handleChangeAllEnabled = (e) => {
    const checked = e.target.checked;
    const filteredItemIds = filteredItems.map(
      (constraint) => constraint.constraintId,
    );

    const newItems = items.map((item) => {
      if (!filteredItemIds.includes(item.constraintId)) {
        return item;
      }

      return {
        ...item,
        flagging: checked,
        optimizer: checked,
        solutionGenerator: checked,
      };
    });

    doUpdateCustomConstraints(newItems);
  };

  return (
    <Stack direction='row'>
      <Stack
        component='label'
        alignItems='center'
        direction='row'
        gap={1}
        marginLeft='auto'
      >
        <Typography
          marginTop='1px'
          lineHeight='1.4'
          fontSize='0.825rem !important'
        >
          Enable For All
        </Typography>
        <CustomSwitch checked={allEnabled} onChange={handleChangeAllEnabled} />
      </Stack>
    </Stack>
  );
};

const ConstraintPlacements = ({ items, setItems }) => {
  const dispatch = useAppDispatch();
  const [searchText, setSearchText] = useState('');

  const filteredItems = useMemo(() => {
    if (items) {
      if (searchText) {
        let selectedItems = JSON.parse(JSON.stringify(items));
        const lowerCaseSearchText = searchText.toLowerCase();
        selectedItems = selectedItems.filter((sConstraintType) =>
          sConstraintType?.content?.toLowerCase().includes(lowerCaseSearchText),
        );
        return selectedItems;
      }
      return items;
    }
    return null;
  }, [searchText, items]);

  const updateConstraintItem = (newItem) => {
    const updatedItems = items.map((item) => {
      if (item.constraintId === newItem.constraintId) {
        return newItem;
      }
      return item;
    });
    doUpdateCustomConstraints(updatedItems);
  };

  const doUpdateCustomConstraints = (updates) => {
    dispatch(updateConstraintPlacements(updates));
    setItems(updates);
  };

  const groupedConstraints = useMemo(() => {
    if (filteredItems) {
      const existingConstraintTypes = [
        ...new Set(filteredItems.map((item) => item.constraintType)),
      ];

      let grouping = existingConstraintTypes.map((constraintTypeValue) => {
        const constraintTypeObj = CONSTRAINT_TYPES.find(
          (c) => c.value === constraintTypeValue,
        );
        const constraints = filteredItems.filter(
          (item) => item.constraintType === constraintTypeValue,
        );

        return {
          ...constraintTypeObj,
          constraints,
        };
      });
      return grouping;
    }
    return [];
  }, [filteredItems]);

  return (
    <Stack spacing={2} marginTop={2}>
      <Stack direction='row' justifyContent='space-between' minHeight={'28px'}>
        <Stack>
          <h5>Constraints</h5>
        </Stack>
        {groupedConstraints?.length > 0 && (
          <ConstraintEnableForAll
            items={items}
            filteredItems={filteredItems}
            groupedConstraints={groupedConstraints}
            doUpdateCustomConstraints={doUpdateCustomConstraints}
          />
        )}
      </Stack>
      <Stack>
        <label>Search by description:</label>
        <CustomInput
          type='text'
          name='filterValue'
          id='filterValue'
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </Stack>
      {groupedConstraints?.length > 0 ? (
        <>
          <Box>
            {groupedConstraints.map((constraintType, index) => (
              <ConstraintGroup
                key={index}
                constraintType={constraintType}
                updateConstraintItem={updateConstraintItem}
              />
            ))}
          </Box>
        </>
      ) : (
        <Typography textAlign='center'>There is no constraints</Typography>
      )}
    </Stack>
  );
};

export default ConstraintPlacements;

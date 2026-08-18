import {
  Box,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Grid2 as Grid,
  Typography,
  Tooltip,
  IconButton,
  Button,
} from '@mui/material';
import { useFormikContext } from 'formik';
import { ScrollToFieldError } from 'pages/CRUD/Users/form/ScrollToFieldError';
import React, { useState } from 'react';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import UsersSelectItem from 'pages/CRUD/Users/helpers/UsersSelectItem';
import capacityconstraintsFields from '../helpers/capacityconstraintsFields';
import ConstraintCard from './CapacityConstraintCard';
import AddIcon from '@mui/icons-material/Add';
import YesNoMui from 'pages/CRUD/CustomConstraints/helpers/YesNoRadio';

const LabelTooltip: React.FC<{ title: string }> = ({ title }) => (
  <Tooltip title={title} placement='top' arrow>
    <HelpOutlineIcon fontSize='small' style={{ marginLeft: 4 }} />
  </Tooltip>
);

const steps = ['Activity & Role', 'Constraints'];

interface CapacityConstraintsFormFieldsProps {
  saveLoading: boolean;
  onCancel: () => void;
  modal: boolean;
}

const CapacityConstraintsFormFields: React.FC<
  CapacityConstraintsFormFieldsProps
> = ({ saveLoading, onCancel, modal }) => {
  const form = useFormikContext<Record<string, any>>();

  const constraintCount = form.values.constraintCount || 1;

  const [activeStep, setActiveStep] = useState(0);

  const handleAddConstraint = () => {
    form.setFieldValue('constraintCount', constraintCount + 1);
  };

  const removeConstraint = (indexToRemove: number) => {
    // using structuredClone to avoid mutating the form values directly
    const newValues = window.structuredClone(form.values);

    newValues[`min${indexToRemove + 1}`] = null;
    newValues[`max${indexToRemove + 1}`] = null;
    newValues[`role${indexToRemove + 1}`] = null;
    newValues[`enableTags${indexToRemove + 1}`] = null;
    newValues[`subgroup${indexToRemove + 1}`] = null;
    newValues[`enableMinMax${indexToRemove + 1}`] = null;

    for (let i = indexToRemove + 1; i < constraintCount; i++) {
      newValues[`min${i}`] = newValues[`min${i + 1}`];
      newValues[`max${i}`] = newValues[`max${i + 1}`];
      newValues[`role${i}`] = newValues[`role${i + 1}`];
      newValues[`enableTags${i}`] = newValues[`enableTags${i + 1}`];
      newValues[`subgroup${i}`] = newValues[`subgroup${i + 1}`];
      newValues[`enableMinMax${i}`] = newValues[`enableMinMax${i + 1}`];
    }

    newValues[`min${constraintCount}`] = '';
    newValues[`max${constraintCount}`] = '';
    newValues[`role${constraintCount}`] = '';
    newValues[`enableTags${constraintCount}`] = '';
    newValues[`subgroup${constraintCount}`] = '';
    newValues[`enableMinMax${constraintCount}`] = '';

    form.setValues(newValues);

    form.setFieldValue('constraintCount', constraintCount - 1);
  };

  return (
    <form onSubmit={(e) => e.preventDefault()}>
      <ScrollToFieldError />
      <Stepper activeStep={activeStep} alternativeLabel>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      <Box mt={3}>
        {activeStep === 0 && (
          <Stack spacing={2}>
            <Box
              sx={{
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '12px',
              }}
            >
              <Grid
                container
                spacing={2}
                alignItems='center'
                justifyContent='space-between'
              >
                {/* Label */}
                <Grid
                  display='flex'
                  alignItems='center'
                  size={{
                    xs: 12,
                    md: 4,
                  }}
                >
                  <Typography
                    variant='subtitle1'
                    display='flex'
                    alignItems='center'
                  >
                    Select Activity
                    <LabelTooltip title='Choose the activity this constraint will apply to.' />
                  </Typography>
                </Grid>

                {/* Activity Selection */}
                <Grid
                  size={{
                    xs: 12,
                    md: 6,
                  }}
                >
                  <UsersSelectItem
                    name='user1'
                    schema={{
                      ...capacityconstraintsFields,
                      type_type: 'Activity',
                    }}
                    showCreate={!modal}
                    form={form}
                    required={true}
                  />
                </Grid>
              </Grid>
            </Box>
            {[...Array(constraintCount)].map((_, i) => (
              <ConstraintCard
                key={i}
                index={i}
                modal={modal}
                deletable={i > 0}
                onDelete={() => removeConstraint(i)}
              />
            ))}

            <Box display='flex' justifyContent='center' mt={1}>
              <Tooltip
                arrow
                title={
                  constraintCount >= 5
                    ? 'Maximum 5 constraints reached'
                    : 'Add another constraint'
                }
              >
                <span>
                  <IconButton
                    size='medium'
                    aria-label='add constraint'
                    disabled={constraintCount >= 5}
                    onClick={handleAddConstraint}
                    sx={{ textTransform: 'none', gap: 1 }}
                  >
                    <AddIcon sx={{ color: '#4d53e0' }} />
                  </IconButton>
                </span>
              </Tooltip>
            </Box>
          </Stack>
        )}
      </Box>
      {activeStep === 1 && (
        <Box
          sx={{
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '12px',
            marginTop: '16px',
          }}
        >
          <Typography variant='h6'>Constraint Settings</Typography>
          <Grid container spacing={2} alignItems='center'>
            {/* Disable for Specific Locations */}
            <Grid container spacing={2} alignItems='center' size={12}>
              <Grid
                display='flex'
                alignItems='center'
                size={{
                  xs: 12,
                  md: 4,
                }}
              >
                <Typography
                  variant='subtitle1'
                  display='flex'
                  alignItems='center'
                >
                  Disable for Specific Locations
                  <LabelTooltip title='Disable this constraint for certain locations.' />
                </Typography>
              </Grid>
              <Grid
                display='flex'
                justifyContent='center'
                size={{
                  xs: 12,
                  md: 2,
                }}
              >
                <YesNoMui
                  name='locationDisabled'
                  formIndex={0}
                  isNested={false}
                  values={form.values}
                  setValues={form.setValues}
                  setFieldValue={(field, value) =>
                    form.setFieldValue(field, value)
                  }
                />
              </Grid>
            </Grid>
            {/* Disabled Constraint */}
            <Grid container spacing={2} alignItems='center' size={12}>
              <Grid
                display='flex'
                alignItems='center'
                size={{
                  xs: 12,
                  md: 4,
                }}
              >
                <Typography
                  variant='subtitle1'
                  display='flex'
                  alignItems='center'
                >
                  Disable Constraint
                  <LabelTooltip title='Mark this constraint as inactive.' />
                </Typography>
              </Grid>
              <Grid
                display='flex'
                justifyContent='center'
                size={{
                  xs: 12,
                  md: 2,
                }}
              >
                <YesNoMui
                  name='disabled'
                  formIndex={0}
                  isNested={false}
                  values={form.values}
                  setValues={form.setValues}
                  setFieldValue={(field, value) =>
                    form.setFieldValue(field, value)
                  }
                />
              </Grid>
            </Grid>
          </Grid>
        </Box>
      )}
      <Box display='flex' justifyContent='space-between' mt={3}>
        <Button
          disabled={activeStep === 0}
          onClick={() => setActiveStep((prev) => prev - 1)}
        >
          Back
        </Button>
        <Button
          variant='outlined'
          color='secondary'
          onClick={onCancel}
          sx={{ ml: 2 }}
        >
          Cancel
        </Button>
        {activeStep === steps.length - 1 ? (
          <Button
            type='submit'
            variant='contained'
            color='primary'
            disabled={saveLoading}
            onClick={() => form.handleSubmit()}
          >
            Save
          </Button>
        ) : (
          <Button
            onClick={() => setActiveStep((prev) => prev + 1)}
            variant='contained'
            color='primary'
            disabled={Object.keys(form.errors).length > 0}
          >
            Next
          </Button>
        )}
      </Box>
    </form>
  );
};

export default CapacityConstraintsFormFields;

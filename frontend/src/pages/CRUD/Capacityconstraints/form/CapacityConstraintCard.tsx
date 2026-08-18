import React from 'react';
import {
  Box,
  Grid2 as Grid,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material';
import RemoveIcon from '@mui/icons-material/Remove';
import { useFormikContext } from 'formik';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

import InputNumberFormItem from 'components/FormItems/items/InputNumberFormItem';
import RolesSelectItem from 'pages/CRUD/Roles/helpers/RolesSelectItem';
import YesNoMui from 'pages/CRUD/CustomConstraints/helpers/YesNoRadio';
import SubgroupsSelectItem from 'pages/CRUD/Subgroups/helpers/SubgroupsSelectItem';
import capacityconstraintsFields from 'pages/CRUD/Capacityconstraints/helpers/capacityconstraintsFields';

const LabelTooltip: React.FC<{ title: string }> = ({ title }) => (
  <Tooltip title={title} placement='top' arrow>
    <HelpOutlineIcon fontSize='small' style={{ marginLeft: 4 }} />
  </Tooltip>
);

interface ConstraintCardProps {
  index: number;
  deletable: boolean;
  onDelete: () => void;
  modal: boolean;
}

const ConstraintCard: React.FC<ConstraintCardProps> = ({
  index,
  deletable,
  onDelete,
  modal,
}) => {
  const form = useFormikContext<Record<string, any>>();
  const idx = index + 1;

  React.useEffect(() => {
    const key = `enableMinMax${idx}`;
    if (key in form.values && !form.values[key]) {
      form.setFieldValue(`min${idx}`, 1, false);
      form.setFieldValue(`max${idx}`, 1, false);
    }
  }, [form.values[`enableMinMax${idx}`]]);
  return (
    <Box
      sx={{
        border: 1,
        borderColor: '#ddd',
        borderRadius: 2,
        p: 3,
        position: 'relative',
      }}
    >
      {deletable && (
        <IconButton
          color='error'
          sx={{ position: 'absolute', top: 4, right: 4 }}
          onClick={onDelete}
        >
          <RemoveIcon />
        </IconButton>
      )}

      {/* ---- Role -------------------------------------------------- */}
      <Grid container spacing={2} alignItems='center'>
        <Grid size={{ xs: 12, md: 6 }} display='flex' alignItems='center'>
          <Typography variant='subtitle1' display='flex' alignItems='center'>
            Assign Role{' '}
            <LabelTooltip title='Specify the role(s) associated with this constraint.' />
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <RolesSelectItem
            name={`role${idx}`}
            schema={capacityconstraintsFields}
            showCreate={!modal}
            form={form}
            required
          />
        </Grid>
      </Grid>

      {/* ---- Tag toggle / select ---------------------------------- */}
      <Grid container spacing={2} alignItems='center'>
        <Grid size={{ xs: 12, md: 4 }} display='flex' alignItems='center'>
          <Typography variant='subtitle1' display='flex' alignItems='center'>
            Does this client have a tag?{' '}
            <LabelTooltip title='Choose whether to enable the tags field.' />
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, md: 2 }} display='flex' justifyContent='center'>
          <YesNoMui
            name={`enableTags${idx}`}
            clearedField={`subgroup${idx}`}
            isNested={false}
            values={form.values}
            setValues={form.setValues}
            setFieldValue={form.setFieldValue}
            formIndex={index}
          />
        </Grid>
        {Boolean(form.values[`enableTags${idx}`]) && (
          <Grid size={{ xs: 12, md: 6 }}>
            <SubgroupsSelectItem
              name={`subgroup${idx}`}
              schema={capacityconstraintsFields}
              showCreate={!modal}
              form={form}
              required={false}
            />
          </Grid>
        )}
      </Grid>

      {/* ---- Min / Max toggle + fields ----------------------------- */}
      <Grid container spacing={2} alignItems='center'>
        <Grid size={{ xs: 12, md: 4 }} display='flex' alignItems='center'>
          <Typography variant='subtitle1' display='flex' alignItems='center'>
            Would you like to set Min/Max constraints?
            <LabelTooltip title='Choose whether to enable min/max constraints.' />
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, md: 2 }} display='flex' justifyContent='center'>
          <YesNoMui
            name={`enableMinMax${idx}`}
            isNested={false}
            values={form.values}
            setValues={form.setValues}
            setFieldValue={form.setFieldValue}
            formIndex={index}
          />
        </Grid>
        {Boolean(form.values[`enableMinMax${idx}`]) && (
          <Grid
            container
            spacing={2}
            alignItems='center'
            size={{ xs: 12, md: 6 }}
          >
            <Grid size={6}>
              <InputNumberFormItem
                name={`min${idx}`}
                schema={capacityconstraintsFields}
                required
              />
            </Grid>
            <Grid size={6}>
              <InputNumberFormItem
                name={`max${idx}`}
                schema={capacityconstraintsFields}
                required
              />
            </Grid>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default ConstraintCard;

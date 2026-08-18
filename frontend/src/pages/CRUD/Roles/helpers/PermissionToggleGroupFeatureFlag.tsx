import React, { useState } from 'react';
import {
  List,
  ListItem,
  ListItemText,
  Stack,
  Grid2 as Grid,
} from '@mui/material';
import { LabelTooltip } from 'components/LabelTooltip/LabelTooltip';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ToggleGroupQuickSelection from './ToggleGroupQuickSelection';
import type { PermissionGroupConfigFeatureFlag } from './permissionsConfig';

export interface PermissionToggleGroupFeatureFlagProps {
  config: PermissionGroupConfigFeatureFlag;
  formValues: any;
  setFormValues: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
}

const quickSelectionOptions = [
  {
    value: 'enabled',
    label: 'Enabled',
    color: 'green' as const,
  },
  {
    value: 'disabled',
    label: 'Disabled',
    color: 'red' as const,
  },
];

const PermissionToggleGroupFeatureFlag: React.FC<
  PermissionToggleGroupFeatureFlagProps
> = ({ config, formValues, setFormValues }) => {
  const [quickSelectionValue, setQuickSelectionValue] = useState<string | null>(
    () => {
      return formValues[config.featureKey ?? ''] ? 'enabled' : 'disabled';
    },
  );

  const handleQuickSelectionChange = (value: string) => {
    if (!value) {
      return;
    }

    setQuickSelectionValue(value);
    setFormValues({
      ...formValues,
      [config.featureKey ?? '']: value === 'enabled',
    });
  };

  return (
    <Grid
      size={{
        xs: 12,
        sm: 12,
        md: 12,
      }}
    >
      <List>
        <ListItem disableGutters>
          <Stack
            flexDirection='row'
            alignItems='center'
            justifyContent='space-between'
            rowGap={1}
            columnGap={2}
            flexWrap='wrap'
            width='100%'
          >
            {/* Title Section on the Left */}
            <Stack>
              <Stack direction='row' alignItems='center' spacing={0.5}>
                <ListItemText
                  primary={config.title}
                  sx={{ flex: 'unset', m: 0 }}
                />
                {config.tooltip && (
                  <LabelTooltip
                    title={config.tooltip}
                    icon={<HelpOutlineIcon fontSize='small' />}
                  />
                )}
              </Stack>
            </Stack>

            {/* Toggle Group Section on the Right */}
            <Stack ml='auto'>
              <Stack
                direction='row'
                alignItems='center'
                justifyContent='flex-start'
                columnGap={2.5}
              >
                <ToggleGroupQuickSelection
                  value={quickSelectionValue}
                  options={quickSelectionOptions}
                  onChange={handleQuickSelectionChange}
                />
              </Stack>
            </Stack>
          </Stack>
        </ListItem>
      </List>
    </Grid>
  );
};

export default PermissionToggleGroupFeatureFlag;

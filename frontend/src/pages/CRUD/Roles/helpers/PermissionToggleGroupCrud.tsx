import React, { useState, useMemo } from 'react';
import {
  List,
  ListItem,
  ListItemText,
  Stack,
  Grid2 as Grid,
} from '@mui/material';
import { LabelTooltip } from 'components/LabelTooltip/LabelTooltip';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ToggleGroup from './ToggleGroup';
import ToggleGroupButton from './ToggleGroupButton';
import ToggleGroupQuickSelection from './ToggleGroupQuickSelection';
import type { PermissionGroupConfigCrud } from './permissionsConfig';

export interface PermissionToggleGroupCrudProps {
  config: PermissionGroupConfigCrud;
  formValues: any;
  setFormValues: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
}

const quickSelectionOptions = [
  {
    value: 'admin',
    label: 'Admin',
    color: 'green' as const,
  },
  {
    value: 'custom',
    label: 'Custom',
    color: 'blue' as const,
  },
  {
    value: 'none',
    label: 'None',
    color: 'red' as const,
  },
];

const PermissionToggleGroupCrud: React.FC<PermissionToggleGroupCrudProps> = ({
  config,
  formValues,
  setFormValues,
}) => {
  const permissionKeys = useMemo(() => Object.keys(config.options), [config]);
  const allPermissionKeys = useMemo(
    () =>
      Object.entries(config.options).flatMap(([_, option]) =>
        Object.keys(option),
      ),
    [config],
  );

  const [selectedValue, setSelectedValue] = useState<string[]>(() => {
    return Object.entries(config.options)
      .filter(([_, option]) => {
        return Object.keys(option).every(
          (field) => formValues[field] === option[field],
        );
      })
      .map(([key]) => key);
  });

  const getNewQuickSelectionValue = (
    formValues: Record<string, boolean>,
  ): string => {
    if (allPermissionKeys.every((key) => formValues[key])) {
      return 'admin';
    }
    if (allPermissionKeys.some((key) => formValues[key])) {
      return 'custom';
    }
    return 'none';
  };

  const getNewFormValues = (selected: string[]): Record<string, boolean> => {
    // Reset all fields to false, then apply selected options
    const resetFields = permissionKeys.reduce(
      (acc, key) => {
        Object.keys(config.options[key as keyof typeof config.options]).forEach(
          (field) => {
            acc[field] = false;
          },
        );
        return acc;
      },
      {} as Record<string, boolean>,
    );

    const appliedFields = selected.reduce(
      (acc, key) => {
        return {
          ...acc,
          ...config.options[key as keyof typeof config.options],
        };
      },
      {} as Record<string, boolean>,
    );

    const newFormValues = {
      ...formValues,
      ...resetFields,
      ...appliedFields,
    };

    return newFormValues;
  };

  const [quickSelectionValue, setQuickSelectionValue] = useState<string | null>(
    () => getNewQuickSelectionValue(formValues),
  );

  const handleChange = (
    _: React.MouseEvent<HTMLElement>,
    newValue: string[] | null,
  ) => {
    newValue = Array.isArray(newValue) ? newValue : [];
    const newFormValues = getNewFormValues(newValue);

    setSelectedValue(newValue);
    setQuickSelectionValue(getNewQuickSelectionValue(newFormValues));
    setFormValues(newFormValues);
  };

  const handleQuickSelectionChange = (value: string) => {
    if (!value) {
      return;
    }

    let newSelectedValue: string[] = [];
    if (value === 'admin') {
      newSelectedValue = permissionKeys;
    } else if (value === 'none') {
      newSelectedValue = [];
    } else if (value === 'custom') {
      // If switching to 'custom', keep current selections
      newSelectedValue = [permissionKeys[0]]; // Ensure at least one option is selected
    }

    setSelectedValue(newSelectedValue);
    setQuickSelectionValue(value);
    setFormValues(getNewFormValues(newSelectedValue));
  };

  return (
    <Grid
      size={{
        xs: 12,
        sm: 12,
        md: 12,
      }}
    >
      <List
        sx={{
          py: 0,
        }}
      >
        <ListItem
          sx={{
            py: 0,
          }}
          disableGutters
        >
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
              <Stack
                direction='row'
                alignItems='center'
                spacing={0.5}
                minHeight='50px'
              >
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
                <ToggleGroup value={selectedValue} onChange={handleChange}>
                  {permissionKeys.map((key) => (
                    <ToggleGroupButton
                      key={key}
                      label={config.labels[key as keyof typeof config.labels]}
                      value={key}
                    />
                  ))}
                </ToggleGroup>
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

export default PermissionToggleGroupCrud;

import React, { useState } from 'react';
import {
  Grid2 as Grid,
  List,
  ListItem,
  ListItemText,
  Divider,
  ToggleButton,
  ToggleButtonGroup,
  FormControlLabel,
  Typography,
} from '@mui/material';

export interface Permission {
  name: string;
  label: string;
  checked: boolean;
}

interface PermissionGroupProps {
  groupLabel: string;
  permissions: Permission[];
  onPermissionChange: (updatedPermissions: { [key: string]: boolean }) => void;
  toggleLabel?: string;
}

const PermissionGroup: React.FC<PermissionGroupProps> = ({
  groupLabel,
  permissions,
  onPermissionChange,
  toggleLabel = 'Enable',
}) => {
  const handlePermissionChange = (permissionName: string) => {
    // Toggle the checked state of the permission
    const updatedPermissions = {
      [permissionName]: !permissions.find((p) => p.name === permissionName)
        ?.checked,
    };
    onPermissionChange(updatedPermissions); // Pass the updated state to parent
  };

  return (
    <Grid
      size={{
        sm: 12,
      }}
    >
      <List>
        <ListItem>
          <ListItemText primary={groupLabel} />
          <ToggleButtonGroup
            value={permissions
              .filter((permission) => permission.checked)
              .map((p) => p.name)}
            onChange={(_, updatedValue) => {
              const updatedPermissions = permissions.reduce(
                (acc, permission) => {
                  acc[permission.name] = updatedValue.includes(permission.name);
                  return acc;
                },
                {} as { [key: string]: boolean },
              );
              onPermissionChange(updatedPermissions);
            }}
            aria-label='permission toggle group'
          >
            {permissions.map((permission) => (
              <Grid
                key={permission.name}
                size={{
                  sm: 4,
                }}
              >
                <ToggleButton
                  value={permission.name}
                  onClick={(e) => handlePermissionChange(permission.name)}
                  style={{
                    width: '100%',
                    justifyContent: 'center',
                    margin: '0 4px',
                    padding: '6px',
                    backgroundColor: permission.checked
                      ? 'rgba(0, 0, 0, 0.08)'
                      : 'rgba(0, 0, 0, 0.04)',
                  }}
                >
                  <Typography fontSize={'10px'}>{permission.label}</Typography>
                </ToggleButton>
              </Grid>
            ))}
          </ToggleButtonGroup>
        </ListItem>
        <Divider />
      </List>
    </Grid>
  );
};

export default PermissionGroup;

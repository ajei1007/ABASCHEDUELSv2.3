import type { FC } from 'react';
import PermissionToggleGroupCrud from './PermissionToggleGroupCrud';
import PermissionToggleGroupFeatureFlag from './PermissionToggleGroupFeatureFlag';
import { permissionConfig } from './permissionsConfig';

export interface PermissionToggleGroupProps {
  group: keyof typeof permissionConfig;
  formValues: any;
  setFormValues: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
}

const PermissionToggleGroup: FC<PermissionToggleGroupProps> = ({
  group,
  formValues,
  setFormValues,
}) => {
  const config = permissionConfig[group];
  if (config.type === 'crud') {
    return (
      <PermissionToggleGroupCrud
        config={config}
        formValues={formValues}
        setFormValues={setFormValues}
      />
    );
  }

  if (config.type === 'featureFlag') {
    return (
      <PermissionToggleGroupFeatureFlag
        config={config}
        formValues={formValues}
        setFormValues={setFormValues}
      />
    );
  }

  // Fallback for unknown types
  return null;
};

export default PermissionToggleGroup;

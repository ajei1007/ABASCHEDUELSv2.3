export const STANDARD_ROLES_OPTIONS = [
  {
    label: 'Unspecified',
    value: 'unspecified',
  },
  {
    label: 'Super Admin',
    value: 'superAdmin',
    resourceTypes: ['Employee'],
  },
  {
    label: 'Admin',
    value: 'admin',
    resourceTypes: ['Employee'],
  },
  {
    label: 'Clinician',
    value: 'clinician',
    resourceTypes: ['Client', 'Employee'],
  },
  {
    label: 'Technician',
    value: 'technician',
    resourceTypes: ['Client', 'Employee'],
  },
  {
    label: 'Patient',
    value: 'patient',
    resourceTypes: ['Client'],
  },
];

export const STANDARD_ROLES_MAP = STANDARD_ROLES_OPTIONS.reduce(
  (acc, role) => {
    acc[role.value] = role.label;
    return acc;
  },
  {} as Record<string, string>,
);

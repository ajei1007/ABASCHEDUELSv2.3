export interface PermissionOption {
  [field: string]: boolean;
}

export interface PermissionGroupConfigCrud {
  type: 'crud';
  options: {
    [key: string]: PermissionOption;
  };
  labels: {
    [key: string]: string;
  };
  title?: string;
  tooltip?: string;
}

export interface PermissionGroupConfigFeatureFlag {
  type: 'featureFlag';
  featureKey?: string;
  title?: string;
  tooltip?: string;
}

export type PermissionGroupConfig =
  | PermissionGroupConfigCrud
  | PermissionGroupConfigFeatureFlag;

export type PermissionGroupConfigsMap = Record<
  | 'role'
  | 'events'
  | 'user'
  | 'activity'
  | 'cancelation'
  | 'availability'
  | 'report'
  | 'branch'
  | 'constraint'
  | 'subgroup'
  | 'adminPushNotification'
  | 'requestsFeature'
  | 'requestCancelation'
  | 'requestTimeoff'
  | 'requestAvailability'
  | 'requestConfirmation'
  | 'enableRequestNotifications'
  | 'productivityInclude'
  | 'integrationFeature'
  | 'supportRequest'
  | 'canLockScheduler'
  | 'canEditEventSchedulerLocked'
  | 'flaggingFeature'
  | 'optimizerFeature'
  | 'viewOnboardingChecklist'
  | 'clockInOut'
  | 'toggleOnboardingChecklist'
  | 'chatFeature',
  PermissionGroupConfig
>;

export const permissionConfig: PermissionGroupConfigsMap = {
  role: {
    type: 'crud',
    options: {
      view: {
        viewRole: true,
      },
      create: {
        createRole: true,
      },
      edit: {
        editRole: true,
      },
      delete: {
        deleteRole: true,
      },
    },
    labels: {
      view: 'View',
      edit: 'Edit',
      create: 'Create',
      delete: 'Delete',
    },
    title: 'Role Permissions',
    tooltip: 'Grants access to create, edit, or remove user roles',
  },
  events: {
    type: 'crud',
    options: {
      create: {
        createEvent: true,
      },
      edit: {
        editEvent: true,
      },
      delete: {
        deleteEvent: true,
      },
    },
    labels: {
      edit: 'Edit',
      create: 'Create',
      delete: 'Delete',
    },
    title: 'Event Permissions',
    tooltip: 'Grants the ability to create, edit, or delete calendar events',
  },
  user: {
    type: 'crud',
    options: {
      view: {
        viewUser: true,
      },
      create: {
        createUser: true,
      },
      edit: {
        editUser: true,
      },
      delete: {
        deleteUser: true,
      },
    },
    labels: {
      view: 'View',
      edit: 'Edit',
      create: 'Create',
      delete: 'Delete',
    },
    title: 'User Permissions',
    tooltip:
      'Enables access to view, add, and manage user accounts and their information',
  },
  activity: {
    type: 'crud',
    options: {
      create: {
        createActivity: true,
      },
      edit: {
        editActivity: true,
      },
    },
    labels: {
      edit: 'Edit',
      create: 'Create',
    },
    title: 'Activity Permissions',
    tooltip: 'Allows the creation and modification of activities',
  },
  cancelation: {
    type: 'crud',
    options: {
      view: {
        viewCancelation: true,
      },
      create: {
        createCancelation: true,
      },
      delete: {
        deleteCancelation: true,
      },
    },
    labels: {
      view: 'View',
      create: 'Create',
      delete: 'Delete',
    },
    title: 'Cancelation Permissions',
    tooltip: 'Enables adding or editing reasons for event cancellations',
  },
  availability: {
    type: 'crud',
    options: {
      view: {
        viewAvailability: true,
      },
      create: {
        createAvailability: true,
      },
      edit: {
        editAvailability: true,
      },
      delete: {
        deleteAvailability: true,
      },
    },
    labels: {
      view: 'View',
      edit: 'Edit',
      create: 'Create',
      delete: 'Delete',
    },
    title: 'Availability Permissions',
    tooltip: 'Provides access to manage user availability slots',
  },
  branch: {
    type: 'crud',
    options: {
      view: {
        viewBranch: true,
      },
      create: {
        createBranch: true,
      },
      edit: {
        editBranch: true,
      },
      delete: {
        deleteBranch: true,
      },
    },
    labels: {
      view: 'View',
      edit: 'Edit',
      create: 'Create',
      delete: 'Delete',
    },
    title: 'Branch Permissions',
    tooltip: 'Enables the creation and management of branches',
  },
  constraint: {
    type: 'crud',
    options: {
      view: {
        viewConstraint: true,
      },
      create: {
        createConstraint: true,
      },
      edit: {
        editConstraint: true,
      },
      delete: {
        deleteConstraint: true,
      },
    },
    labels: {
      view: 'View',
      edit: 'Edit',
      create: 'Create',
      delete: 'Delete',
    },
    title: 'Constraint Permissions',
    tooltip:
      'Allows editing of scheduling rules and limitations, providing flexibility to adapt the system’s scheduling behavior to current needs',
  },
  subgroup: {
    type: 'crud',
    options: {
      view: {
        viewSubgroup: true,
      },
      create: {
        createSubgroup: true,
      },
      edit: {
        editSubgroups: true,
      },
      delete: {
        deleteSubgroup: true,
      },
    },
    labels: {
      view: 'View',
      edit: 'Edit',
      create: 'Create',
      delete: 'Delete',
    },
    title: 'Subgroup Permissions',
    tooltip: 'Permits managing subgroups or tags',
  },
  report: {
    type: 'featureFlag',
    featureKey: 'viewReport',
    title: 'Report Permissions',
    tooltip: 'Allows viewing of system reports and analytics',
  },
  adminPushNotification: {
    type: 'featureFlag',
    featureKey: 'adminPushNotification',
    title: 'Admin Push Notification Permissions',
    tooltip: 'Grants the ability to send push notifications to users',
  },
  canEditEventSchedulerLocked: {
    type: 'featureFlag',
    featureKey: 'canEditEventSchedulerLocked',
    title: 'Can Edit Event Scheduler Locked',
    tooltip: 'Allows editing events even when the scheduler is locked',
  },
  canLockScheduler: {
    type: 'featureFlag',
    featureKey: 'canLockScheduler',
    title: 'Can Lock Scheduler',
    tooltip: 'Grants the ability to lock or unlock the scheduler',
  },
  flaggingFeature: {
    type: 'featureFlag',
    featureKey: 'flaggingFeature',
    title: 'Flagging Feature',
    tooltip:
      'Enables the flagging of events or items that require review or attention',
  },
  optimizerFeature: {
    type: 'featureFlag',
    featureKey: 'optimizerFeature',
    title: 'Optimizer Feature',
    tooltip: 'Provides access to the schedule optimizer tool',
  },
  chatFeature: {
    type: 'featureFlag',
    featureKey: 'chatFeature',
    title: 'Chat Feature',
    tooltip: 'Enables the use of chat functionalities within the platform',
  },
  requestsFeature: {
    type: 'featureFlag',
    featureKey: 'requestsFeature',
    title: 'Requests Feature',
    tooltip: 'Allows users to submit approval requests for actions',
  },
  requestCancelation: {
    type: 'featureFlag',
    featureKey: 'requestCancelation',
    title: 'Request Cancelation',
    tooltip: 'Lets users request the cancellation of events',
  },
  requestTimeoff: {
    type: 'featureFlag',
    featureKey: 'requestTimeoff',
    title: 'Request Timeoff',
    tooltip: 'Allows users to request time off',
  },
  requestAvailability: {
    type: 'featureFlag',
    featureKey: 'requestAvailability',
    title: 'Request Availability',
    tooltip: 'Enables users to submit their availability preferences',
  },
  requestConfirmation: {
    type: 'featureFlag',
    featureKey: 'requestConfirmation',
    title: 'Request Confirmation',
    tooltip:
      'Allows users to confirm their participation in scheduled events or activities',
  },
  enableRequestNotifications: {
    type: 'featureFlag',
    featureKey: 'enableRequestNotifications',
    title: 'Enable Request Notifications',
    tooltip: 'Enables users to receive alerts and updates',
  },
  productivityInclude: {
    type: 'featureFlag',
    featureKey: 'productivityInclude',
    title: 'Productivity Include',
    tooltip:
      'Provides access to productivity data to track user performance and workload',
  },
  integrationFeature: {
    type: 'featureFlag',
    featureKey: 'integrationFeature',
    title: 'Integration Feature',
    tooltip:
      'Grants access to tools that allow integration with external systems or platforms',
  },
  supportRequest: {
    type: 'featureFlag',
    featureKey: 'supportRequest',
    title: 'Support Request',
    tooltip: 'Allows users to submit help requests directly from the platform',
  },
  viewOnboardingChecklist: {
    type: 'featureFlag',
    featureKey: 'viewOnboardingChecklist',
    title: 'View Onboarding Checklist',
    tooltip: 'Allows users to view the onboarding checklist on Dashboard page',
  },
  toggleOnboardingChecklist: {
    type: 'featureFlag',
    featureKey: 'toggleOnboardingChecklist',
    title: 'Toggle Onboarding Checklist',
    tooltip: `Allow users to toggle the onboarding checklist's completion status`,
  },
  clockInOut: {
    type: 'featureFlag',
    featureKey: 'clockInOut',
    title: 'Can Clock In/Out',
    tooltip: 'Allows users to clock in and out of their shifts',
  },
};

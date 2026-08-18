import { Box, Grid } from '@mui/material';
import PermissionToggleGroup from './PermissionToggleGroup';
import checkCompanyPlanFeature from 'utils/checkCompanyPlanFeature';

interface Props {
  formValues: any;
  setFormValues: (vals: any) => void;
  isClient: boolean;
  isEmployee: boolean;
  membership: any;
  integrationEnabled: boolean;
}

const ALL_GROUPS = [
  'events',
  'user',
  'activity',
  'cancelation',
  'availability',
  'role',
  'branch',
  'constraint',
  'subgroup',
  'report',
  'adminPushNotification',
  'canEditEventSchedulerLocked',
  'canLockScheduler',
  'flaggingFeature',
  'optimizerFeature',
  'requestsFeature',
  'requestCancelation',
  'requestTimeoff',
  'requestAvailability',
  'requestConfirmation',
  'enableRequestNotifications',
  'productivityInclude',
  'integrationFeature',
  'supportRequest',
  'viewOnboardingChecklist',
  'toggleOnboardingChecklist',
  'clockInOut',
  'chatFeature',
] as const;

type GroupKey = (typeof ALL_GROUPS)[number];

function PermissionsGrid(props: Props) {
  const {
    formValues,
    setFormValues,
    isClient,
    isEmployee,
    membership,
    integrationEnabled,
  } = props;

  const shouldShow = (g: GroupKey) => {
    if (
      isClient &&
      [
        'user',
        'role',
        'branch',
        'constraint',
        'subgroup',
        'adminPushNotification',
        'canEditEventSchedulerLocked',
        'canLockScheduler',
        'flaggingFeature',
        'optimizerFeature',
        'clockInOut',
        'requestConfirmation',
        'productivityInclude',
        'requestsFeature',
        'events',
        'activity',
        'cancelation',
        'availability',
        'report',
      ].includes(g)
    ) {
      return false;
    }

    if (g === 'integrationFeature' && !integrationEnabled) {
      return false;
    }

    if (
      g === 'flaggingFeature' &&
      !checkCompanyPlanFeature(membership, 'flagging')
    )
      return false;
    if (
      g === 'optimizerFeature' &&
      !checkCompanyPlanFeature(membership, 'optimizer')
    ) {
      return false;
    }

    if (g === 'chatFeature' && !checkCompanyPlanFeature(membership, 'chat')) {
      return false;
    }

    if (g === 'clockInOut' && !isEmployee) {
      return false;
    }

    if (
      [
        'requestsFeature',
        'requestCancelation',
        'requestTimeoff',
        'requestAvailability',
        'requestConfirmation',
        'enableRequestNotifications',
      ].includes(g) &&
      !checkCompanyPlanFeature(membership, 'requests')
    ) {
      return false;
    }

    if (
      !isEmployee &&
      ['toggleOnboardingChecklist', 'viewOnboardingChecklist'].includes(g)
    ) {
      return false;
    }

    return true;
  };

  const visibleGroups = ALL_GROUPS.filter(shouldShow);
  const half = Math.ceil(visibleGroups.length / 2);
  const leftGroups = visibleGroups.slice(0, half) as GroupKey[];
  const rightGroups = visibleGroups.slice(half) as GroupKey[];

  const renderGroup = (group: GroupKey) => (
    <Box
      key={group}
      sx={{
        mb: 2,
        px: 2,
        py: 1,
        border: `1px solid #e0e0e0`,
        borderRadius: '8px',
        bgcolor: '#fff',
        boxShadow: '0 1px 2px rgba(0,0,0,0.025)',
        minHeight: '106px',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <PermissionToggleGroup
        group={group}
        formValues={formValues}
        setFormValues={setFormValues}
      />
    </Box>
  );

  return (
    <Box
      sx={{
        mt: 2,
        border: `1px solid #e0e0e0`,
        borderRadius: '8px',
        p: {
          xs: 2,
          xl: 3,
        },
        bgcolor: '#fdfdfd',
      }}
    >
      <Grid container columnSpacing={3}>
        <Grid
          item
          xs={12}
          xl={6}
          sx={{
            borderRight: { lg: '1px solid #e0e0e0', xs: 'none' },
            pr: {
              xl: 3,
            },
          }}
        >
          {leftGroups.map(renderGroup)}
        </Grid>

        <Grid item xs={12} xl={6} sx={{ pl: { xl: 3 } }}>
          {rightGroups.map(renderGroup)}
        </Grid>
      </Grid>
    </Box>
  );
}

export default PermissionsGrid;

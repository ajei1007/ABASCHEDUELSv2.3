import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import ShieldIcon from '@mui/icons-material/Shield';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import { TagValueTypes } from 'pages/CRUD/CustomConstraints/helpers/customTypes';

const TAGS_TYPES_WITH_ICONS = [
  {
    label: 'HealthAndSafety',
    value: TagValueTypes.HEALTH_AND_SAFETY,
    icon: <HealthAndSafetyIcon fontSize='small' />,
  },
  {
    label: 'Shield',
    value: TagValueTypes.SHIELD,
    icon: <ShieldIcon fontSize='small' />,
  },
  {
    label: 'ShieldOutlined',
    value: TagValueTypes.SHIELD_OUTLINED,
    icon: <ShieldOutlinedIcon fontSize='small' />,
  },
];

export default TAGS_TYPES_WITH_ICONS;

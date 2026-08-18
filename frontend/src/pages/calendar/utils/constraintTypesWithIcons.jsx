import ExtensionOutlinedIcon from '@mui/icons-material/ExtensionOutlined';
import ExtensionOffOutlinedIcon from '@mui/icons-material/ExtensionOffOutlined';
import HourglassBottomOutlinedIcon from '@mui/icons-material/HourglassBottomOutlined';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import ConnectWithoutContactOutlinedIcon from '@mui/icons-material/ConnectWithoutContactOutlined';
import WorkHistoryOutlinedIcon from '@mui/icons-material/WorkHistoryOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import SpaceBarOutlinedIcon from '@mui/icons-material/SpaceBarOutlined';
import DriveEtaOutlinedIcon from '@mui/icons-material/DriveEtaOutlined';
import ModeOfTravelOutlinedIcon from '@mui/icons-material/ModeOfTravelOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import RepartitionOutlinedIcon from '@mui/icons-material/RepartitionOutlined';
import PieChartOutlineOutlinedIcon from '@mui/icons-material/PieChartOutlineOutlined';
import StarsOutlinedIcon from '@mui/icons-material/StarsOutlined';
import LayersOutlinedIcon from '@mui/icons-material/LayersOutlined';
import HourglassDisabledOutlinedIcon from '@mui/icons-material/HourglassDisabledOutlined';
import EventBusyOutlinedIcon from '@mui/icons-material/EventBusyOutlined';
import Diversity3Icon from '@mui/icons-material/Diversity3';
import { ConstraintTypesValueTypes } from 'pages/CRUD/CustomConstraints/helpers/customTypes';

const CONSTRAINT_TYPES_WITH_ICONS = [
  { label: 'Matching', value: ConstraintTypesValueTypes.MATCHING, icon: <ExtensionOutlinedIcon fontSize='small' /> },
  { label: 'Unmatching', value: ConstraintTypesValueTypes.UNMATCHING, icon: <ExtensionOffOutlinedIcon fontSize='small' /> },
  { label: 'Session Length', value: ConstraintTypesValueTypes.SESSION_LENGTH, icon: <HourglassBottomOutlinedIcon fontSize='small' /> },
  { label: 'Authorization', value: ConstraintTypesValueTypes.AUTHORIZATION, icon: <VerifiedUserOutlinedIcon fontSize='small' /> },
  { label: 'User to User(s) Frequency', value: ConstraintTypesValueTypes.USER_TO_USER, icon: <ConnectWithoutContactOutlinedIcon fontSize='small' /> },
  { label: 'User Session Frequency', value: ConstraintTypesValueTypes.USER_TO_SESSION, icon: <WorkHistoryOutlinedIcon fontSize='small' /> },
  { label: 'Time', value: ConstraintTypesValueTypes.TIME, icon: <AccessTimeOutlinedIcon fontSize='small' /> },
  { label: 'Gaps', value: ConstraintTypesValueTypes.GAPS, icon: <SpaceBarOutlinedIcon fontSize='small' /> },
  { label: 'Drive', value: ConstraintTypesValueTypes.DRIVE, icon: <DriveEtaOutlinedIcon fontSize='small' /> },
  { label: 'Distance', value: ConstraintTypesValueTypes.DISTANCE, icon: <ModeOfTravelOutlinedIcon fontSize='small' /> },
  { label: 'Group', value: ConstraintTypesValueTypes.GROUPING, icon: <GroupsOutlinedIcon fontSize='small' /> },
  { label: 'Back to Back', value: ConstraintTypesValueTypes.BACKTOBACK, icon: <RepartitionOutlinedIcon fontSize='small' /> },
  { label: 'Break Quantity', value: ConstraintTypesValueTypes.BREAKQUANTITY, icon: <PieChartOutlineOutlinedIcon fontSize='small' /> },
  { label: 'Priority', value: ConstraintTypesValueTypes.PRIORITY, icon: <StarsOutlinedIcon fontSize='small' /> },
  { label: 'Sibling Branch', value: ConstraintTypesValueTypes.SIBLING_BRANCH, icon: <Diversity3Icon fontSize='small' /> },
  // 
  { label: 'Overbooking', value: 'overbooking', icon: <LayersOutlinedIcon fontSize='small' /> },
  { label: 'Empty Availability', value: 'emptyAvailability', icon: <HourglassDisabledOutlinedIcon fontSize='small' /> },
  { label: 'Not Availabile Busy', value: 'notAvailableBusy', icon: <EventBusyOutlinedIcon fontSize='small' /> },
];

export default CONSTRAINT_TYPES_WITH_ICONS;
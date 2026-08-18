import ViewAgendaOutlinedIcon from '@mui/icons-material/ViewAgendaOutlined';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import VolunteerActivismOutlinedIcon from '@mui/icons-material/VolunteerActivismOutlined';
import MonitorHeartOutlinedIcon from '@mui/icons-material/MonitorHeartOutlined';

const frontendRoles = [
  {
    name: 'Activity',
    color: 'black',
    icon: <MonitorHeartOutlinedIcon />,
  },
  {
    name: 'Block',
    color: 'orange',
    icon: <ViewAgendaOutlinedIcon />,
  },
  {
    name: 'Client',
    color: 'blue',
  },
  {
    name: 'Employee',
    color: 'green',
    icon: <BadgeOutlinedIcon />,
  },
  {
    name: 'Funder',
    color: 'red',
    icon: <VolunteerActivismOutlinedIcon />,
  },
  {
    name: 'Location',
    color: 'brown',
    icon: <PlaceOutlinedIcon />,
  },
];

export default frontendRoles;

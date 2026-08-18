import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import moment from 'moment-timezone';
import { useAppDispatch } from 'store/hooks';
import { useNavigate, useLocation } from 'react-router';
import { logoutUser, switchUser } from '../../store/actions/authActions';
import {
  openSidebar,
  closeSidebar,
} from '../../store/actions/navigationActions';
import { useTypedSelector } from '../../hooks/useTypedSelector';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import styles from './Header.module.scss';
// import 'animate.css';
import CustomButton from 'components/Button';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import SupportTicket from './SupportTicket';
import {
  Badge,
  Chip,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
} from '@mui/material';
import KeyIcon from '@mui/icons-material/Key';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import role_permissions from 'helpers/role_permissions';
import { CustomIconButton } from 'components/CustomIconButton/CustomIconButton';
import PublicIcon from '@mui/icons-material/Public';
import GlobalSettings from '../Settings/GlobalSettings';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import { toggleIsNotificationsMenuOpen } from 'store/actions/notifications';
import NotificationModal from 'components/Settings/helpers/NotificationModal';
import LoginIcon from '@mui/icons-material/Login';
// import Walkthrough from '../walkthrough/Walkthrough';
// import role_permissions from 'helpers/role_permissions';
import PaymentsIcon from '@mui/icons-material/Payments';
import { openCustomerPortal } from '../../services/openCustomerPortal';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import config from 'config';

const redirectToPage = (url: string): void => {
  window.open(url, '_blank');
};

const Header = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const location = useLocation();
  const sidebarOpened = useTypedSelector(
    (store) => store.navigation.sidebarOpened,
  );

  const currentUser = useTypedSelector((store) => store.auth.currentUser);

  // Notifications
  const notifications: any[] = useSelector((state: any) => {
    return state.notifications.notifications;
  });

  // Branch/timezone from redux
  const timezone = useSelector(
    (state: any) => state.settings.settingValues.timezone,
  );
  const branchDefaultName = useSelector(
    (state: any) => state.settings.settingValues.branchDefaultName,
  );

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const [modalSupportTicket, setModalSupportTicket] = useState(false);
  const [modalSetting, setModalSetting] = useState(false);
  const [notifAnchor, setNotifAnchor] = useState<HTMLElement | null>(null);

  const toggleModalSetting = () => {
    setModalSetting((prev) => !prev);
  };
  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleClickSupportTicket = () => {
    setModalSupportTicket((prev: any) => !prev);
  };

  const toggleSidebar = () => {
    if (sidebarOpened) {
      dispatch(closeSidebar());
    } else {
      const paths = location.pathname.split('/');
      paths.pop();
      dispatch(openSidebar());
    }
  };

  const doLogout = () => {
    dispatch(logoutUser());
  };

  const userId: any = localStorage.getItem('userId');

  const doSwitch = () => {
    if (userId) {
      dispatch(switchUser(JSON.parse(userId)));
    }
  };

  const handleRedirectConfluence = () => {
    redirectToPage(
      'https://abaschedules-v2.atlassian.net/wiki/external/NGI3MjA2YmZiZWY1NDlmNDlhZjA1MjZmMGVhOGZjOGU',
    );
  };

  const handleRedirectConfluenceFaq = () => {
    redirectToPage(
      'https://abaschedules-v2.atlassian.net/wiki/spaces/PQ/overview',
    );
  };

  const userName = useMemo(() => {
    return (
      (currentUser &&
        (currentUser.firstName && currentUser.lastName
          ? `${currentUser.firstName} ${currentUser.lastName}`
          : currentUser.firstName)) ||
      'Hi!'
    );
  }, [currentUser]);

  const handleMenuItemPasswordChangeClick = () => {
    navigate('/app/password');
  };

  const notificationCount = useMemo(() => {
    const notifChecked = notifications.filter(
      (notif) => notif.checked === false,
    ).length;
    return notifChecked;
  }, [notifications]);

  const timezoneWithOffset = useMemo(() => {
    if (!timezone) return;

    // Calculate the offset in hours
    let offset = moment.tz(timezone).utcOffset() / 60;

    // Adjust for POSIX reversal in Etc/GMT timezones
    if (timezone.startsWith('Etc/GMT')) {
      offset = -offset; // Reverse the offset for intuitive display
    }

    // Replace underscores with spaces for display
    const displayTimezone = timezone.replace(/_/g, ' ');

    // Combine the adjusted timezone name and offset
    return `${displayTimezone} (UTC${offset >= 0 ? '+' : ''}${offset})`;
  }, [timezone]);

  return (
    <>
      <Stack
        className={styles.headerNavbar}
        flexDirection='row'
        alignItems='center'
        justifyContent='space-between'
        data-qa='navbar-container'
      >
        <Stack>
          <IconButton onClick={toggleSidebar} className={styles.navItem}>
            <MenuRoundedIcon />
          </IconButton>
        </Stack>
        <Stack direction='row' alignItems='center'>
          <Stack direction='row' spacing={1} alignItems='center'>
            {/* Display Branch Name and Time Zone*/}
            {branchDefaultName !== '' && (
              <>
                <Chip
                  label={branchDefaultName}
                  variant='outlined'
                  sx={{ fontSize: '0.7rem', height: 32 }}
                />
                <Chip
                  label={timezoneWithOffset}
                  variant='outlined'
                  sx={{ fontSize: '0.7rem', height: 32 }}
                />
              </>
            )}
            {/* Global Settings */}
            <CustomIconButton
              name='Global Settings'
              onClick={toggleModalSetting}
            >
              <PublicIcon />
            </CustomIconButton>
          </Stack>

          {/* Notifications */}
          <CustomIconButton
            name='Notifications'
            onClick={(e) => {
              setNotifAnchor(e.currentTarget);
              dispatch(toggleIsNotificationsMenuOpen(true));
            }}
            data-qa='navbar-notifications'
          >
            <Badge
              badgeContent={notificationCount}
              max={99}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              invisible={notificationCount === 0}
              sx={{
                '& .MuiBadge-badge': {
                  backgroundColor: '#ff4b23',
                  color: '#ffffff',
                  height: '15px !important',
                  minWidth: '15px !important',
                  padding: '0 !important',
                  top: '4px !important',
                },
              }}
            >
              <NotificationsNoneOutlinedIcon />
            </Badge>
          </CustomIconButton>

          {config.deploymentInfo && (
            <CustomIconButton
              name='Deployment update'
              onClick={handleRedirectConfluence}
            >
              <RocketLaunchIcon />
            </CustomIconButton>
          )}

          <CustomIconButton name='FAQ' onClick={handleRedirectConfluenceFaq}>
            <HelpOutlineOutlinedIcon />
          </CustomIconButton>
          {/* Support */}
          {role_permissions(currentUser, 'supportRequest') && (
            <CustomButton
              variant='text'
              onClick={handleClickSupportTicket}
              startIcon={<SupportAgentIcon />}
              data-qa='navbar-support'
            >
              Support
            </CustomButton>
          )}

          <CustomButton
            variant='text'
            onClick={handleClick}
            startIcon={<KeyboardArrowDownRoundedIcon />}
            data-qa='navbar-user-menu'
          >
            {userName}
          </CustomButton>

          <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
            <MenuItem onClick={handleMenuItemPasswordChangeClick}>
              <ListItemIcon>
                <KeyIcon fontSize='small' />
              </ListItemIcon>
              <ListItemText>Change Password</ListItemText>
            </MenuItem>
            <MenuItem
              onClick={doLogout}
              sx={{ color: '#ff4b23 !important' }}
              data-qa='navbar-logout'
            >
              <ListItemIcon>
                <LogoutOutlinedIcon
                  fontSize='small'
                  sx={{ color: '#ff4b23 !important' }}
                />
              </ListItemIcon>
              <ListItemText>Logout</ListItemText>
            </MenuItem>
            {userId && (
              <MenuItem onClick={doSwitch} sx={{ color: '#4d53e0 !important' }}>
                <ListItemIcon>
                  <LoginIcon
                    fontSize='small'
                    sx={{ color: '#4d53e0 !important' }}
                  />
                </ListItemIcon>
                <ListItemText>Switch Back</ListItemText>
              </MenuItem>
            )}
            {(currentUser?.roles[0].managePayments ||
              currentUser?.roles[0].viewPayments) && (
              <MenuItem onClick={openCustomerPortal}>
                <ListItemIcon>
                  <PaymentsIcon fontSize='small' />
                </ListItemIcon>
                <ListItemText>Payments</ListItemText>
              </MenuItem>
            )}
          </Menu>
        </Stack>
        <SupportTicket
          modalSupportTicket={modalSupportTicket}
          setModalSupportTicket={setModalSupportTicket}
        />
        <GlobalSettings
          modalSetting={modalSetting}
          setModalSetting={setModalSetting}
          toggleModalSetting={toggleModalSetting}
        />
        <NotificationModal
          anchorEl={notifAnchor}
          setAnchorEl={setNotifAnchor}
        />
      </Stack>
    </>
  );
};

export default Header;

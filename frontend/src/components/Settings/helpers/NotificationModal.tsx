import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Typography,
  IconButton,
  Card,
  CardActionArea,
  Avatar,
  List,
  ListSubheader,
  Stack,
  Box,
  Skeleton,
  FormControlLabel,
  Grow,
  Tooltip,
  Badge,
  Popover,
} from '@mui/material';
import moment from 'moment';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  updateNotifications,
  getNotifications,
  toggleIsNotificationsMenuOpen,
} from 'store/actions/notifications';
import CustomSwitch from 'components/CustomSwitch/CustomSwitch';
import { useNotificationsSocket } from '../hooks/useNotificationsSocket';
import socket from 'services/socket';
import TaskAltRoundedIcon from '@mui/icons-material/TaskAltRounded';
import { formatNameInitial, generateColorsForName } from 'utils/userDisplay';

// Icons
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';

type NotificationItemProps = {
  notification: Notification;
  onMarkRead: (id: string) => void;
};

const NotificationCard: React.FC<NotificationItemProps> = ({
  notification,
  onMarkRead,
}) => {
  const isUnread = !notification.checked;

  const sender = notification.sender
    ? `${notification.sender.firstName} ${notification.sender.lastName}`
    : 'System';

  const initials = formatNameInitial(sender);
  const { background, foreground } = generateColorsForName(sender);

  const bg = isUnread ? '#EDEDFC' : '#FFFFFF';

  const stripeColors: Record<Notification['notificationType'], string> = {
    Danger: '#D32F2F', // Red
    Warning: '#F57C00', // Orange
    Success: '#388E3C', // Green
    Info: '#1976D2', // Blue
    Default: '#ededed',
  };
  const stripeColor = stripeColors[notification.notificationType];

  const typeIcons: Record<Notification['notificationType'], JSX.Element> = {
    Danger: <ErrorOutlineIcon sx={{ fontSize: '1rem', color: '#D32F2F' }} />,
    Warning: <WarningAmberIcon sx={{ fontSize: '1rem', color: '#F57C00' }} />,
    Success: (
      <CheckCircleOutlineIcon sx={{ fontSize: '1rem', color: '#388E3C' }} />
    ),
    Info: <InfoOutlinedIcon sx={{ fontSize: '1rem', color: '#1976D2' }} />,
    Default: (
      <ChatBubbleOutlineIcon sx={{ fontSize: '1rem', color: '#6C757D' }} />
    ),
  };

  return (
    <Grow in appear timeout={240}>
      <Card
        elevation={isUnread ? 4 : 1}
        sx={{
          mb: 1.5,
          backgroundColor: bg,
          overflow: 'hidden',
          borderRadius: '8px',
          border: '1px solid #dddddd',
          pl: 0,
          position: 'relative',
        }}
        onClick={() => {
          if (isUnread) {
            onMarkRead(notification.id);
          }
        }}
      >
        {/* Vertical Stripe */}
        <Box
          sx={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: '4px',
            backgroundColor: stripeColor,
            borderTopLeftRadius: '8px',
            borderBottomLeftRadius: '8px',
          }}
        />
        <CardActionArea
          sx={{
            pl: 2,
            pr: 1.5,
            py: 1.5,
            display: 'flex',
            gap: 1.5,
            ml: '4px',
          }}
        >
          <Badge
            color='error'
            variant='dot'
            overlap='circular'
            invisible={!isUnread}
            sx={{
              mt: '3px',
              mb: 'auto',
              '& .MuiBadge-badge': {
                top: 4,
                right: 4,
                borderWidth: '1px',
                borderStyle: 'solid',
                borderColor: '#fff',
              },
            }}
          >
            <Avatar
              sx={{
                bgcolor: background,
                color: foreground,
                width: 32,
                height: 32,
                fontSize: 14,
              }}
            >
              {initials}
            </Avatar>
          </Badge>
          <Box flex={1} minWidth={0}>
            <Typography
              sx={{
                fontSize: '0.75rem!important',
                lineHeight: '1.4',
                color: '#6c757d',
                fontWeight: 500,
              }}
              noWrap
            >
              {notification?.sender?.firstName +
                ' ' +
                notification?.sender?.lastName}
            </Typography>
            <Typography
              sx={{
                mt: '0.15rem',
                mb: '0.25rem',
                fontSize: '0.9rem!important',
                lineHeight: '1.4',
                wordBreak: 'break-word',
              }}
            >
              {notification.message}
            </Typography>
            <Typography
              sx={{
                fontSize: '0.65rem',
                lineHeight: 1.4,
                color: 'rgba(108, 117, 125, 0.9)',
                fontWeight: 400,
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
              }}
              aria-label={`Notification created ${moment(notification.createdAt).fromNow()}`}
            >
              {typeIcons[notification.notificationType]}
              {moment(notification.createdAt).fromNow()}
            </Typography>
          </Box>

          {isUnread && (
            <Tooltip title='Mark as read' arrow>
              <IconButton
                size='small'
                onClick={(e) => {
                  e.stopPropagation();
                  onMarkRead(notification.id);
                }}
                sx={{
                  p: 0.5,
                  position: 'relative',
                  '&:focus-visible': {
                    outline: 'none',
                    boxShadow: '0 0 0 2px rgba(0, 82, 204, 0.5)',
                    borderRadius: '50%',
                  },
                  '& .ring': {
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    border: '2px solid #0052CC',
                    opacity: 0,
                    transform: 'scale(0.6)',
                    transition: 'opacity 120ms ease, transform 120ms ease',
                  },
                  '&:hover .ring, &:active .ring': {
                    opacity: 0.35,
                    transform: 'scale(1)',
                  },
                }}
              >
                {/* outer ring (hidden until hover) */}
                <span className='ring' />

                {/* solid blue dot */}
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    bgcolor: '#0052CC',
                    borderRadius: '50%',
                  }}
                />
              </IconButton>
            </Tooltip>
          )}
        </CardActionArea>
      </Card>
    </Grow>
  );
};
interface Notification {
  id: string;
  message: string;
  title?: string;
  checked: boolean;
  createdAt: string | number | Date;
  sender: { firstName: string; lastName: string } | null;
  notificationType: 'Danger' | 'Warning' | 'Success' | 'Info' | 'Default';
}

interface NotificationModalProps {
  anchorEl: HTMLElement | null;
  setAnchorEl: (el: HTMLElement | null) => void;
}

export default function NotificationModal({
  anchorEl,
  setAnchorEl,
}: NotificationModalProps) {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((s) => s.notifications.isNotificationsMenuOpen);
  const notifications: Notification[] = useAppSelector(
    (s) => s.notifications.notifications,
  );
  const currentUser = useAppSelector((state) => state.auth.currentUser);

  const safeNotifications = useMemo(
    () => (Array.isArray(notifications) ? notifications : []),
    [notifications],
  );

  const unreadCount = useMemo(
    () => safeNotifications.filter((n) => !n.checked).length,
    [safeNotifications],
  );

  const { dismissAllNotificationToasts } = useNotificationsSocket(
    socket,
    currentUser,
    isOpen,
  );

  const [unreadOnly, setUnreadOnly] = useState(false);

  const groups = useMemo(() => {
    const now = moment();
    const buckets: Record<'today' | 'yesterday' | 'earlier', Notification[]> = {
      today: [],
      yesterday: [],
      earlier: [],
    };

    safeNotifications.forEach((n) => {
      if (unreadOnly && n.checked) return;
      const diff = now.diff(moment(n.createdAt), 'days');
      if (diff < 0 || diff > 30) return;
      if (diff === 0) buckets.today.push(n);
      else if (diff === 1) buckets.yesterday.push(n);
      else buckets.earlier.push(n);
    });
    return buckets;
  }, [safeNotifications, unreadOnly]);

  const close = useCallback(() => {
    dispatch(toggleIsNotificationsMenuOpen(false));
    dismissAllNotificationToasts();
  }, [dispatch, dismissAllNotificationToasts]);

  const markAllRead = useCallback(async () => {
    const ids = safeNotifications.filter((n) => !n.checked).map((n) => n.id);
    if (ids.length === 0) return;
    await dispatch(updateNotifications(ids) as any);
    await dispatch(getNotifications() as any);
  }, [safeNotifications, dispatch]);

  const markOneRead = useCallback(
    async (id: string) => {
      await dispatch(updateNotifications([id]) as any);
      await dispatch(getNotifications() as any);
    },
    [dispatch],
  );

  useEffect(() => {
    if (isOpen) {
      dismissAllNotificationToasts();
    }
  }, [isOpen, dismissAllNotificationToasts]);

  const filtered = useMemo(() => {
    const f = (arr: Notification[]) =>
      unreadOnly ? arr.filter((n) => !n.checked) : arr;
    return {
      today: f(groups.today),
      yesterday: f(groups.yesterday),
      earlier: f(groups.earlier),
    };
  }, [groups, unreadOnly]);

  const renderBucket = (
    items: Notification[],
    label: string,
    onMarkRead: (id: string) => void,
  ) =>
    items?.length > 0 && (
      <Box key={label}>
        <ListSubheader
          disableSticky
          sx={{
            bgcolor: 'transparent',
            px: '2px',
            pt: 0.5,
            pb: 0.25,
            typography: 'overline',
            color: 'text.secondary',
          }}
        >
          {label}
        </ListSubheader>

        {items.map((n) => (
          <NotificationCard
            key={n.id}
            notification={n}
            onMarkRead={onMarkRead}
          />
        ))}
      </Box>
    );
  return (
    <Popover
      open={Boolean(anchorEl) && isOpen}
      anchorEl={anchorEl}
      onClose={() => {
        setAnchorEl(null);
        close();
      }}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      data-qa='navbar-notifications-dropdown'
      slotProps={{
        paper: {
          sx: {
            width: 480,
            maxWidth: '90vw',
            p: 2,
            borderRadius: 2,
            boxShadow: 6,
            mt: 0.5,
            ml: 1.5,
          },
        },
      }}
    >
      <Box
        sx={{
          px: 0.5,
          pb: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography
          variant='h6'
          sx={{ color: '#16365f', textTransform: 'capitalize' }}
        >
          Notifications
        </Typography>

        <Stack direction='row' alignItems='center' columnGap={1.25}>
          <FormControlLabel
            control={
              <CustomSwitch
                checked={unreadOnly}
                onChange={(_e, v) => setUnreadOnly(v)}
                style={{ marginLeft: 1 }}
              />
            }
            label={
              <Typography variant='caption' sx={{ letterSpacing: 0.2 }}>
                Only show unread
              </Typography>
            }
            labelPlacement='start'
            sx={{
              gap: 1,
              mr: 0,
              mb: 0,
            }}
          />

          <IconButton
            size='small'
            title='Mark all read'
            onClick={markAllRead}
            disabled={unreadCount === 0}
            sx={{
              color: unreadCount ? '#4d53e0' : '#f7f8fb',
              p: 0,
            }}
          >
            <Tooltip title='Mark all as read'>
              <TaskAltRoundedIcon
                sx={{
                  fontSize: 22,
                }}
              />
            </Tooltip>
          </IconButton>
        </Stack>
      </Box>

      {!Array.isArray(notifications) ? (
        <Stack sx={{ height: '100%' }}>
          <Box>
            <Skeleton variant='rounded' width='100%' height={140} />
          </Box>
        </Stack>
      ) : safeNotifications.length > 0 ? (
        <Stack sx={{ height: '100%' }}>
          {filtered.today.length ||
          filtered.yesterday.length ||
          filtered.earlier.length ? (
            <List
              sx={{
                maxHeight: '60vh',
                overflowY: 'auto',
                borderRadius: 1,
                px: 0.75,
                pt: 0,
              }}
            >
              {renderBucket(filtered.today, 'Today', markOneRead)}
              {renderBucket(filtered.yesterday, 'Yesterday', markOneRead)}
              {renderBucket(filtered.earlier, 'Earlier', markOneRead)}
              <Box sx={{ pt: 1, pb: 0.5, textAlign: 'center' }}>
                <Typography variant='caption' color='text.secondary'>
                  📅 That’s all your notifications from the
                  last&nbsp;30&nbsp;days.
                </Typography>
              </Box>
            </List>
          ) : (
            <Box sx={{ py: 6, textAlign: 'center' }}>
              <Typography variant='body1' color='text.secondary'>
                {unreadOnly ? 'Nothing unread 🎉' : 'No notifications'}
              </Typography>
            </Box>
          )}
        </Stack>
      ) : (
        <Typography textAlign={'center'} p={3}>
          📭 You’re all caught up!
        </Typography>
      )}
    </Popover>
  );
}

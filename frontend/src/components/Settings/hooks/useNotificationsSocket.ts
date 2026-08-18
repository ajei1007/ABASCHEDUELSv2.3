import { useCallback, useEffect, useRef, createElement } from 'react';
import { toast, type IconProps } from 'react-toastify';
import { useAppDispatch } from 'store/hooks';
import {
  getNotifications,
  toggleIsNotificationsMenuOpen,
} from 'store/actions/notifications';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';

const ToastBellIcon: React.FC<IconProps> = (_props) =>
  // 2. Use createElement here instead of JSX
  createElement(NotificationsOutlinedIcon, { fontSize: 'medium' });

export const useNotificationsSocket = (
  socket: any,
  currentUser: any,
  isOpen: boolean,
) => {
  const dispatch = useAppDispatch();
  const notificationToastIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!socket || !currentUser) return;

    socket.emit('register', currentUser.id);

    const handleNotification = (data: any) => {
      dispatch(getNotifications() as any);

      if (isOpen) {
        return;
      }

      const uniqueToastId = `notification-toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      notificationToastIds.current.add(uniqueToastId);
      toast(data.pushNotificationDataToEmit.message, {
        autoClose: false,
        toastId: uniqueToastId,
        icon: createElement<IconProps>(ToastBellIcon, {
          theme: 'light',
          type: 'default',
        }),
        onClick: () => {
          dispatch(toggleIsNotificationsMenuOpen(true));
          toast.dismiss(uniqueToastId);
        },
      });
    };

    socket.on('notification', handleNotification);

    return () => {
      socket.off('notification', handleNotification);
    };
  }, [socket, currentUser, dispatch, isOpen]);

  const dismissAllNotificationToasts = useCallback(() => {
    notificationToastIds.current.forEach((id) => toast.dismiss(id));
    notificationToastIds.current.clear();
  }, []);

  return { dismissAllNotificationToasts };
};

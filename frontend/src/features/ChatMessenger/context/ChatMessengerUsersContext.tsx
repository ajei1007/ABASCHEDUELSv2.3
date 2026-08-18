import {
  useState,
  useMemo,
  useContext,
  createContext,
  useCallback,
  useRef,
  useEffect,
} from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import type { IApiChatAvailableUserItem } from 'types/api';

export const ChatMessengerUsersContext = createContext<{
  users: IApiChatAvailableUserItem[];
  fetchStatus: 'idle' | 'loading' | 'error';
  fetchUsers: (params?: { searchQuery?: string }) => Promise<void>;
}>({
  users: [],
  fetchStatus: 'idle',
  fetchUsers: async () => {
    // Default implementation, can be overridden by provider
  },
});

export const useChatMessengerUsersContext = () => {
  return useContext(ChatMessengerUsersContext);
};

export const ChatMessengerUsersContextProvider = ({
  chatShown,
  children,
}: {
  chatShown: boolean;
  children: React.ReactNode;
}) => {
  const [users, setUsers] = useState<IApiChatAvailableUserItem[]>([]);
  const [fetchStatus, setFetchStatus] = useState<'idle' | 'loading' | 'error'>(
    'idle',
  );

  const lastSearchQuery = useRef<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchUsers = useCallback(
    async ({
      searchQuery = '',
    }: {
      searchQuery?: string;
    } = {}) => {
      if (searchQuery === lastSearchQuery.current) {
        // If the search query hasn't changed, do not refetch
        return;
      }

      // Cancel previous request if still in-flight
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      const controller = new AbortController();
      abortControllerRef.current = controller;

      setFetchStatus('loading');
      try {
        const response = await axios.get('/chat/available-users', {
          params: {
            fullName: searchQuery ? searchQuery : undefined,
            page: 1,
            limit: 300,
          },
          signal: controller.signal,
        });

        const users = (response?.data?.rows || []).map((user: any) => ({
          ...user,
          fullName: `${user.firstName} ${user.lastName}`,
          mmUserId: user?.mattermostUser?.mattermostUserId || '',
        }));

        setUsers(users);
        setFetchStatus('idle');
        lastSearchQuery.current = searchQuery;
      } catch (error: any) {
        if (
          axios.isCancel?.(error) ||
          error?.name === 'CanceledError' ||
          error?.code === 'ERR_CANCELED'
        ) {
          // Request was cancelled, do not show error toast
          return;
        }
        toast.error('Failed to fetch users. Please try again.');
        console.error('Error fetching users:', error);
        setFetchStatus('error');
      }
    },
    [],
  );

  const contextValue = useMemo(
    () => ({
      users,
      fetchStatus,
      fetchUsers,
    }),
    [users, fetchStatus, fetchUsers],
  );

  useEffect(() => {
    if (!chatShown) {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      setFetchStatus('idle'); // Reset fetch status when chat is hidden
      setUsers([]); // Clear users when chat is hidden
      lastSearchQuery.current = null; // Reset last search query
    }
  }, [chatShown]);

  useEffect(() => {
    return () => {
      // Cleanup: cancel any in-flight request on unmount
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return (
    <ChatMessengerUsersContext.Provider value={contextValue}>
      {children}
    </ChatMessengerUsersContext.Provider>
  );
};

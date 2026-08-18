import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'react-toastify';
import { useChatMessengerClientContext } from '../context/ChatMessengerClientContext';
import {
  useChatMessengerEventBusContext,
  type IChatMessengerEventBusMap,
} from '../context/ChatMessengerEventBusContext';
import type { TeamUnread } from '@mattermost/types/teams';

// Configuration constants for better maintainability
const POLLING_INTERVAL_MS = 30000; // 30 seconds
const DEBOUNCE_DELAY_MS = 150; // 150ms debounce delay

/**
 * Custom hook for managing polling and debounce timers
 * Provides centralized timer management with proper cleanup
 */
function useTimerManager() {
  const intervalTimerRef = useRef<number | null>(null);
  const debounceTimerRef = useRef<number | null>(null);

  const clearAllTimers = useCallback(() => {
    if (debounceTimerRef.current) {
      window.clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    if (intervalTimerRef.current) {
      window.clearInterval(intervalTimerRef.current);
      intervalTimerRef.current = null;
    }
  }, []);

  const setPollingTimer = useCallback(
    (callback: () => void, interval: number) => {
      // Clear existing interval before setting new one
      if (intervalTimerRef.current) {
        window.clearInterval(intervalTimerRef.current);
      }
      intervalTimerRef.current = window.setInterval(callback, interval);
    },
    [],
  );

  const setDebouncedTimer = useCallback(
    (callback: () => void, delay: number) => {
      // Clear existing timeout before setting new one
      if (debounceTimerRef.current) {
        window.clearTimeout(debounceTimerRef.current);
      }
      debounceTimerRef.current = window.setTimeout(() => {
        callback();
        debounceTimerRef.current = null;
      }, delay);
    },
    [],
  );

  // Cleanup function for use in useEffect
  const cleanup = useCallback(() => {
    clearAllTimers();
  }, [clearAllTimers]);

  return {
    setPollingTimer,
    setDebouncedTimer,
    clearAllTimers,
    cleanup,
  };
}

/**
 * Custom hook for managing chat messenger unread message count
 *
 * This hook provides real-time tracking of unread messages by:
 * - Fetching unread count on mount and periodically (every 30 seconds)
 * - Listening to message events and updating count accordingly
 * - Showing toast notifications for new messages
 *
 * @returns Object containing the current unread count
 */
export function useChatMessengerUnreadCount() {
  const { mmUrl, mmApiClient, mmUserId, mmUserTeamId } =
    useChatMessengerClientContext();
  const { eventBus } = useChatMessengerEventBusContext();
  const { setPollingTimer, setDebouncedTimer, clearAllTimers, cleanup } =
    useTimerManager();

  // State to track the total unread message count
  const [unreadCount, setUnreadCount] = useState<number>(0);

  /**
   * Fetches the current unread message count from the Mattermost API
   * Combines mention count and message count for total unread count
   * Cancels any pending timers to prevent redundant calls
   */
  const fetchUnreadCount = useCallback(async () => {
    // Early return if client is not available
    if (!mmApiClient || !mmUrl || !mmUserId || !mmUserTeamId) {
      console.warn('Chat messenger client not properly initialized');
      return;
    }

    // Cancel all timers and restart polling to reset the cycle
    clearAllTimers();
    setPollingTimer(() => fetchUnreadCount(), POLLING_INTERVAL_MS);

    try {
      const response = await mmApiClient.makeRequest<TeamUnread>({
        url: `users/${mmUserId}/teams/${mmUserTeamId}/unread`,
        method: 'get',
      });

      // Calculate total unread count (mentions + regular messages)
      const totalUnread =
        (response.mention_count || 0) + (response.msg_count || 0);
      setUnreadCount(totalUnread);
    } catch (error) {
      console.error('Failed to fetch unread message count:', error);
      // Don't update state on error to maintain last known good value
    }
  }, [
    mmApiClient,
    mmUrl,
    mmUserId,
    mmUserTeamId,
    clearAllTimers,
    setPollingTimer,
  ]);

  /**
   * Effect for initial fetch and periodic polling of unread count
   * Sets up a 30-second interval to keep the count fresh
   */
  useEffect(() => {
    // Fetch initial unread count
    fetchUnreadCount();

    // Cleanup function to prevent memory leaks
    return cleanup;
  }, [fetchUnreadCount, cleanup]);

  /**
   * Effect for handling real-time message events
   * Listens to message events and debounces unread count updates to prevent excessive API calls
   */
  useEffect(() => {
    /**
     * Debounced function to schedule unread count fetching
     * Prevents multiple rapid API calls when multiple events fire in quick succession
     */
    const scheduleFetchUnreadCount = () => {
      // Use the timer manager to handle debounced calls
      setDebouncedTimer(() => {
        fetchUnreadCount();
      }, DEBOUNCE_DELAY_MS);
    };

    /**
     * Handles new message events
     * Shows a toast notification and triggers unread count update
     */
    const handleMessageAdded = (
      data: IChatMessengerEventBusMap['messageAdded'],
    ) => {
      // TODO: Improve this logic to handle specific channels or messages
      // Consider passing channel/user information to make notifications more specific

      const excludedTypes = [
        'system_displayname_change',
        'system_add_to_channel',
        (type: string) => type.startsWith('system_'),
      ];

      const isExcludedType = excludedTypes.some((type) =>
        typeof type === 'string'
          ? data.post.type === type
          : type(data.post.type),
      );

      if (!isExcludedType && data.senderName) {
        toast.info(`You've got new message from ${data.senderName}`);
      }

      scheduleFetchUnreadCount();
    };

    /**
     * Handles general message events (update, delete, mark as unread)
     * Triggers unread count update without notification
     */
    const handleMessageEvents = () => {
      scheduleFetchUnreadCount();
    };

    // Set up event listeners for different message events
    eventBus.on('messageAdded', handleMessageAdded);
    eventBus.on('messageUpdated', handleMessageEvents);
    eventBus.on('messageDeleted', handleMessageEvents);
    eventBus.on('messageUnread', handleMessageEvents);

    // Cleanup function to prevent memory leaks
    return () => {
      // Use the timer manager's cleanup function
      cleanup();

      // Remove all event listeners
      eventBus.off('messageAdded', handleMessageAdded);
      eventBus.off('messageUpdated', handleMessageEvents);
      eventBus.off('messageDeleted', handleMessageEvents);
      eventBus.off('messageUnread', handleMessageEvents);
    };
  }, [eventBus, fetchUnreadCount, setDebouncedTimer, cleanup]);

  // Return the current unread count for consumers of this hook
  return {
    unreadCount,
  };
}

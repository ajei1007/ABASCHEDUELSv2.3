import { useEffect, useRef } from 'react';
import { useAppSelector } from 'store/hooks';
import { useSolGenTriggerEffect } from './useSolGenTriggerEffect';

/**
 * Custom hook that automatically retriggers solution generator jobs when sandbox mode changes
 *
 * This hook monitors the calendar's sandbox mode state and triggers a retrigger of
 * solution generator jobs whenever the sandbox mode changes (either enabled or disabled).
 * It uses a ref to track the previous sandbox mode value to detect changes efficiently.
 *
 * The hook is designed to handle the specific use case where switching between
 * sandbox and normal modes requires regenerating solutions to ensure data consistency.
 *
 * @example
 * ```typescript
 * // In a calendar component
 * function CalendarComponent() {
 *   // Automatically retrigger jobs when sandbox mode changes
 *   useSolGenTriggerOnSandboxChange();
 *
 *   return <Calendar />;
 * }
 * ```
 */
export function useSolGenTriggerOnSandboxChange() {
  // Select the current sandbox mode from the calendar state
  // Sandbox mode typically allows users to experiment with scheduling
  // without affecting the actual production data
  const sandboxMode = useAppSelector((state) => state.calendar.sandboxMode);

  // Use a ref to store the previous sandbox mode value
  // This allows us to detect changes without triggering unnecessary re-renders
  // The ref is initialized with the current sandbox mode on first render
  const previousSandboxMode = useRef(sandboxMode);

  // Determine if we should retrigger based on sandbox mode change
  // This comparison happens on every render but is computationally cheap
  const shouldTrigger = sandboxMode !== previousSandboxMode.current;

  // Use the retrigger effect hook to handle the actual job retriggering
  // This will only trigger when shouldTrigger is true (i.e., when sandbox mode changes)
  useSolGenTriggerEffect({
    shouldTrigger,
  });

  // Effect to update the previous sandbox mode ref after each render
  // This ensures we always have the previous value for comparison in the next render
  useEffect(() => {
    previousSandboxMode.current = sandboxMode;
  }, [sandboxMode]);
}

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

/**
 * A component that creates a portal to a target element inside React's virtual DOM
 * @param {Object} props - Component props
 * @param {React.RefObject} props.targetRef - Ref to the element where content should be rendered
 * @param {React.ReactNode} props.children - Content to render in the portal
 */
function InternalPortal({
  targetRef,
  children,
}: {
  targetRef: React.RefObject<HTMLElement>;
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Don't render until we have the target element
    if (targetRef.current) {
      setMounted(true);
    }

    return () => setMounted(false);
  }, [targetRef]);

  // Don't render the portal if not active or target doesn't exist
  if (!mounted || !targetRef.current) {
    return null;
  }

  return createPortal(children, targetRef.current);
}

export default InternalPortal;

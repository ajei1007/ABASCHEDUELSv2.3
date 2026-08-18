import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

/**
 * A component that creates a portal to a specified HTML element or document.body
 * @param {Object} props - Component props
 * @param {HTMLElement} [props.target] - Target element where content should be rendered. Defaults to document.body
 * @param {React.ReactNode} props.children - Content to render in the portal
 */
function Portal({
  target,
  children,
}: {
  target?: HTMLElement;
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Component is mounted, portal can be created
    setMounted(true);

    return () => setMounted(false);
  }, []);

  // Don't render the portal if not mounted
  if (!mounted) {
    return null;
  }

  // Use provided target or default to document.body
  const portalTarget = target || document.body;

  return createPortal(children, portalTarget);
}

export default Portal;

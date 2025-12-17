'use client';

import { useState, useEffect } from 'react';

// This component is a workaround for hydration errors.
// It ensures that its children are only rendered on the client side.
export function ClientOnly({ children }: { children: React.ReactNode }) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return null;
  }

  return <>{children}</>;
}

import type { HTMLAttributes } from 'react';
import { useScrollAnchorRef } from '@/context/ScrollContext';

export function ScrollAnchor({ children, className = '', ...rest }: HTMLAttributes<HTMLDivElement>) {
  const scrollAnchorRef = useScrollAnchorRef();

  return (
    <div ref={scrollAnchorRef} className={className} {...rest}>
      {children}
    </div>
  );
}

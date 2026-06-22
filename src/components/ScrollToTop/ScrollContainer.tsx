import type { HTMLAttributes } from 'react';
import { Layout } from '@/components/Layout';
import { useScrollContainerRef } from '@/context/ScrollContext';

export function ScrollContainer({ children, className = '', ...rest }: HTMLAttributes<HTMLElement>) {
  const scrollContainerRef = useScrollContainerRef();

  return (
    <Layout.Content ref={scrollContainerRef} className={className} {...rest}>
      {children}
    </Layout.Content>
  );
}

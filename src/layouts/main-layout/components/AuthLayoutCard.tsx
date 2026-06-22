import type { ReactNode } from 'react';
import { AuthBrand } from '@/layouts/main-layout/components/AuthBrand';
import { ScrollAnchor } from '@/components/ScrollToTop';

interface AuthLayoutCardProps {
  children: ReactNode;
}

export function AuthLayoutCard({ children }: AuthLayoutCardProps) {
  return (
    <ScrollAnchor className="w-full max-w-[420px] rounded-2xl border border-gray-200 bg-white px-6 py-8 shadow-lg sm:px-8 sm:py-10 dark:border-gray-700 dark:bg-gray-900">
      <AuthBrand />
      <div className="my-7 border-t border-gray-100 dark:border-gray-800" aria-hidden="true" />
      {children}
    </ScrollAnchor>
  );
}

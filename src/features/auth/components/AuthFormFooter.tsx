import type { ReactNode } from 'react';

interface AuthFormFooterProps {
  children: ReactNode;
}

export function AuthFormFooter({ children }: AuthFormFooterProps) {
  return (
    <p className="mt-8 border-t border-gray-100 pt-6 text-center text-sm text-gray-600 dark:border-gray-800 dark:text-gray-400">
      {children}
    </p>
  );
}

import { Outlet } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';

export function AuthShell() {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  );
}

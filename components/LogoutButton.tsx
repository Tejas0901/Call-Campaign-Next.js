'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth-context';

export default function LogoutButton() {
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
    router.refresh();
  };

  return (
    <Button onClick={handleLogout} variant="outline">
      Logout
    </Button>
  );
}
'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CreditCard, LogOut, Settings, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { mockDoctor } from '@/lib/data'; // Using mock data
import { useEffect, useState } from 'react';

export function UserNav() {
  const router = useRouter();
  const user = mockDoctor; // Using mock user data
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);


  const handleSignOut = async () => {
    // In a real app, you would clear the session/token
    sessionStorage.removeItem('isLoggedIn');
    router.push('/login');
  };

  const getInitials = (name?: string | null) => {
    if (!name) return 'Д';
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[1][0]}`;
    }
    return name.substring(0, 2);
  };

  if (!isMounted) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-9 w-9">
            {/* In a real app, you might have user.photoURL */}
            {/* <AvatarImage src={user?.photoURL || undefined} alt={user?.displayName || 'Аватар пользователя'} /> */}
            <AvatarFallback>{getInitials(user?.name)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user?.name || 'Доктор'}</p>
            <p className="text-xs leading-none text-muted-foreground">{user?.email || 'doctor@osteo.app'}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem disabled>
            <User />
            Профиль
          </DropdownMenuItem>
          <DropdownMenuItem disabled>
            <CreditCard />
            Биллинг
          </DropdownMenuItem>
          <DropdownMenuItem disabled>
            <Settings />
            Настройки
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut />
          Выйти
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

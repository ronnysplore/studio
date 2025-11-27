// src/app/dashboard/layout.tsx
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
  LogOut,
  User,
  LayoutGrid,
  Building,
} from 'lucide-react';

import Logo from '@/components/common/logo';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { WardrobeProvider } from '@/contexts/wardrobe-context';

function UserMenu() {
    const { data: session, status } = useSession();
    
    if (status === 'loading') {
        return (
            <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9">
                    <AvatarFallback>...</AvatarFallback>
                </Avatar>
            </Button>
        );
    }
    
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <Avatar className="h-9 w-9">
                        <AvatarImage 
                            src={session?.user?.image || undefined} 
                            alt={session?.user?.name || 'User'}
                            referrerPolicy="no-referrer"
                        />
                        <AvatarFallback className="bg-primary text-white">
                            {session?.user?.name?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{session?.user?.name || 'User'}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                            {session?.user?.email || 'user@example.com'}
                        </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                 <DropdownMenuItem asChild>
                    <Link href="/dashboard">
                        <LayoutGrid className="mr-2 h-4 w-4" />
                        <span>Personal Dashboard</span>
                    </Link>
                </DropdownMenuItem>
                 <DropdownMenuItem asChild>
                    <Link href="/business/dashboard">
                        <Building className="mr-2 h-4 w-4" />
                        <span>Business Dashboard</span>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link href="/dashboard/history">Outfit History</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/' })}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-dvh">
      <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6 shadow-sm">
        <Logo />
        <UserMenu />
      </header>
      <main className="flex-1 p-6 md:p-8 lg:p-10 bg-gradient-to-br from-background to-muted/20 overflow-auto">
        <div className="max-w-7xl mx-auto">
          <WardrobeProvider>
            {children}
          </WardrobeProvider>
        </div>
      </main>
    </div>
  );
}

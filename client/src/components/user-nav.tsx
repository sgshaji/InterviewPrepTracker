import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from '../hooks/use-auth';
import { Link } from 'react-router-dom';

export function UserNav() {
  const { user, signOut } = useAuth();

  if (!user) {
    return null;
  }

  const handleLogout = async () => {
    await signOut();
  };
  
  const userInitial = user.email?.[0] ?? 'U';

  return (
    <div className="flex items-center gap-4">
      <Button variant="ghost" onClick={handleLogout}>
        Sign out
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-9 w-9">
              <AvatarFallback>{userInitial.toUpperCase()}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user.email}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <Link to="/dashboard"><DropdownMenuItem>Dashboard</DropdownMenuItem></Link>
            <Link to="/settings"><DropdownMenuItem>Settings</DropdownMenuItem></Link>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
} 
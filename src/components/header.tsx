
import { NavLink } from "react-router-dom";
import { Search, Menu, LogOut, Settings, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserAvatar } from "@/components/user-avatar";
import { Logo } from "@/components/logo";
import { useMobileContext } from "@/hooks/use-mobile";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  user?: {
    name?: string;
    email?: string;
    image?: string;
    initials?: string;
  };
  onLoginClick?: () => void;
  onGetStartedClick?: () => void;
  onLogout?: () => void;
}

export function Header({ user, onLoginClick, onGetStartedClick, onLogout }: HeaderProps) {
  const { toggleSidebar } = useMobileContext();
  
  return (
    <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      {toggleSidebar && (
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={toggleSidebar}
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      )}
      
      <div className="w-full flex-1">
        <div className="flex items-center gap-2">
          <Logo />
          <span className="text-lg font-semibold tracking-tight">SecureVault</span>
        </div>
      </div>
      
      <div className="flex flex-1 items-center gap-4 md:ml-auto md:gap-6 lg:gap-8">
        <form className="hidden flex-1 md:flex">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-full appearance-none bg-background pl-8 shadow-none md:w-2/3 lg:w-1/3"
            />
          </div>
        </form>
        
        <ThemeToggle />
        
        <nav className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <NavLink
              to="/tags"
              className={({ isActive }) =>
                cn(
                  "relative h-9 w-9 rounded-full",
                  isActive ? "bg-secondary text-secondary-foreground" : "hover:bg-secondary/50"
                )
              }
            >
              <span className="sr-only">Tags</span>
              <span className="absolute right-0 top-0 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/80 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
            </NavLink>
          </Button>
          
          <NavLink to="/audit-logs" className="text-sm">
            <Button variant="ghost" size="sm">Audit Logs</Button>
          </NavLink>
          
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <UserAvatar
                    user={{ 
                      name: user.name,
                      image: user.image,
                      initials: user.initials || "U"
                    }}
                    className="h-8 w-8 border border-border/40"
                  />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    {user.name && <p className="font-medium">{user.name}</p>}
                    {user.email && (
                      <p className="w-[200px] truncate text-sm text-muted-foreground">
                        {user.email}
                      </p>
                    )}
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <NavLink to="/profile" className="cursor-pointer flex w-full items-center">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </NavLink>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <NavLink to="/settings" className="cursor-pointer flex w-full items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </NavLink>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer text-red-500 focus:text-red-500"
                  onClick={onLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              {onLoginClick && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1 text-xs"
                  onClick={onLoginClick}
                >
                  Log in
                </Button>
              )}
              {onGetStartedClick && (
                <Button
                  variant="default"
                  size="sm"
                  className="gap-1 text-xs hidden sm:flex"
                  onClick={onGetStartedClick}
                >
                  Get Started
                </Button>
              )}
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

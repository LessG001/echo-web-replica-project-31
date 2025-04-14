
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/user-avatar";
import { Moon, Sun } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  user?: {
    initials: string;
  };
  onLoginClick?: () => void;
  onGetStartedClick?: () => void;
}

export function Header({ user, onLoginClick, onGetStartedClick }: HeaderProps) {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    toast({
      description: `Switched to ${isDarkMode ? 'light' : 'dark'} mode`,
    });
  };
  
  const handleLogout = () => {
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    });
    navigate("/login");
  };
  
  const handleSettings = () => {
    toast({
      description: "Settings page not implemented yet",
    });
  };
  
  const handleProfile = () => {
    toast({
      description: "Profile page not implemented yet",
    });
  };
  
  return (
    <header className="w-full border-b border-border/40 py-4 px-6">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <Logo />
        
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {isDarkMode ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
          
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <UserAvatar initials={user.initials} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleProfile}>
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSettings}>
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" onClick={onLoginClick}>
                Login
              </Button>
              <Button onClick={onGetStartedClick}>
                Get Started
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

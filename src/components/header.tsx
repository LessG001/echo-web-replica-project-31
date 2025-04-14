
import { useState } from "react";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/user-avatar";
import { Moon } from "lucide-react";

interface HeaderProps {
  user?: {
    initials: string;
  };
  onLoginClick?: () => void;
  onGetStartedClick?: () => void;
}

export function Header({ user, onLoginClick, onGetStartedClick }: HeaderProps) {
  return (
    <header className="w-full border-b border-border/40 py-4 px-6">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <Logo />
        
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon">
            <Moon className="h-5 w-5" />
          </Button>
          
          {user ? (
            <UserAvatar initials={user.initials} />
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

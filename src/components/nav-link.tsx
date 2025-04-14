
import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface NavLinkProps {
  to: string;
  label: string;
  icon: LucideIcon;
  active?: boolean;
  className?: string;
  onClick?: () => void;
}

export const NavLink = forwardRef<HTMLButtonElement, NavLinkProps>(
  ({ to, label, icon: Icon, active, className, onClick }, ref) => {
    return (
      <button
        ref={ref}
        onClick={onClick}
        className={cn(
          "nav-item",
          active && "active",
          className
        )}
      >
        <Icon className="h-5 w-5" />
        <span>{label}</span>
      </button>
    );
  }
);

NavLink.displayName = "NavLink";

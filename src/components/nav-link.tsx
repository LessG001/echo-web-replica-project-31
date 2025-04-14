
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface NavLinkProps {
  to: string;
  label: string;
  icon: LucideIcon;
  active?: boolean;
  className?: string;
}

export function NavLink({ to, label, icon: Icon, active, className }: NavLinkProps) {
  return (
    <Link
      to={to}
      className={cn(
        "nav-item",
        active && "active",
        className
      )}
    >
      <Icon className="h-5 w-5" />
      <span>{label}</span>
    </Link>
  );
}

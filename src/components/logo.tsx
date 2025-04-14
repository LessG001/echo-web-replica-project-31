
import { Shield } from "lucide-react";
import { Link } from "react-router-dom";

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <Link to="/" className={`flex items-center gap-2 ${className}`}>
      <Shield className="h-6 w-6 text-primary" />
      <span className="font-semibold text-lg text-foreground">SecureVault</span>
    </Link>
  );
}

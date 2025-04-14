
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface UserAvatarProps {
  initials: string;
  className?: string;
}

export function UserAvatar({ initials, className }: UserAvatarProps) {
  return (
    <Avatar className={className}>
      <AvatarFallback className="bg-primary text-primary-foreground">
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}

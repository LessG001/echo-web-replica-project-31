
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface User {
  name?: string;
  image?: string;
  initials: string;
}

interface UserAvatarProps {
  user: User;
  className?: string;
}

export function UserAvatar({ user, className }: UserAvatarProps) {
  return (
    <Avatar className={className}>
      {user.image && (
        <AvatarImage src={user.image} alt={user.name || "User"} />
      )}
      <AvatarFallback className="bg-primary text-primary-foreground">
        {user.initials}
      </AvatarFallback>
    </Avatar>
  );
}

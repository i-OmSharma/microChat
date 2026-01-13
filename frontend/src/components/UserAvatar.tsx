import { cn } from "@/lib/utils";
import { getInitials, getAvatarColor } from "@/lib/avatar";

interface UserAvatarProps {
  name: string;
  avatar?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  showOnlineIndicator?: boolean;
  isOnline?: boolean;
}

const sizeClasses = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-12 h-12 text-base",
  xl: "w-20 h-20 text-2xl",
};

const indicatorSizes = {
  sm: "w-2 h-2",
  md: "w-2.5 h-2.5",
  lg: "w-3 h-3",
  xl: "w-4 h-4",
};

export function UserAvatar({
  name,
  avatar,
  size = "md",
  className,
  showOnlineIndicator = false,
  isOnline = false,
}: UserAvatarProps) {
  const initials = getInitials(name);
  const bgColor = getAvatarColor(name);

  return (
    <div className={cn("relative", className)}>
      {avatar ? (
        <img
          src={avatar}
          alt={name}
          className={cn(
            "rounded-full object-cover",
            sizeClasses[size]
          )}
        />
      ) : (
        <div
          className={cn(
            "rounded-full flex items-center justify-center text-white font-semibold",
            sizeClasses[size],
            bgColor
          )}
        >
          {initials}
        </div>
      )}
      {showOnlineIndicator && (
        <span
          className={cn(
            "absolute bottom-0 right-0 rounded-full ring-2 ring-card",
            indicatorSizes[size],
            isOnline ? "bg-green-500" : "bg-gray-400"
          )}
        />
      )}
    </div>
  );
}

export default UserAvatar;

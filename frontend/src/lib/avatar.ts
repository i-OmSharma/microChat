// Generate a consistent color based on user name
export function getAvatarColor(name: string): string {
  const colors = [
    'bg-red-500',
    'bg-orange-500',
    'bg-amber-500',
    'bg-yellow-500',
    'bg-lime-500',
    'bg-green-500',
    'bg-emerald-500',
    'bg-teal-500',
    'bg-cyan-500',
    'bg-sky-500',
    'bg-blue-500',
    'bg-indigo-500',
    'bg-violet-500',
    'bg-purple-500',
    'bg-fuchsia-500',
    'bg-pink-500',
    'bg-rose-500',
  ];

  // Generate a consistent index based on the name
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
}

// Get initials from name (up to 2 characters)
export function getInitials(name: string): string {
  if (!name) return 'U';

  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

// Generate a UI Avatars URL as fallback
export function getDefaultAvatarUrl(name: string): string {
  const initials = getInitials(name);
  const colors = [
    '6366f1', // indigo
    '8b5cf6', // violet
    'a855f7', // purple
    'd946ef', // fuchsia
    'ec4899', // pink
    'f43f5e', // rose
    'ef4444', // red
    'f97316', // orange
    'eab308', // yellow
    '22c55e', // green
    '14b8a6', // teal
    '06b6d4', // cyan
    '0ea5e9', // sky
    '3b82f6', // blue
  ];

  // Generate consistent color based on name
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colorIndex = Math.abs(hash) % colors.length;
  const bgColor = colors[colorIndex];

  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=${bgColor}&color=fff&size=200&bold=true`;
}

interface AvatarProps {
  name?: string | null;
  seed?: string | null;
  size?: number;
  className?: string;
}

const getInitials = (value?: string | null) => {
  if (!value) return 'U';
  const parts = value.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

const hashString = (value: string) => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

export default function Avatar({
  name,
  seed,
  size = 36,
  className,
}: AvatarProps) {
  const basis = seed ?? name ?? 'user';
  const hue = hashString(basis) % 360;
  const background = `linear-gradient(135deg, hsl(${hue} 70% 55%), hsl(${(hue + 40) % 360} 70% 45%))`;

  return (
    <div
      className={`flex items-center justify-center rounded-full text-xs font-semibold text-white ${className ?? ''}`.trim()}
      style={{ width: size, height: size, background }}
      aria-label={name ?? 'User'}
      title={name ?? 'User'}
    >
      {getInitials(name)}
    </div>
  );
}

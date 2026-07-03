interface PartnerLogoProps {
  name: string;
  className?: string;
}

export function PartnerLogo({ name, className = "" }: PartnerLogoProps) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

  return (
    <div
      className={`flex items-center justify-center rounded-lg bg-muted/40 text-sm font-semibold text-muted-foreground ${className}`}
      aria-hidden="true"
    >
      {initials}
    </div>
  );
}

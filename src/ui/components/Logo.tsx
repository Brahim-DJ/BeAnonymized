interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  return <img src="/logo-icon.png" alt="" className={className} />;
}

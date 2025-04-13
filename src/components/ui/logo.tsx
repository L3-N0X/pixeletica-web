import React from 'react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/components/theme-provider';
// Import the logo images
import logoDarkSrc from '@/assets/logo/logo-dark.svg';
import logoLightSrc from '@/assets/logo/logo-light.svg';

interface LogoIconProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function LogoIcon({ className, ...props }: LogoIconProps) {
  const { theme } = useTheme();

  // Determine which logo to use based on theme
  const isDarkTheme =
    theme === 'dark' ||
    (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  // Use imported image assets
  const logoSrc = isDarkTheme ? logoDarkSrc : logoLightSrc;

  return (
    <div className={cn('flex items-center justify-center', className)} {...props}>
      <img src={logoSrc} alt="Pixeletica Logo" className="h-9 w-9" />
    </div>
  );
}

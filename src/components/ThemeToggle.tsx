'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';

type ThemeToggleProps = {
  className?: string;
};

export function ThemeToggle({ className = '' }: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentTheme = theme === 'system' ? resolvedTheme : theme;
  const isDark = currentTheme === 'dark';
  const label = isDark ? 'Light mode' : 'Dark mode';

  if (!mounted) {
    return (
      <button type="button" className={className} disabled>
        Theme
      </button>
    );
  }

  return (
    <button type="button" onClick={() => setTheme(isDark ? 'light' : 'dark')} className={className}>
      {label}
    </button>
  );
}

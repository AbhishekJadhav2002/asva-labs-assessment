import { clsx } from 'clsx';
import type { ReactNode } from 'react';

interface BadgeProperties {
  size?: 'md' | 'sm';
  children: ReactNode;
  variant?: 'danger' | 'default' | 'info' | 'success' | 'warning';
}

export function Badge({ children, size = 'sm', variant = 'default' }: BadgeProperties) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full font-medium',
        {
          'bg-red-100 text-red-800': variant === 'danger',
          'bg-blue-100 text-blue-800': variant === 'info',
          'bg-gray-100 text-gray-800': variant === 'default',
          'bg-green-100 text-green-800': variant === 'success',
          'bg-yellow-100 text-yellow-800': variant === 'warning',
        },
        {
          'px-2 py-1 text-xs': size === 'sm',
          'px-3 py-1 text-sm': size === 'md',
        }
      )}
    >
      {children}
    </span>
  );
}
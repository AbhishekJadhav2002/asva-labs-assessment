import { clsx } from 'clsx';
import type { ReactNode } from 'react';

interface CardProperties {
  padding?: boolean;
  className?: string;
  children: ReactNode;
}

export function Card({ children, className, padding = true }: CardProperties) {
  return (
    <div
      className={clsx(
        'bg-white rounded-lg border border-gray-200 shadow-sm',
        padding && 'p-6',
        className
      )}
    >
      {children}
    </div>
  );
}
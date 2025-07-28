import { clsx } from 'clsx';
import type { ButtonHTMLAttributes} from 'react';
import { forwardRef } from 'react';

interface ButtonProperties extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  size?: 'lg' | 'md' | 'sm';
  variant?: 'danger' | 'ghost' | 'primary' | 'secondary';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProperties>(
  ({ loading, children, disabled, className, size = 'md', variant = 'primary', ...properties }, reference) => {
    return (
      <button
        className={clsx(
          'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 disabled:pointer-events-none disabled:opacity-50',
          {
            'hover:bg-gray-100 text-gray-700': variant === 'ghost',
            'bg-red-600 text-black hover:bg-red-700': variant === 'danger',
            'bg-gray-200 text-gray-900 hover:bg-gray-300': variant === 'secondary',
            'bg-primary-600 text-black hover:bg-primary-700': variant === 'primary',
          },
          {
            'h-10 px-4 py-2': size === 'md',
            'h-8 px-3 text-sm': size === 'sm',
            'h-12 px-6 text-lg': size === 'lg',
          },
          className
        )}
        disabled={disabled ?? loading}
        ref={reference}
        {...properties}
      >
        {loading && <div className="spinner mr-2" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
import { X } from 'lucide-react';
import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { Button } from './Button';

interface ModalProperties {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  size?: 'lg' | 'md' | 'sm' | 'xl';
}

export function Modal({ title, isOpen, onClose, children, size = 'md' }: ModalProperties) {
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'unset';

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return <></>;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 animate-fade">
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm bg-opacity-50" onClick={onClose} />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div className={`relative w-full ${sizeClasses[`${size}`]} bg-white rounded-lg shadow-xl animate-slide-in`}>
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="p-6">{children}</div>
        </div>
      </div>
    </div>
  );
}

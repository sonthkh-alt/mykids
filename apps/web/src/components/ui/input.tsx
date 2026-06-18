import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, id, ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="font-display text-sm font-bold text-ink/70">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={id}
        className={cn(
          'h-12 w-full rounded-2xl border-2 border-black/10 bg-white px-4 font-body text-ink',
          'focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30',
          className,
        )}
        {...props}
      />
    </div>
  ),
);
Input.displayName = 'Input';

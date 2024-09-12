import React from 'react';
import { twMerge } from 'tailwind-merge';
import { Slot } from '@radix-ui/react-slot';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, className, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';

    return (
      <Comp
        ref={ref}
        className={twMerge(
          'inline-flex items-center justify-center rounded-3 bg-slate-950 px-4 py-2 text-base font-medium text-slate-50 -outline-offset-1 outline-current transition-colors hover:brightness-125 focus:outline focus:brightness-125 disabled:pointer-events-none disabled:opacity-50',
          className
        )}
        {...props}
      >
        {children}
      </Comp>
    );
  }
);

Button.displayName = 'Button';

export default Button;

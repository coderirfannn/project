import * as React from 'react';
import { cn } from '@/lib/utils';

export const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('rounded-[1rem] border border-white/8 bg-card/90 shadow-[0_18px_50px_rgba(2,6,23,0.34)] backdrop-blur-xl', className)} {...props} />
  ),
);

Card.displayName = 'Card';

export const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn('flex flex-col gap-2 p-4 sm:p-5', className)} {...props} />,
);

CardHeader.displayName = 'CardHeader';

export const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => <h3 ref={ref} className={cn('font-display text-[0.98rem] font-semibold tracking-[-0.02em] text-white sm:text-[1.02rem]', className)} {...props} />,
);

CardTitle.displayName = 'CardTitle';

export const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => <p ref={ref} className={cn('text-sm leading-6 text-slate-400', className)} {...props} />,
);

CardDescription.displayName = 'CardDescription';

export const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn('px-4 pb-4 pt-0 sm:px-5 sm:pb-5', className)} {...props} />,
);

CardContent.displayName = 'CardContent';

export const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn('flex items-center px-4 pb-4 pt-0 sm:px-5 sm:pb-5', className)} {...props} />,
);

CardFooter.displayName = 'CardFooter';

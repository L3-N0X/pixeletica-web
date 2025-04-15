import React from 'react';
import { cn } from '@/lib/utils';

interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  className?: string;
}

export function H1({ children, className, ...props }: TypographyProps) {
  return (
    <h1
      className={cn(
        'font-zodiak font-bold scroll-m-20 text-4xl md:text-5xl tracking-tight',
        className
      )}
      {...props}
    >
      {children}
    </h1>
  );
}

export function H2({ children, className, ...props }: TypographyProps) {
  return (
    <h2
      className={cn('font-satoshi scroll-m-20 text-3xl font-semibold tracking-tight', className)}
      {...props}
    >
      {children}
    </h2>
  );
}

export function H3({ children, className, ...props }: TypographyProps) {
  return (
    <h3
      className={cn('font-satoshi scroll-m-20 text-2xl font-semibold tracking-tight', className)}
      {...props}
    >
      {children}
    </h3>
  );
}

export function H4({ children, className, ...props }: TypographyProps) {
  return (
    <h4
      className={cn('font-satoshi scroll-m-20 text-xl font-semibold tracking-tight', className)}
      {...props}
    >
      {children}
    </h4>
  );
}

export function P({ children, className, ...props }: TypographyProps) {
  return (
    <p className={cn('font-satoshi leading-7 [&:not(:first-child)]', className)} {...props}>
      {children}
    </p>
  );
}

export function Lead({ children, className, ...props }: TypographyProps) {
  return (
    <p className={cn('font-satoshi text-xl text-muted-foreground', className)} {...props}>
      {children}
    </p>
  );
}

export function Large({ children, className, ...props }: TypographyProps) {
  return (
    <div className={cn('font-satoshi text-lg font-semibold', className)} {...props}>
      {children}
    </div>
  );
}

export function Small({ children, className, ...props }: TypographyProps) {
  return (
    <small className={cn('font-satoshi text-sm font-medium leading-none', className)} {...props}>
      {children}
    </small>
  );
}

export function Muted({ children, className, ...props }: TypographyProps) {
  return (
    <p className={cn('font-satoshi text-sm text-muted-foreground', className)} {...props}>
      {children}
    </p>
  );
}

export function Logo({ children, className, ...props }: TypographyProps) {
  return (
    <h1 className={cn('font-zodiak font-extrabold text-3xl ', className)} {...props}>
      {children}
    </h1>
  );
}

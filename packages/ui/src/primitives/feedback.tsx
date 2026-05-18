import { forwardRef, type ComponentPropsWithoutRef, type ElementRef, type ReactNode } from 'react';

import { cardClassName } from '../primitives.js';
import { cn } from '../utils.js';

export type CardProps = ComponentPropsWithoutRef<'div'>;

export const Card = forwardRef<ElementRef<'div'>, CardProps>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn(cardClassName, className)} {...props} />
));
Card.displayName = 'Card';

export const CardHeader = forwardRef<ElementRef<'div'>, CardProps>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('space-y-1.5 p-4', className)} {...props} />
));
CardHeader.displayName = 'CardHeader';

export const CardContent = forwardRef<ElementRef<'div'>, CardProps>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-4 pt-0', className)} {...props} />
));
CardContent.displayName = 'CardContent';

export const CardFooter = forwardRef<ElementRef<'div'>, CardProps>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('flex items-center gap-2 p-4 pt-0', className)} {...props} />
));
CardFooter.displayName = 'CardFooter';

export type TabsProps = ComponentPropsWithoutRef<'div'>;

export const Tabs = forwardRef<ElementRef<'div'>, TabsProps>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('space-y-3', className)} {...props} />
));
Tabs.displayName = 'Tabs';

export const TabsList = forwardRef<ElementRef<'div'>, TabsProps>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('inline-flex h-9 items-center rounded-md bg-neutral-100 p-1 text-neutral-600', className)}
    role="tablist"
    {...props}
  />
));
TabsList.displayName = 'TabsList';

export interface TabsTriggerProps extends ComponentPropsWithoutRef<'button'> {
  active?: boolean;
}

export const TabsTrigger = forwardRef<ElementRef<'button'>, TabsTriggerProps>(
  ({ active = false, className, type = 'button', ...props }, ref) => (
    <button
      ref={ref}
      aria-selected={active}
      className={cn(
        'inline-flex h-7 items-center justify-center rounded px-3 text-sm font-medium transition-colors',
        active ? 'bg-background text-foreground shadow-sm' : 'hover:text-foreground',
        className,
      )}
      role="tab"
      type={type}
      {...props}
    />
  ),
);
TabsTrigger.displayName = 'TabsTrigger';

export const TabsContent = forwardRef<ElementRef<'div'>, TabsProps>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('outline-none', className)} role="tabpanel" {...props} />
));
TabsContent.displayName = 'TabsContent';

export type AccordionProps = ComponentPropsWithoutRef<'details'>;

export const Accordion = forwardRef<ElementRef<'details'>, AccordionProps>(
  ({ className, ...props }, ref) => (
    <details ref={ref} className={cn('group rounded-md border border-border', className)} {...props} />
  ),
);
Accordion.displayName = 'Accordion';

export const AccordionSummary = forwardRef<ElementRef<'summary'>, ComponentPropsWithoutRef<'summary'>>(
  ({ className, ...props }, ref) => (
    <summary
      ref={ref}
      className={cn('cursor-pointer list-none px-4 py-3 text-sm font-medium marker:hidden', className)}
      {...props}
    />
  ),
);
AccordionSummary.displayName = 'AccordionSummary';

export const AccordionContent = forwardRef<ElementRef<'div'>, CardProps>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('border-t border-border px-4 py-3 text-sm text-neutral-600', className)} {...props} />
));
AccordionContent.displayName = 'AccordionContent';

export const Collapsible = Accordion;
export const CollapsibleSummary = AccordionSummary;
export const CollapsibleContent = AccordionContent;

export type SeparatorProps = ComponentPropsWithoutRef<'div'> & {
  orientation?: 'horizontal' | 'vertical';
};

export const Separator = forwardRef<ElementRef<'div'>, SeparatorProps>(
  ({ className, orientation = 'horizontal', ...props }, ref) => (
    <div
      ref={ref}
      className={cn(orientation === 'vertical' ? 'h-full w-px' : 'h-px w-full', 'bg-border', className)}
      role="separator"
      {...props}
    />
  ),
);
Separator.displayName = 'Separator';

export type DialogProps = ComponentPropsWithoutRef<'dialog'>;

export const Dialog = forwardRef<ElementRef<'dialog'>, DialogProps>(({ className, ...props }, ref) => (
  <dialog
    ref={ref}
    className={cn('rounded-lg border border-border bg-background p-0 text-foreground shadow-md backdrop:bg-black/40', className)}
    {...props}
  />
));
Dialog.displayName = 'Dialog';

export const AlertDialog = Dialog;

export type SheetProps = ComponentPropsWithoutRef<'div'> & {
  side?: 'bottom' | 'left' | 'right' | 'top';
};

const sheetSideClassName = {
  bottom: 'inset-x-0 bottom-0 border-t',
  left: 'inset-y-0 left-0 w-80 max-w-[85vw] border-r',
  right: 'inset-y-0 right-0 w-80 max-w-[85vw] border-l',
  top: 'inset-x-0 top-0 border-b',
} as const;

export const Sheet = forwardRef<ElementRef<'div'>, SheetProps>(
  ({ className, side = 'right', ...props }, ref) => (
    <div
      ref={ref}
      className={cn('fixed z-50 bg-background p-4 shadow-md', sheetSideClassName[side], className)}
      role="dialog"
      {...props}
    />
  ),
);
Sheet.displayName = 'Sheet';

export const Drawer = forwardRef<ElementRef<'div'>, Omit<SheetProps, 'side'>>((props, ref) => (
  <Sheet ref={ref} side="bottom" {...props} />
));
Drawer.displayName = 'Drawer';

export const Popover = forwardRef<ElementRef<'div'>, CardProps>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('z-50 rounded-md border border-border bg-background p-3 text-sm shadow-md', className)}
    role="dialog"
    {...props}
  />
));
Popover.displayName = 'Popover';

export interface TooltipProps extends Omit<ComponentPropsWithoutRef<'span'>, 'content'> {
  content: ReactNode;
}

export const Tooltip = forwardRef<ElementRef<'span'>, TooltipProps>(
  ({ children, className, content, ...props }, ref) => (
    <span ref={ref} className={cn('group relative inline-flex', className)} {...props}>
      {children}
      <span className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 hidden -translate-x-1/2 rounded bg-neutral-900 px-2 py-1 text-xs text-white shadow-md group-hover:block">
        {content}
      </span>
    </span>
  ),
);
Tooltip.displayName = 'Tooltip';

export type ToastProps = ComponentPropsWithoutRef<'div'> & {
  tone?: 'danger' | 'info' | 'neutral' | 'success' | 'warning';
};

const toneClassName = {
  danger: 'border-danger-500 bg-danger-50 text-danger-700',
  info: 'border-info-500 bg-info-50 text-info-700',
  neutral: 'border-border bg-background text-foreground',
  success: 'border-success-500 bg-success-50 text-success-700',
  warning: 'border-warning-500 bg-warning-50 text-warning-700',
} as const;

export const Toast = forwardRef<ElementRef<'div'>, ToastProps>(
  ({ className, tone = 'neutral', ...props }, ref) => (
    <div
      ref={ref}
      className={cn('rounded-md border p-3 text-sm shadow-card', toneClassName[tone], className)}
      role="status"
      {...props}
    />
  ),
);
Toast.displayName = 'Toast';

export const Alert = forwardRef<ElementRef<'div'>, ToastProps>(
  ({ className, tone = 'neutral', ...props }, ref) => (
    <div
      ref={ref}
      className={cn('rounded-md border p-4 text-sm', toneClassName[tone], className)}
      role="alert"
      {...props}
    />
  ),
);
Alert.displayName = 'Alert';

import { cva, type VariantProps } from 'class-variance-authority';

export const buttonVariants = cva(
  'inline-flex h-9 items-center justify-center gap-2 rounded-md px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 disabled:pointer-events-none disabled:opacity-50',
  {
    defaultVariants: {
      size: 'md',
      variant: 'primary',
    },
    variants: {
      size: {
        sm: 'h-8 px-2.5 text-xs',
        md: 'h-9 px-3 text-sm',
        lg: 'h-10 px-4 text-sm',
      },
      variant: {
        danger: 'bg-danger-500 text-white hover:bg-danger-700',
        ghost: 'bg-transparent text-neutral-700 hover:bg-neutral-100',
        outline: 'border border-border bg-background text-foreground hover:bg-neutral-50',
        primary: 'bg-primary-600 text-white hover:bg-primary-700',
        secondary: 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200',
      },
    },
  },
);

export type ButtonVariants = VariantProps<typeof buttonVariants>;

export const badgeVariants = cva(
  'inline-flex h-6 items-center rounded-md px-2 text-xs font-medium',
  {
    defaultVariants: {
      tone: 'neutral',
    },
    variants: {
      tone: {
        danger: 'bg-danger-50 text-danger-700',
        info: 'bg-info-50 text-info-700',
        neutral: 'bg-neutral-100 text-neutral-700',
        success: 'bg-success-50 text-success-700',
        warning: 'bg-warning-50 text-warning-700',
      },
    },
  },
);

export type BadgeVariants = VariantProps<typeof badgeVariants>;

export const inputClassName =
  'h-9 w-full rounded-md border border-border bg-background px-3 text-sm outline-none transition-colors placeholder:text-neutral-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 disabled:cursor-not-allowed disabled:opacity-50';

export const textareaClassName =
  'min-h-24 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none transition-colors placeholder:text-neutral-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 disabled:cursor-not-allowed disabled:opacity-50';

export const cardClassName = 'rounded-lg border border-border bg-background shadow-card';

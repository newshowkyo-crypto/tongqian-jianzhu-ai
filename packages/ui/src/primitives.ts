import { cva, type VariantProps } from 'class-variance-authority';

export const buttonVariants = cva(
  'tq-button-motion inline-flex h-9 items-center justify-center gap-2 rounded-[var(--radius-button)] px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cyber-blue)] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
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
        danger: 'border border-danger-500/60 bg-danger-500/20 text-white shadow-[0_0_18px_rgba(220,38,38,0.28)] hover:bg-danger-500/30',
        ghost: 'bg-transparent text-[var(--text-secondary)] hover:bg-white/5 hover:text-white',
        outline: 'border border-[var(--border-silver)] bg-[rgba(10,29,61,0.48)] text-[var(--text-primary)] hover:border-[var(--border-silver-hover)] hover:bg-[var(--bg-glass-hover)]',
        primary: 'border border-[var(--accent-rose)] bg-[linear-gradient(135deg,var(--accent-rose),#b8755c)] text-navy-deepest shadow-[var(--shadow-rose-glow)] hover:brightness-110',
        secondary: 'border border-[var(--cyber-blue)] bg-[rgba(74,142,255,0.16)] text-white shadow-[var(--shadow-cyber-glow)] hover:bg-[rgba(74,142,255,0.24)]',
      },
    },
  },
);

export type ButtonVariants = VariantProps<typeof buttonVariants>;

export const badgeVariants = cva(
  'inline-flex h-6 items-center rounded-md border px-2 text-xs font-medium backdrop-blur',
  {
    defaultVariants: {
      tone: 'neutral',
    },
    variants: {
      tone: {
        danger: 'border-danger-500/50 bg-danger-500/15 text-danger-100',
        info: 'border-[var(--cyber-blue)] bg-[rgba(74,142,255,0.14)] text-[#dceaff]',
        neutral: 'border-[var(--border-silver)] bg-white/5 text-[var(--text-secondary)]',
        success: 'border-success-500/50 bg-success-500/15 text-success-100',
        warning: 'border-[var(--accent-rose)] bg-[rgba(217,152,128,0.16)] text-[var(--accent-rose-light)]',
      },
    },
  },
);

export type BadgeVariants = VariantProps<typeof badgeVariants>;

export const inputClassName =
  'tq-input-motion h-9 w-full rounded-[var(--radius-input)] border border-[var(--border-silver)] bg-[rgba(10,29,61,0.56)] px-3 text-sm text-[var(--text-primary)] outline-none transition-colors placeholder:text-[var(--text-tertiary)] focus:border-[var(--cyber-blue)] focus:ring-2 focus:ring-[rgba(74,142,255,0.22)] disabled:cursor-not-allowed disabled:opacity-50';

export const textareaClassName =
  'tq-input-motion min-h-24 w-full rounded-[var(--radius-input)] border border-[var(--border-silver)] bg-[rgba(10,29,61,0.56)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none transition-colors placeholder:text-[var(--text-tertiary)] focus:border-[var(--cyber-blue)] focus:ring-2 focus:ring-[rgba(74,142,255,0.22)] disabled:cursor-not-allowed disabled:opacity-50';

export const cardClassName = 'tq-hover-lift tq-click-inset tq-cyber-panel';

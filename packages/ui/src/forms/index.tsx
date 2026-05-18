import { type ComponentPropsWithoutRef, type ReactNode } from 'react';

import { Button, type ButtonProps } from '../primitives/form.js';
import { cn } from '../utils.js';

export interface FormShellProps extends Omit<ComponentPropsWithoutRef<'form'>, 'onSubmit'> {
  actions?: ReactNode;
  error?: ReactNode;
  isSubmitting?: boolean;
  onSubmit?: () => void | Promise<void>;
}

export function FormShell({
  actions,
  children,
  className,
  error,
  isSubmitting = false,
  onSubmit,
  ...props
}: FormShellProps): ReactNode {
  return (
    <form
      className={cn('space-y-5', className)}
      onSubmit={(event) => {
        event.preventDefault();
        void onSubmit?.();
      }}
      {...props}
    >
      {children}
      {error ? <div className="rounded-md border border-danger-100 bg-danger-50 p-3 text-sm text-danger-700">{error}</div> : null}
      {actions ? <div className={cn('flex items-center gap-2', isSubmitting && 'opacity-70')}>{actions}</div> : null}
    </form>
  );
}

export interface FormFieldProps extends ComponentPropsWithoutRef<'div'> {
  description?: ReactNode;
  error?: ReactNode;
  htmlFor?: string;
  label: ReactNode;
  required?: boolean;
}

export function FormField({
  children,
  className,
  description,
  error,
  htmlFor,
  label,
  required,
  ...props
}: FormFieldProps): ReactNode {
  return (
    <div className={cn('space-y-1.5', className)} {...props}>
      <label className="text-sm font-medium text-neutral-800" htmlFor={htmlFor}>
        {label}
        {required ? <span className="ml-1 text-danger-500">*</span> : null}
      </label>
      {description ? <p className="text-xs text-neutral-500">{description}</p> : null}
      {children}
      {error ? <p className="text-xs text-danger-600">{error}</p> : null}
    </div>
  );
}

export interface FormSectionProps extends Omit<ComponentPropsWithoutRef<'section'>, 'title'> {
  actions?: ReactNode;
  description?: ReactNode;
  title?: ReactNode;
}

export function FormSection({ actions, children, className, description, title, ...props }: FormSectionProps): ReactNode {
  return (
    <section className={cn('space-y-4 rounded-md border border-border bg-background p-4', className)} {...props}>
      {title || description || actions ? (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            {title ? <h2 className="text-base font-semibold text-neutral-900">{title}</h2> : null}
            {description ? <p className="text-sm text-neutral-600">{description}</p> : null}
          </div>
          {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}

export function SubmitButton({ children, disabled, ...props }: ButtonProps): ReactNode {
  return (
    <Button disabled={disabled} type="submit" {...props}>
      {children}
    </Button>
  );
}

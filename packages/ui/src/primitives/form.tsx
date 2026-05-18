import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ElementRef,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react';

import {
  buttonVariants,
  inputClassName,
  textareaClassName,
  type ButtonVariants,
} from '../primitives.js';
import { cn } from '../utils.js';

export type ButtonProps = ComponentPropsWithoutRef<'button'> & ButtonVariants;

export const Button = forwardRef<ElementRef<'button'>, ButtonProps>(
  ({ className, size, type = 'button', variant, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ size, variant }), className)}
      type={type}
      {...props}
    />
  ),
);
Button.displayName = 'Button';

export type InputProps = ComponentPropsWithoutRef<'input'>;

export const Input = forwardRef<ElementRef<'input'>, InputProps>(
  ({ className, type = 'text', ...props }, ref) => (
    <input ref={ref} className={cn(inputClassName, className)} type={type} {...props} />
  ),
);
Input.displayName = 'Input';

export type TextareaProps = ComponentPropsWithoutRef<'textarea'>;

export const Textarea = forwardRef<ElementRef<'textarea'>, TextareaProps>(
  ({ className, ...props }, ref) => (
    <textarea ref={ref} className={cn(textareaClassName, className)} {...props} />
  ),
);
Textarea.displayName = 'Textarea';

export interface SelectOption {
  disabled?: boolean;
  label: string;
  value: string;
}

export type SelectProps = Omit<ComponentPropsWithoutRef<'select'>, 'children'> & {
  options: SelectOption[];
  placeholder?: string;
};

export const Select = forwardRef<ElementRef<'select'>, SelectProps>(
  ({ className, options, placeholder, ...props }, ref) => (
    <select ref={ref} className={cn(inputClassName, 'appearance-none', className)} {...props}>
      {placeholder ? <option value="">{placeholder}</option> : null}
      {options.map((option) => (
        <option key={option.value} disabled={option.disabled} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  ),
);
Select.displayName = 'Select';

export type CheckboxProps = Omit<ComponentPropsWithoutRef<'input'>, 'type'>;

export const Checkbox = forwardRef<ElementRef<'input'>, CheckboxProps>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'h-4 w-4 rounded border-border text-primary-600 focus:ring-2 focus:ring-primary-100 disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      type="checkbox"
      {...props}
    />
  ),
);
Checkbox.displayName = 'Checkbox';

export type RadioProps = Omit<ComponentPropsWithoutRef<'input'>, 'type'>;

export const Radio = forwardRef<ElementRef<'input'>, RadioProps>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'h-4 w-4 rounded-full border-border text-primary-600 focus:ring-2 focus:ring-primary-100 disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      type="radio"
      {...props}
    />
  ),
);
Radio.displayName = 'Radio';

export type SwitchProps = Omit<ComponentPropsWithoutRef<'input'>, 'type'>;

export const Switch = forwardRef<ElementRef<'input'>, SwitchProps>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'h-5 w-9 cursor-pointer appearance-none rounded-full bg-neutral-300 transition-colors checked:bg-primary-600 before:block before:h-5 before:w-5 before:rounded-full before:bg-white before:shadow-sm before:transition-transform checked:before:translate-x-4 disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      role="switch"
      type="checkbox"
      {...props}
    />
  ),
);
Switch.displayName = 'Switch';

export type SliderProps = Omit<ComponentPropsWithoutRef<'input'>, 'type'>;

export const Slider = forwardRef<ElementRef<'input'>, SliderProps>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn('h-2 w-full accent-primary-600 disabled:cursor-not-allowed disabled:opacity-50', className)}
      type="range"
      {...props}
    />
  ),
);
Slider.displayName = 'Slider';

export type DatePickerProps = Omit<ComponentPropsWithoutRef<'input'>, 'type'>;

export const DatePicker = forwardRef<ElementRef<'input'>, DatePickerProps>(
  ({ className, ...props }, ref) => (
    <input ref={ref} className={cn(inputClassName, className)} type="date" {...props} />
  ),
);
DatePicker.displayName = 'DatePicker';

export interface DateRangePickerProps {
  className?: string;
  endInputProps?: InputHTMLAttributes<HTMLInputElement>;
  startInputProps?: InputHTMLAttributes<HTMLInputElement>;
}

export function DateRangePicker({
  className,
  endInputProps,
  startInputProps,
}: DateRangePickerProps): ReactNode {
  return (
    <div className={cn('grid gap-2 sm:grid-cols-2', className)}>
      <DatePicker {...startInputProps} />
      <DatePicker {...endInputProps} />
    </div>
  );
}

export type FileUploadProps = Omit<ComponentPropsWithoutRef<'input'>, 'type'>;

export const FileUpload = forwardRef<ElementRef<'input'>, FileUploadProps>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'block w-full rounded-md border border-border bg-background text-sm text-foreground file:mr-3 file:h-9 file:border-0 file:bg-neutral-100 file:px-3 file:text-sm file:font-medium file:text-neutral-800 hover:file:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      type="file"
      {...props}
    />
  ),
);
FileUpload.displayName = 'FileUpload';

export interface ComboboxProps extends Omit<ComponentPropsWithoutRef<'input'>, 'list'> {
  options: SelectOption[];
}

export const Combobox = forwardRef<ElementRef<'input'>, ComboboxProps>(
  ({ className, id, options, ...props }, ref) => {
    const listId = `${id ?? props.name ?? 'combobox'}-options`;

    return (
      <>
        <input ref={ref} className={cn(inputClassName, className)} id={id} list={listId} {...props} />
        <datalist id={listId}>
          {options.map((option) => (
            <option key={option.value} disabled={option.disabled} value={option.value}>
              {option.label}
            </option>
          ))}
        </datalist>
      </>
    );
  },
);
Combobox.displayName = 'Combobox';

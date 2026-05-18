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

export interface CalendarProps extends ComponentPropsWithoutRef<'div'> {
  days?: Array<{ date: string; disabled?: boolean; selected?: boolean }>;
}

export function Calendar({ className, days = [], ...props }: CalendarProps): ReactNode {
  return (
    <div className={cn('grid grid-cols-7 gap-1 rounded-md border border-border bg-background p-3', className)} {...props}>
      {days.map((day) => (
        <button
          key={day.date}
          className={cn(
            'min-h-11 rounded-md text-sm transition-colors hover:bg-primary-50',
            day.selected && 'bg-primary-500 text-white hover:bg-primary-600',
            day.disabled && 'cursor-not-allowed text-neutral-300 hover:bg-transparent',
          )}
          disabled={day.disabled}
          type="button"
        >
          {new Date(day.date).getDate()}
        </button>
      ))}
    </div>
  );
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

export interface RichTextEditorProps extends ComponentPropsWithoutRef<'textarea'> {
  toolbar?: ReactNode;
}

export const RichTextEditor = forwardRef<ElementRef<'textarea'>, RichTextEditorProps>(
  ({ className, toolbar, ...props }, ref) => (
    <div className="rounded-md border border-border bg-background">
      <div className="flex min-h-10 items-center gap-1 border-b border-border px-2 py-1 text-xs text-neutral-500">
        {toolbar ?? <span>加粗 / 列表 / 引用 / 附件</span>}
      </div>
      <textarea ref={ref} className={cn('min-h-40 w-full resize-y bg-transparent p-3 text-sm outline-none', className)} {...props} />
    </div>
  ),
);
RichTextEditor.displayName = 'RichTextEditor';

export interface CommandProps extends Omit<ComponentPropsWithoutRef<'div'>, 'onSelect'> {
  inputProps?: ComponentPropsWithoutRef<'input'>;
  items?: Array<{ description?: ReactNode; label: ReactNode; value: string }>;
  onSelect?: (value: string) => void;
}

export function Command({ className, inputProps, items = [], onSelect, ...props }: CommandProps): ReactNode {
  return (
    <div className={cn('overflow-hidden rounded-lg border border-border bg-background shadow-md', className)} {...props}>
      <input className={cn(inputClassName, 'rounded-none border-0 border-b border-border')} placeholder="搜索项目、客户、报告、合同" {...inputProps} />
      <div className="max-h-80 overflow-auto p-2">
        {items.map((item) => (
          <button
            key={item.value}
            className="flex min-h-11 w-full flex-col rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-primary-50"
            onClick={() => onSelect?.(item.value)}
            type="button"
          >
            <span className="font-medium text-neutral-900">{item.label}</span>
            {item.description ? <span className="text-xs text-neutral-500">{item.description}</span> : null}
          </button>
        ))}
      </div>
    </div>
  );
}

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

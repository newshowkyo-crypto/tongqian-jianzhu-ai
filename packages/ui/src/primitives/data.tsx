import { forwardRef, type ComponentPropsWithoutRef, type ElementRef, type ReactNode } from 'react';

import { badgeVariants, type BadgeVariants } from '../primitives.js';
import { cn } from '../utils.js';

export const Table = forwardRef<ElementRef<'table'>, ComponentPropsWithoutRef<'table'>>(
  ({ className, ...props }, ref) => (
    <div className="w-full overflow-auto">
      <table ref={ref} className={cn('w-full caption-bottom text-sm', className)} {...props} />
    </div>
  ),
);
Table.displayName = 'Table';

export const TableHeader = forwardRef<ElementRef<'thead'>, ComponentPropsWithoutRef<'thead'>>(
  ({ className, ...props }, ref) => <thead ref={ref} className={cn('[&_tr]:border-b', className)} {...props} />,
);
TableHeader.displayName = 'TableHeader';

export const TableBody = forwardRef<ElementRef<'tbody'>, ComponentPropsWithoutRef<'tbody'>>(
  ({ className, ...props }, ref) => <tbody ref={ref} className={cn('[&_tr:last-child]:border-0', className)} {...props} />,
);
TableBody.displayName = 'TableBody';

export const TableRow = forwardRef<ElementRef<'tr'>, ComponentPropsWithoutRef<'tr'>>(
  ({ className, ...props }, ref) => (
    <tr ref={ref} className={cn('border-b border-border transition-all duration-200 hover:bg-gradient-to-r hover:from-white hover:to-[#e8f1ff] data-[state=selected]:border-l-4 data-[state=selected]:border-l-[#d99880]', className)} {...props} />
  ),
);
TableRow.displayName = 'TableRow';

export const TableHead = forwardRef<ElementRef<'th'>, ComponentPropsWithoutRef<'th'>>(
  ({ className, ...props }, ref) => (
    <th ref={ref} className={cn('h-10 px-3 text-left align-middle text-xs font-medium text-neutral-500', className)} {...props} />
  ),
);
TableHead.displayName = 'TableHead';

export const TableCell = forwardRef<ElementRef<'td'>, ComponentPropsWithoutRef<'td'>>(
  ({ className, ...props }, ref) => <td ref={ref} className={cn('px-3 py-2 align-middle', className)} {...props} />,
);
TableCell.displayName = 'TableCell';

export interface DataTableColumn<TData> {
  cell?: (row: TData) => ReactNode;
  header: ReactNode;
  key: keyof TData & string;
}

export interface DataTableProps<TData extends Record<string, ReactNode>> {
  className?: string;
  columns: Array<DataTableColumn<TData>>;
  data: TData[];
  empty?: ReactNode;
  getRowKey?: (row: TData, index: number) => string;
}

export function DataTable<TData extends Record<string, ReactNode>>({
  className,
  columns,
  data,
  empty = null,
  getRowKey,
}: DataTableProps<TData>): ReactNode {
  return (
    <Table className={className}>
      <TableHeader>
        <TableRow>
          {columns.map((column) => (
            <TableHead key={column.key}>{column.header}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.length === 0 ? (
          <TableRow>
            <TableCell className="py-8 text-center text-neutral-500" colSpan={columns.length}>
              {empty}
            </TableCell>
          </TableRow>
        ) : (
          data.map((row, index) => (
            <TableRow key={getRowKey?.(row, index) ?? String(index)}>
              {columns.map((column) => (
                <TableCell key={column.key}>{column.cell ? column.cell(row) : row[column.key]}</TableCell>
              ))}
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}

export type BadgeProps = ComponentPropsWithoutRef<'span'> & BadgeVariants;

export const Badge = forwardRef<ElementRef<'span'>, BadgeProps>(({ className, tone, ...props }, ref) => (
  <span ref={ref} className={cn(badgeVariants({ tone }), className)} {...props} />
));
Badge.displayName = 'Badge';

export interface PaginationProps extends ComponentPropsWithoutRef<'nav'> {
  page: number;
  pageCount: number;
}

export const Pagination = forwardRef<ElementRef<'nav'>, PaginationProps>(
  ({ className, page, pageCount, ...props }, ref) => (
    <nav ref={ref} aria-label="pagination" className={cn('flex items-center gap-2 text-sm', className)} {...props}>
      <span className="tabular-nums text-neutral-600">
        {page} / {pageCount}
      </span>
    </nav>
  ),
);
Pagination.displayName = 'Pagination';

export interface AvatarProps extends ComponentPropsWithoutRef<'span'> {
  fallback: string;
  src?: string;
}

export const Avatar = forwardRef<ElementRef<'span'>, AvatarProps>(
  ({ className, fallback, src, ...props }, ref) => (
    <span
      ref={ref}
      className={cn('inline-flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-neutral-100 text-xs font-medium text-neutral-700', className)}
      {...props}
    >
      {src ? <img alt="" className="h-full w-full object-cover" src={src} /> : fallback.slice(0, 2).toUpperCase()}
    </span>
  ),
);
Avatar.displayName = 'Avatar';

export interface ProgressProps extends ComponentPropsWithoutRef<'progress'> {
  value: number;
}

export const Progress = forwardRef<ElementRef<'progress'>, ProgressProps>(
  ({ className, value, ...props }, ref) => (
    <progress
      ref={ref}
      className={cn('h-2 w-full overflow-hidden rounded-full accent-primary-600', className)}
      max={100}
      value={Math.max(0, Math.min(100, value))}
      {...props}
    />
  ),
);
Progress.displayName = 'Progress';

export const Skeleton = forwardRef<ElementRef<'div'>, ComponentPropsWithoutRef<'div'>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn('tq-shimmer rounded-md bg-neutral-100', className)} {...props} />,
);
Skeleton.displayName = 'Skeleton';

export const Spinner = forwardRef<ElementRef<'span'>, ComponentPropsWithoutRef<'span'>>(
  ({ className, ...props }, ref) => (
    <span
      ref={ref}
      className={cn('inline-block h-4 w-4 animate-spin rounded-full border-2 border-neutral-200 border-t-primary-600', className)}
      role="status"
      {...props}
    />
  ),
);
Spinner.displayName = 'Spinner';

export const Breadcrumb = forwardRef<ElementRef<'nav'>, ComponentPropsWithoutRef<'nav'>>(
  ({ className, ...props }, ref) => (
    <nav ref={ref} aria-label="breadcrumb" className={cn('flex items-center gap-1 text-sm text-neutral-500', className)} {...props} />
  ),
);
Breadcrumb.displayName = 'Breadcrumb';

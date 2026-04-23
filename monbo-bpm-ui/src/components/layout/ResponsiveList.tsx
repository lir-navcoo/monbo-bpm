import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Loader2, Eye } from 'lucide-react';

interface Column<T> {
  key: string;
  label: string;
  render?: (row: T) => React.ReactNode;
  className?: string;
}

interface ResponsiveListProps<T> {
  columns: Column<T>[];
  data: T[];
  keyField: keyof T;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  onView?: (row: T) => void;
  deleteLoading?: number | null;
  emptyText?: string;
}

function ResponsiveList<T extends Record<string, any>>({
  columns,
  data,
  keyField,
  onEdit,
  onDelete,
  onView,
  deleteLoading,
  emptyText = '暂无数据',
}: ResponsiveListProps<T>) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="flex flex-col gap-3">
        {data.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground text-sm">
              {emptyText}
            </CardContent>
          </Card>
        ) : (
          data.map((row) => (
            <Card key={String(row[keyField])} className="break-inside-avoid">
              <CardHeader className="pb-2 px-4 pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground font-mono">
                    #{row[keyField]}
                  </span>
                  <div className="flex gap-1">
                    {onEdit && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => onEdit(row)}
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    {onView && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => onView(row)}
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => onDelete(row)}
                        disabled={deleteLoading === row[keyField]}
                      >
                        {deleteLoading === row[keyField] ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-3 pt-0 space-y-1.5">
                {columns
                  .filter((col) => col.key !== 'actions')
                  .map((col) => (
                    <div
                      key={col.key}
                      className="flex justify-between items-start gap-2 text-xs"
                    >
                      <span className="text-muted-foreground shrink-0 min-w-[50px]">
                        {col.label}
                      </span>
                      <span className="text-right font-medium max-w-[60%] truncate">
                        {col.render ? col.render(row) : String(row[col.key] ?? '-')}
                      </span>
                    </div>
                  ))}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    );
  }

  // Desktop: native HTML table
  return (
    <div className="rounded-md border overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 border-b">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  'px-4 py-3 text-left font-medium text-xs uppercase tracking-wide text-muted-foreground',
                  col.className
                )}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="h-24 text-center text-muted-foreground"
              >
                {emptyText}
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr key={String(row[keyField])} className="border-b hover:bg-muted/30 transition-colors">
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn('px-4 py-3', col.className)}
                  >
                    {col.render ? col.render(row) : String(row[col.key] ?? '-')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export { ResponsiveList };
export type { Column };

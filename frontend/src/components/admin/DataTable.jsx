import { RowSkeleton } from '@/components/ui/Loading';
import { EmptyState } from '@/components/ui/Loading';
import { FaInbox } from 'react-icons/fa6';

// columns: [{ key, header, render?: (row) => node, className? }]
export const DataTable = ({ columns, rows, loading, emptyTitle = 'Nothing here yet', emptyDescription, keyField = '_id' }) => {
  if (loading) {
    return (
      <div className="card overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <RowSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!rows?.length) {
    return (
      <div className="card">
        <EmptyState icon={FaInbox} title={emptyTitle} description={emptyDescription} />
      </div>
    );
  }

  return (
    <div className="card overflow-x-auto">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead>
          <tr className="border-b border-[var(--color-line)] bg-[var(--color-paper-dim)]/50 text-xs uppercase tracking-wide text-[var(--color-ink-soft)]">
            {columns.map((col) => (
              <th key={col.key} className={`px-4 py-3 font-medium ${col.className || ''}`}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row[keyField]} className="border-b border-[var(--color-line)] last:border-0 hover:bg-[var(--color-paper-dim)]/30">
              {columns.map((col) => (
                <td key={col.key} className={`px-4 py-3 align-middle ${col.className || ''}`}>
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

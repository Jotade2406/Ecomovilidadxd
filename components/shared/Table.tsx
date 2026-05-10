'use client';

import { type ReactNode, useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface TableColumn<T> {
  key: string;
  header: string;
  render: (item: T, index: number) => ReactNode;
  className?: string;
}

interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  rowKey: (item: T) => string;
  pageSize?: number;
  emptyState?: ReactNode;
  loading?: boolean;
}

export default function Table<T>({ columns, data, rowKey, pageSize = 10, emptyState, loading = false }: TableProps<T>) {
  const [page, setPage] = useState(0);
  const totalPages = pageSize > 0 ? Math.ceil(data.length / pageSize) : 1;
  const paged = useMemo(() => {
    if (pageSize <= 0) return data;
    return data.slice(page * pageSize, (page + 1) * pageSize);
  }, [data, page, pageSize]);

  useMemo(() => { if (page >= totalPages && totalPages > 0) setPage(totalPages - 1); }, [totalPages, page]);

  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-14 animate-pulse rounded-lg" style={{ background: 'var(--bg-hover)', animationDelay: `${i * 50}ms` }} />
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return <div className="flex flex-col items-center py-12 text-center">{emptyState || <p className="text-[13px]" style={{ color: 'var(--text-muted)' }}>Sin datos</p>}</div>;
  }

  return (
    <div className="flex flex-col gap-2">
      {/* Header */}
      <div className="hidden md:flex items-center gap-3 rounded-lg px-4 py-2.5" style={{ background: 'var(--bg-hover)' }}>
        {columns.map((c) => (
          <div key={c.key} className={`text-[10px] font-semibold uppercase tracking-wider ${c.className || 'flex-1'}`} style={{ color: 'var(--text-muted)' }}>
            {c.header}
          </div>
        ))}
      </div>

      {/* Rows */}
      <div className="space-y-1">
        {paged.map((item, idx) => (
          <div
            key={rowKey(item)}
            className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 rounded-lg px-4 py-2.5 transition-all duration-100"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-hover)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--bg-surface)'; }}
          >
            {columns.map((c) => (
              <div key={c.key} className={c.className || 'flex-1'}>
                <span className="md:hidden text-[9px] font-semibold uppercase tracking-wider block mb-0.5" style={{ color: 'var(--text-muted)' }}>
                  {c.header}
                </span>
                {c.render(item, idx)}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Paginator */}
      {pageSize > 0 && totalPages > 1 && (
        <div className="flex items-center justify-between rounded-lg px-4 py-2" style={{ background: 'var(--bg-hover)' }}>
          <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
            Pág {page + 1}/{totalPages} · {data.length} registros
          </span>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0} className="p-1 rounded-md transition-colors disabled:opacity-30" style={{ color: 'var(--text-muted)' }}>
              <ChevronLeft size={14} />
            </button>
            <button onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1} className="p-1 rounded-md transition-colors disabled:opacity-30" style={{ color: 'var(--text-muted)' }}>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

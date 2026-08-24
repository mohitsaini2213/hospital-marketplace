import { FaChevronLeft, FaChevronRight } from 'react-icons/fa6';

export const Pagination = ({ page, pages, onChange }) => {
  if (pages <= 1) return null;

  const items = [];
  const windowSize = 1;
  for (let p = 1; p <= pages; p++) {
    if (p === 1 || p === pages || Math.abs(p - page) <= windowSize) {
      items.push(p);
    } else if (items[items.length - 1] !== '…') {
      items.push('…');
    }
  }

  return (
    <nav className="mt-8 flex items-center justify-center gap-1.5" aria-label="Pagination">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
        className="btn-ghost h-9 w-9 p-0 rounded-full"
      >
        <FaChevronLeft size={13} />
      </button>
      {items.map((it, i) =>
        it === '…' ? (
          <span key={`dots-${i}`} className="px-1.5 text-sm text-[var(--color-ink-soft)]">
            …
          </span>
        ) : (
          <button
            key={it}
            onClick={() => onChange(it)}
            aria-current={it === page ? 'page' : undefined}
            className={`h-9 w-9 rounded-full text-sm font-medium transition-colors ${
              it === page
                ? 'bg-[var(--color-teal-600)] text-white'
                : 'text-[var(--color-ink)] hover:bg-[var(--color-paper-dim)]'
            }`}
          >
            {it}
          </button>
        )
      )}
      <button
        onClick={() => onChange(page + 1)}
        disabled={page >= pages}
        aria-label="Next page"
        className="btn-ghost h-9 w-9 p-0 rounded-full"
      >
        <FaChevronRight size={13} />
      </button>
    </nav>
  );
};

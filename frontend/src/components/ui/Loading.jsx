export const CardSkeleton = () => (
  <div className="card animate-pulse overflow-hidden">
    <div className="h-40 bg-[var(--color-paper-dim)]" />
    <div className="space-y-3 p-4">
      <div className="h-4 w-3/4 rounded bg-[var(--color-paper-dim)]" />
      <div className="h-3 w-1/2 rounded bg-[var(--color-paper-dim)]" />
      <div className="h-3 w-2/3 rounded bg-[var(--color-paper-dim)]" />
    </div>
  </div>
);

export const CardSkeletonGrid = ({ count = 6 }) => (
  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
    {Array.from({ length: count }).map((_, i) => (
      <CardSkeleton key={i} />
    ))}
  </div>
);

export const RowSkeleton = () => (
  <div className="flex animate-pulse items-center gap-4 border-b border-[var(--color-line)] px-4 py-3">
    <div className="h-9 w-9 rounded-full bg-[var(--color-paper-dim)]" />
    <div className="flex-1 space-y-2">
      <div className="h-3 w-1/3 rounded bg-[var(--color-paper-dim)]" />
      <div className="h-2.5 w-1/4 rounded bg-[var(--color-paper-dim)]" />
    </div>
  </div>
);

export const Spinner = ({ size = 18, className = '' }) => (
  <svg
    className={`animate-spin ${className}`}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.2" />
    <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

export const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--color-line)] px-6 py-16 text-center">
    {Icon && (
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-teal-050)] text-[var(--color-teal-700)]">
        <Icon size={20} />
      </div>
    )}
    <h3 className="text-base font-semibold text-[var(--color-ink)]">{title}</h3>
    {description && <p className="mt-1.5 max-w-sm text-sm text-[var(--color-ink-soft)]">{description}</p>}
    {action && <div className="mt-5">{action}</div>}
  </div>
);

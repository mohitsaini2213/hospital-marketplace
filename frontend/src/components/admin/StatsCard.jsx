export const StatsCard = ({ label, value, icon: Icon, tone = 'teal', hint }) => {
  const tones = {
    teal: 'bg-[var(--color-teal-050)] text-[var(--color-teal-700)]',
    sand: 'bg-[var(--color-sand-050)] text-[var(--color-sand-700)]',
    amber: 'bg-[var(--color-amber-100)] text-[var(--color-amber-600)]',
    green: 'bg-[var(--color-green-100)] text-[var(--color-green-600)]',
    red: 'bg-[var(--color-red-100)] text-[var(--color-red-600)]',
  };
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-ink-soft)]">{label}</p>
          <p className="mt-2 font-display text-3xl font-semibold text-[var(--color-ink)]">{value}</p>
          {hint && <p className="mt-1 text-xs text-[var(--color-ink-soft)]">{hint}</p>}
        </div>
        {Icon && (
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${tones[tone]}`}>
            <Icon size={17} />
          </div>
        )}
      </div>
    </div>
  );
};

export const ChartCard = ({ title, action, children, className = '' }) => (
  <div className={`card p-5 ${className}`}>
    <div className="mb-4 flex items-center justify-between">
      <h3 className="text-sm font-semibold text-[var(--color-ink)]">{title}</h3>
      {action}
    </div>
    {children}
  </div>
);

import { FaCheck } from 'react-icons/fa6';

export const StepIndicator = ({ steps, current }) => (
  <ol className="flex items-center gap-1 sm:gap-2">
    {steps.map((label, i) => {
      const stepNum = i + 1;
      const isDone = stepNum < current;
      const isCurrent = stepNum === current;
      return (
        <li key={label} className="flex flex-1 items-center gap-1.5 sm:gap-2">
          <div className="flex flex-col items-center gap-1">
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                isDone
                  ? 'bg-[var(--color-teal-600)] text-white'
                  : isCurrent
                  ? 'bg-[var(--color-teal-050)] text-[var(--color-teal-700)] ring-2 ring-[var(--color-teal-600)]'
                  : 'bg-[var(--color-paper-dim)] text-[var(--color-ink-soft)]'
              }`}
            >
              {isDone ? <FaCheck size={12} /> : stepNum}
            </div>
            <span className={`hidden text-center text-[10px] font-medium sm:block ${isCurrent ? 'text-[var(--color-teal-700)]' : 'text-[var(--color-ink-soft)]'}`}>
              {label}
            </span>
          </div>
          {stepNum < steps.length && <div className={`h-0.5 flex-1 rounded ${isDone ? 'bg-[var(--color-teal-600)]' : 'bg-[var(--color-line)]'}`} />}
        </li>
      );
    })}
  </ol>
);

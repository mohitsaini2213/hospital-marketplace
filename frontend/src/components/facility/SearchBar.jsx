import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaMagnifyingGlass, FaLocationDot } from 'react-icons/fa6';
import { FACILITY_TYPES, DEFAULT_CITY } from '@/utils/constants';

export const SearchBar = ({ compact }) => {
  const [q, setQ] = useState('');
  const [type, setType] = useState('');
  const navigate = useNavigate();

  const onSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (type) params.set('type', type);
    navigate(`/directory?${params.toString()}`);
  };

  return (
    <form
      onSubmit={onSubmit}
      className={`flex w-full flex-col gap-2 rounded-2xl border border-[var(--color-line)] bg-white p-2 shadow-sm sm:flex-row sm:items-stretch ${compact ? '' : 'sm:p-2.5'}`}
    >
      <div className="flex flex-1 items-center gap-2.5 rounded-xl px-3 py-2.5">
        <FaMagnifyingGlass className="shrink-0 text-[var(--color-ink-soft)]" size={15} />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="What are you looking for? e.g. hospital, dental clinic…"
          className="w-full bg-transparent text-sm outline-none placeholder:text-[var(--color-ink-soft)]/60"
        />
      </div>

      <div className="hidden w-px bg-[var(--color-line)] sm:block" />

      <select
        value={type}
        onChange={(e) => setType(e.target.value)}
        className="rounded-xl bg-transparent px-3 py-2.5 text-sm text-[var(--color-ink)] outline-none sm:w-52"
      >
        <option value="">All facility types</option>
        {FACILITY_TYPES.filter((t) => t !== 'Other').map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>

      <div className="hidden w-px bg-[var(--color-line)] sm:block" />

      <div className="flex items-center gap-2 px-3 py-2.5 text-sm text-[var(--color-ink-soft)]">
        <FaLocationDot size={14} className="text-[var(--color-teal-600)]" />
        {DEFAULT_CITY}, Rajasthan
      </div>

      <button type="submit" className="btn-primary sm:px-6">
        Search Now
      </button>
    </form>
  );
};

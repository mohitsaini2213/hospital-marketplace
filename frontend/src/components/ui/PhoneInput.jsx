export const PhoneInput = ({ label, value, onChange, error, id, required, placeholder = '98765 43210' }) => (
  <div>
    {label && (
      <label className="label" htmlFor={id}>
        {label} {required && <span className="text-[var(--color-sand-600)]">*</span>}
      </label>
    )}
    <div className={`flex items-stretch rounded-lg border bg-white transition ${error ? 'border-[var(--color-red-600)]' : 'border-[var(--color-line)] focus-within:border-[var(--color-teal-600)] focus-within:ring-2 focus-within:ring-[var(--color-teal-100)]'}`}>
      <span className="flex items-center border-r border-[var(--color-line)] px-3 text-sm font-medium text-[var(--color-ink-soft)]">
        +91
      </span>
      <input
        id={id}
        type="tel"
        inputMode="numeric"
        maxLength={10}
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, 10))}
        placeholder={placeholder}
        className="w-full rounded-r-lg bg-transparent px-3.5 py-2.5 text-sm outline-none"
      />
    </div>
    {error && <p className="field-error">{error}</p>}
  </div>
);

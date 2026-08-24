import { useState } from 'react';
import { FaEye, FaEyeSlash, FaCheck, FaXmark } from 'react-icons/fa6';
import { passwordChecks } from '@/utils/validators';

export const PasswordInput = ({ label, value, onChange, error, showChecklist, placeholder, id, autoComplete }) => {
  const [visible, setVisible] = useState(false);
  const checks = passwordChecks(value);

  return (
    <div>
      {label && (
        <label className="label" htmlFor={id}>
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={`input pr-11 ${error ? 'input-error' : ''}`}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]"
        >
          {visible ? <FaEyeSlash size={15} /> : <FaEye size={15} />}
        </button>
      </div>
      {error && <p className="field-error">{error}</p>}
      {showChecklist && value && (
        <ul className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
          {[
            ['length', 'At least 8 characters'],
            ['upper', 'One uppercase letter'],
            ['lower', 'One lowercase letter'],
            ['number', 'One number'],
            ['special', 'One special character'],
          ].map(([key, text]) => (
            <li
              key={key}
              className={`flex items-center gap-1.5 ${checks[key] ? 'text-[var(--color-green-600)]' : 'text-[var(--color-ink-soft)]'}`}
            >
              {checks[key] ? <FaCheck size={10} /> : <FaXmark size={10} />}
              {text}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

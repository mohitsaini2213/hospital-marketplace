import { createContext, useCallback, useContext, useState } from 'react';
import { FaCircleCheck, FaCircleExclamation, FaCircleInfo, FaXmark } from 'react-icons/fa6';

const ToastContext = createContext(null);

let idCounter = 0;

const ICONS = {
  success: FaCircleCheck,
  error: FaCircleExclamation,
  info: FaCircleInfo,
};

const STYLES = {
  success: 'border-[var(--color-green-600)]/30 text-[var(--color-green-600)] bg-[var(--color-green-100)]',
  error: 'border-[var(--color-red-600)]/30 text-[var(--color-red-600)] bg-[var(--color-red-100)]',
  info: 'border-[var(--color-teal-600)]/30 text-[var(--color-teal-700)] bg-[var(--color-teal-050)]',
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (message, type = 'info', timeout = 4500) => {
      const id = ++idCounter;
      setToasts((prev) => [...prev, { id, message, type }]);
      if (timeout) setTimeout(() => dismiss(id), timeout);
      return id;
    },
    [dismiss]
  );

  const toast = {
    success: (msg) => push(msg, 'success'),
    error: (msg) => push(msg, 'error'),
    info: (msg) => push(msg, 'info'),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed bottom-5 right-5 z-[100] flex w-[min(360px,calc(100vw-2.5rem))] flex-col gap-2">
        {toasts.map((t) => {
          const Icon = ICONS[t.type];
          return (
            <div
              key={t.id}
              role="status"
              className={`flex items-start gap-2.5 rounded-xl border px-4 py-3 shadow-lg backdrop-blur-sm ${STYLES[t.type]}`}
            >
              <Icon className="mt-0.5 shrink-0" size={16} />
              <p className="flex-1 text-sm font-medium leading-snug">{t.message}</p>
              <button
                onClick={() => dismiss(t.id)}
                aria-label="Dismiss notification"
                className="shrink-0 opacity-60 hover:opacity-100"
              >
                <FaXmark size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);

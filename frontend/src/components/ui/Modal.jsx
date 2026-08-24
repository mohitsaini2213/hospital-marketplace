import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FaXmark } from 'react-icons/fa6';

export const Modal = ({ open, onClose, title, children, maxWidth = 'max-w-md' }) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[var(--color-ink)]/50 backdrop-blur-[2px]" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={`relative w-full ${maxWidth} card max-h-[85vh] overflow-y-auto p-6 shadow-2xl`}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <h3 id="modal-title" className="text-lg font-semibold text-[var(--color-ink)]">
            {title}
          </h3>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-full p-1.5 text-[var(--color-ink-soft)] hover:bg-[var(--color-paper-dim)]"
          >
            <FaXmark size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body
  );
};

export const ConfirmDialog = ({ open, onClose, onConfirm, title, description, confirmLabel = 'Confirm', tone = 'primary', loading }) => (
  <Modal open={open} onClose={onClose} title={title}>
    <p className="text-sm text-[var(--color-ink-soft)]">{description}</p>
    <div className="mt-6 flex justify-end gap-3">
      <button className="btn-secondary" onClick={onClose}>
        Cancel
      </button>
      <button
        className={tone === 'danger' ? 'btn bg-[var(--color-red-600)] text-white hover:opacity-90' : 'btn-primary'}
        onClick={onConfirm}
        disabled={loading}
      >
        {loading ? 'Please wait…' : confirmLabel}
      </button>
    </div>
  </Modal>
);

import { useEffect, useState, useCallback } from 'react';
import { FaStar, FaCheck, FaXmark, FaTriangleExclamation } from 'react-icons/fa6';
import { EmptyState } from '@/components/ui/Loading';
import { RowSkeleton } from '@/components/ui/Loading';
import { adminService } from '@/services/adminService';
import { parseApiError } from '@/services/api';
import { useToast } from '@/context/ToastContext';
import { timeAgo } from '@/utils/format';

export const AdminReviewsPage = () => {
  const [status, setStatus] = useState('PENDING');
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const load = useCallback(() => {
    setLoading(true);
    adminService.listReviews({ status }).then((res) => setReviews(res.data)).finally(() => setLoading(false));
  }, [status]);

  useEffect(() => { load(); }, [load]);

  const moderate = async (review, newStatus) => {
    try {
      await adminService.moderateReview(review._id, newStatus);
      toast.success(`Review marked as ${newStatus.toLowerCase()}.`);
      setReviews((r) => r.filter((x) => x._id !== review._id));
    } catch (err) {
      toast.error(parseApiError(err).message);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--color-ink)]">Reviews</h1>
        <p className="mt-1 text-sm text-[var(--color-ink-soft)]">Moderate reviews before they appear publicly.</p>
      </div>

      <div className="flex gap-2">
        {['PENDING', 'APPROVED', 'REJECTED', 'SPAM'].map((s) => (
          <button key={s} onClick={() => setStatus(s)} className={`rounded-full px-3 py-1.5 text-xs font-medium ${status === s ? 'bg-[var(--color-teal-600)] text-white' : 'bg-[var(--color-paper-dim)] text-[var(--color-ink-soft)]'}`}>
            {s.charAt(0) + s.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="card overflow-hidden">{Array.from({ length: 4 }).map((_, i) => <RowSkeleton key={i} />)}</div>
      ) : reviews.length === 0 ? (
        <div className="card"><EmptyState icon={FaStar} title="No reviews here" description="Nothing to moderate in this status." /></div>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div key={r._id} className="card p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-[var(--color-ink)]">{r.facility?.name}</p>
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-[var(--color-sand-700)]">
                    {Array.from({ length: 5 }).map((_, i) => <FaStar key={i} size={11} className={i < r.rating ? '' : 'opacity-25'} />)}
                    <span className="ml-1 text-[var(--color-ink-soft)]">by {r.reviewerName} · {timeAgo(r.createdAt)}</span>
                  </p>
                  {r.review && <p className="mt-2 text-sm text-[var(--color-ink-soft)]">{r.review}</p>}
                </div>
                {status === 'PENDING' && (
                  <div className="flex shrink-0 gap-1.5">
                    <button onClick={() => moderate(r, 'APPROVED')} className="rounded-lg p-2 text-[var(--color-green-600)] hover:bg-[var(--color-green-100)]" title="Approve"><FaCheck size={14} /></button>
                    <button onClick={() => moderate(r, 'REJECTED')} className="rounded-lg p-2 text-[var(--color-red-600)] hover:bg-[var(--color-red-100)]" title="Reject"><FaXmark size={14} /></button>
                    <button onClick={() => moderate(r, 'SPAM')} className="rounded-lg p-2 text-[var(--color-amber-600)] hover:bg-[var(--color-amber-100)]" title="Mark as spam"><FaTriangleExclamation size={14} /></button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
